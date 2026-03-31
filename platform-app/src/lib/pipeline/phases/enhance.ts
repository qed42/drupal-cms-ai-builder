/**
 * Enhance phase: inject images into the generated blueprint.
 * Prioritizes user-uploaded images over Pexels stock photos.
 * Runs after Generate, before blueprint is saved.
 * TASK-280d: Enhance Phase
 * TASK-441: User image priority
 * TASK-505: Code component image enhancement
 */

import { prisma } from "@/lib/prisma";
import { resolveImagesForSections } from "@/lib/images/image-resolver";
import { searchStockImage } from "@/lib/images/stock-image-service";
import { clearImageCache } from "@/lib/images/stock-image-service";
import { downloadStockImage } from "@/lib/images/image-downloader";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import { rankImages } from "@/lib/images/image-matcher";
import { wrapAsCanvasTreeNode } from "@/lib/code-components/config-builder";
import type { BlueprintBundle, PageSection, UserImageManifestEntry } from "@/lib/blueprint/types";
import type { UserImage } from "@/lib/images/image-matcher";

export interface EnhancePhaseResult {
  imagesAdded: number;
  imagesFailed: number;
  durationMs: number;
}

/**
 * Run the enhance phase on a generated blueprint.
 * Loads user-uploaded images from the onboarding session and passes them
 * to the image resolver for priority matching. Falls back to Pexels stock
 * when no user image matches or when user opted for stock-only.
 */
export async function runEnhancePhase(
  siteId: string,
  blueprint: BlueprintBundle
): Promise<EnhancePhaseResult> {
  const startTime = Date.now();
  clearImageCache();

  const industry = blueprint.site.industry || "business";
  const audience = blueprint.site.audience || "";

  // Load user images from onboarding session (TASK-441)
  const userImages = await loadUserImages(siteId);
  if (userImages) {
    console.log(`[enhance] Found ${userImages.length} user-uploaded images`);
  }

  let totalImagesAdded = 0;
  let totalImagesFailed = 0;

  const isCodeComponentMode = !!blueprint._codeComponents;

  if (isCodeComponentMode) {
    // TASK-505: Code component image enhancement
    console.log("[enhance] Code component mode — enhancing JSX image props");
    const { imagesAdded, imagesFailed } = await enhanceCodeComponentImages(
      siteId,
      blueprint,
      industry,
      audience,
      userImages
    );
    totalImagesAdded += imagesAdded;
    totalImagesFailed += imagesFailed;
  } else {
    // SDC mode: use design system adapter image mappings
    for (const page of blueprint.pages) {
      if (!page.sections || page.sections.length === 0) continue;

      const { imagesAdded, imagesFailed } = await resolveImagesForSections(
        siteId,
        page.sections,
        page.title,
        industry,
        audience,
        userImages
      );

      totalImagesAdded += imagesAdded;
      totalImagesFailed += imagesFailed;
    }

    // Rebuild component trees for all pages (images are now in props)
    for (const page of blueprint.pages) {
      page.component_tree = buildComponentTree(page.sections);
    }
  }

  // Write user_images manifest to blueprint (TASK-442)
  // Includes ALL uploads — both placed and unplaced — so provisioning
  // can create Drupal Media entities for every uploaded image.
  blueprint.user_images = buildUserImagesManifest(siteId, userImages);

  // Update the blueprint in the database with images
  await prisma.blueprint.update({
    where: { siteId },
    data: {
      payload: JSON.parse(JSON.stringify(blueprint)),
      generationStep: "ready",
    },
  });

  const durationMs = Date.now() - startTime;
  console.log(`[enhance] Complete: ${totalImagesAdded} images added, ${totalImagesFailed} failed in ${durationMs}ms`);

  return { imagesAdded: totalImagesAdded, imagesFailed: totalImagesFailed, durationMs };
}

/**
 * TASK-505: Enhance code component sections by replacing image placeholder
 * props with real stock/user images. Parses _codeComponents metadata to find
 * image-typed props, resolves images, and updates both section.props and
 * the YAML config strings.
 */
