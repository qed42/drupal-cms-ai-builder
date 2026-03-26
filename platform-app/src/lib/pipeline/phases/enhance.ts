/**
 * Enhance phase: inject images into the generated blueprint.
 * Prioritizes user-uploaded images over Pexels stock photos.
 * Runs after Generate, before blueprint is saved.
 * TASK-280d: Enhance Phase
 * TASK-441: User image priority
 */

import { prisma } from "@/lib/prisma";
import { resolveImagesForSections } from "@/lib/images/image-resolver";
import { clearImageCache } from "@/lib/images/stock-image-service";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import type { BlueprintBundle, UserImageManifestEntry } from "@/lib/blueprint/types";
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

  // Process each page through the image resolver
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

  // Write user_images manifest to blueprint (TASK-442)
  // Includes ALL uploads — both placed and unplaced — so provisioning
  // can create Drupal Media entities for every uploaded image.
  blueprint.user_images = buildUserImagesManifest(siteId, userImages);

  // Rebuild component trees for all pages (images are now in props)
  for (const page of blueprint.pages) {
    page.component_tree = buildComponentTree(page.sections);
  }

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