async function enhanceCodeComponentImages(
  siteId: string,
  blueprint: BlueprintBundle,
  industry: string,
  audience: string,
  userImages?: UserImage[]
): Promise<{ imagesAdded: number; imagesFailed: number }> {
  let imagesAdded = 0;
  let imagesFailed = 0;
  const usedPhotoIds = new Set<string>();
  const usedUserImageIds = new Set<string>();
  const MATCH_THRESHOLD = 0.25;

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const meta = section._meta?.codeComponent;
      if (!meta) continue;

      // Find image-type props from the config YAML
      const configYaml = blueprint._codeComponents?.configs[meta.machineName];
      if (!configYaml) continue;

      const imageProps = findImagePropsFromConfig(configYaml);
      if (imageProps.length === 0) continue;

      for (const propName of imageProps) {
        const currentVal = section.props[propName];
        // Skip if already a resolved image object with a real URL
        if (currentVal && typeof currentVal === "object" && !Array.isArray(currentVal)) {
          const obj = currentVal as Record<string, unknown>;
          if (typeof obj.url === "string" && !isPlaceholderUrl(obj.url)) continue;
        }

        // Build search query from section context
        const query = buildCodeComponentSearchQuery(section, page.title, industry, audience);

        // Try user images first
        let resolved = false;
        if (userImages && userImages.length > 0) {
          const candidates = rankImages(
            userImages,
            {
              textContent: query,
              componentType: meta.machineName,
              orientation: "landscape" as const,
              pageTitle: page.title,
            },
            usedUserImageIds
          );

          const best = candidates[0];
          if (best && best.score >= MATCH_THRESHOLD) {
            const matched = userImages.find((img) => img.id === best.imageId);
            if (matched) {
              const userImg = matched as UserImage & { url?: string; file_url?: string };
              const src = userImg.url || userImg.file_url || "";
              section.props[propName] = { url: src, alt: matched.description };
              usedUserImageIds.add(best.imageId);
              if (!section._meta) section._meta = {};
              section._meta.imageQuery = query;
              section._meta.imageSource = "user";
              section._meta.imageMatchScore = best.score;
              imagesAdded++;
              resolved = true;
            }
          }
        }

        // Pexels fallback
        if (!resolved) {
          try {
            const stockResult = await searchStockImage(query, {
              orientation: "landscape",
              excludeIds: Array.from(usedPhotoIds),
            });
            if (stockResult) {
              const downloaded = await downloadStockImage(
                stockResult.url,
                siteId,
                stockResult.alt,
                1200,
                800
              );
              if (downloaded) {
                section.props[propName] = { url: downloaded.localPath, alt: downloaded.alt };
                usedPhotoIds.add(stockResult.photoId);
                if (!section._meta) section._meta = {};
                section._meta.imageQuery = query;
                section._meta.imageSource = "stock";
                imagesAdded++;
                resolved = true;
              }
            }
          } catch (err) {
            console.warn(`[enhance] Stock image fetch failed for "${query}":`, err);
          }
          if (!resolved) imagesFailed++;
        }
      }

      // Update the YAML config with resolved image prop values
      updateCodeComponentConfig(blueprint, meta.machineName, section.props, imageProps);
    }

    // Rebuild component tree for code component pages
    page.component_tree = page.sections
      .filter((s) => !s.component_id.startsWith("js.failed_"))
      .map((s) => {
        const machineName = s.component_id.replace("js.", "");
        return wrapAsCanvasTreeNode(machineName, s.props);
      });
  }

  return { imagesAdded, imagesFailed };
}

/**
 * Parse a Canvas YAML config string to find image-type prop names.
 *
 * Canvas image props have this structure:
 *   props:
 *     hero_image:
 *       title: Hero Image
 *       type: object
 *       examples:
 *         - src: 'https://placehold.co/1200x800'
 *           ...
 *       $ref: 'json-schema-definitions://canvas.module/image'
 *
 * We detect image props by finding `$ref` lines containing `canvas.module/image`.
 */
function findImagePropsFromConfig(configYaml: string): string[] {
  const imageProps: string[] = [];
  const lines = configYaml.split("\n");

  let currentProp = "";
  let inProps = false;

  for (const line of lines) {
    // Detect the top-level props: block
    if (/^props:/.test(line)) {
      inProps = true;
      continue;
    }

    // Stop if we hit a top-level key after props
    if (inProps && /^\S/.test(line) && !line.startsWith("props:")) {
      inProps = false;
      break;
    }

    if (!inProps) continue;

    // Detect prop names (indent 2 under props:)
    const propMatch = line.match(/^  (\w+):$/);
    if (propMatch) {
      currentProp = propMatch[1];
      continue;
    }

    // Detect $ref for canvas image
    if (currentProp && line.includes("canvas.module/image")) {
      imageProps.push(currentProp);
    }
  }

  return imageProps;
}

/**
 * Check if a URL is a placeholder that should be replaced.
 */
function isPlaceholderUrl(url: string): boolean {
  return (
    url.includes("placeholder") ||
    url.includes("example.com") ||
    url.includes("placehold.co") ||
    url.includes("via.placeholder") ||
    url === "" ||
    url === "#"
  );
}

/**
 * Build a stock image search query from code component section context.
 */
function buildCodeComponentSearchQuery(
  section: PageSection,
  pageTitle: string,
  industry: string,
  _audience: string
): string {
  // Use content brief from metadata
  if (section._meta?.contentBrief) {
    const words = section._meta.contentBrief.split(/\s+/).slice(0, 4).join(" ");
    return `${industry} ${words}`.trim();
  }

  // Use heading from props
  const heading = section.props.heading || section.props.title;
  if (typeof heading === "string" && heading) {
    return `${industry} ${heading.split(/\s+/).slice(0, 3).join(" ")}`.trim();
  }

  return `${industry} ${pageTitle} professional`.trim();
}

/**
 * Update the _codeComponents.configs YAML with resolved image URLs.
 * Replaces placeholder image URLs in the `examples` block.
 *
 * Canvas image prop structure:
 *   hero_image:
 *     ...
 *     examples:
 *       - src: 'https://placehold.co/1200x800'
 *         width: 1200
 *         height: 800
 *         alt: 'Hero background'
 */
function updateCodeComponentConfig(
  blueprint: BlueprintBundle,
  machineName: string,
  sectionProps: Record<string, unknown>,
  imageProps: string[]
): void {
  if (!blueprint._codeComponents) return;

  let configYaml = blueprint._codeComponents.configs[machineName];
  if (!configYaml) return;

  for (const propName of imageProps) {
    const val = sectionProps[propName];
    if (!val || typeof val !== "object") continue;
    const imgObj = val as Record<string, unknown>;
    const url = (imgObj.url || imgObj.src) as string;
    const alt = (imgObj.alt as string) || "";

    if (!url || isPlaceholderUrl(url)) continue;

    const escapedUrl = url.replace(/'/g, "''");
    const escapedAlt = alt.replace(/'/g, "''");

    // Replace src in the examples block under this prop
    configYaml = configYaml.replace(
      new RegExp(
        `(${escapeRegExp(propName)}:[\\s\\S]*?examples:[\\s\\S]*?src:)\\s*'[^']*'`,
        "m"
      ),
      `$1 '${escapedUrl}'`
    );
    // Replace alt in the examples block
    configYaml = configYaml.replace(
      new RegExp(
        `(${escapeRegExp(propName)}:[\\s\\S]*?examples:[\\s\\S]*?alt:)\\s*'[^']*'`,
        "m"
      ),
      `$1 '${escapedAlt}'`
    );
  }

  blueprint._codeComponents.configs[machineName] = configYaml;
}

/** Escape special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build the user_images manifest for the blueprint payload (TASK-442).
 * Includes ALL uploaded images regardless of whether they were matched.
 */
function buildUserImagesManifest(
  siteId: string,
  userImages: (UserImage & { url?: string; file_url?: string })[] | undefined
): UserImageManifestEntry[] {
  if (!userImages || userImages.length === 0) return [];

  return userImages.map((img) => ({
    id: img.id,
    file_url: img.url || img.file_url || `/uploads/${siteId}/images/${img.id}`,
    description: img.description,
    tags: img.tags,
    filename: img.id, // UUID-based filename from upload
  }));
}

/**
 * Load user-uploaded images from the onboarding session.
 * Returns undefined if user opted for stock-only or has no images.
 */
async function loadUserImages(siteId: string): Promise<UserImage[] | undefined> {
  const session = await prisma.onboardingSession.findFirst({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });

  if (!session) return undefined;

  const data = session.data as Record<string, unknown>;
  if (data.use_stock_only === true) return undefined;

  const rawImages = data.user_images as Array<Record<string, unknown>> | undefined;
  if (!rawImages || rawImages.length === 0) return undefined;

  // Map session data to UserImage interface expected by the matcher
  return rawImages
    .filter((img) => img.status === "ready")
    .map((img) => ({
      id: img.id as string,
      description: img.description as string,
      tags: (img.tags as string[]) || [],
      subject: (img.subject as UserImage["subject"]) || "abstract",
      orientation: (img.orientation as UserImage["orientation"]) || "landscape",
      // Carry through URL for image-resolver to inject into props
      url: img.url as string,
      file_url: img.file_url as string | undefined,
    }));
}
