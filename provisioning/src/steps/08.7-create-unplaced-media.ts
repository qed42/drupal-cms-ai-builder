/**
 * Provisioning step: create Drupal Media entities for user-uploaded images
 * that were NOT placed in the blueprint by the image matcher.
 *
 * TASK-444: Runs after step 08 (blueprint import), because placed images
 * already get Media entities via BlueprintImportService::resolveImageInputs().
 *
 * This step:
 * 1. Reads the user_images manifest from the blueprint
 * 2. Determines which images are "placed" (appear in section props)
 * 3. Copies unplaced images to Drupal files/user-images/ (if not already there)
 * 4. Writes a manifest JSON for the Drush import-media command
 * 5. Invokes drush ai-site-builder:import-media
 */

import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { tmpdir } from "os";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";
import { drush } from "../utils/drush.js";

interface UserImageManifestEntry {
  id: string;
  file_url: string;
  description: string;
  tags: string[];
  filename: string;
}

interface DrushManifestEntry {
  file: string;
  alt: string;
  name: string;
  bundle: string;
}

/**
 * Create Media entities for unplaced user-uploaded images.
 */
export async function createUnplacedMediaStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const raw = await readFile(config.blueprintPath, "utf-8");
  const blueprint = JSON.parse(raw);

  const userImages: UserImageManifestEntry[] = blueprint.user_images || [];

  if (userImages.length === 0) {
    logger.info("No user images in blueprint — skipping.", { step: "create-unplaced-media" });
    return { success: true, message: "No user images — skipped" };
  }

  // Collect IDs of images that were placed in the blueprint.
  // These are in section props with imageSource === "user" in _meta.
  const placedImageIds = collectPlacedImageIds(blueprint);

  // Filter to unplaced images only
  const unplaced = userImages.filter((img) => !placedImageIds.has(img.id));

  if (unplaced.length === 0) {
    logger.info("All user images were placed in the blueprint — no unplaced media to create.", { step: "create-unplaced-media" });
    return { success: true, message: "All images placed — no unplaced media" };
  }

  logger.info(`${unplaced.length} unplaced images need Media entities.`, { step: "create-unplaced-media" });

  // Ensure user-images directory exists in Drupal
  const userImagesDir = path.join(
    config.drupalRoot,
    "web",
    "sites",
    config.domain,
    "files",
    "user-images"
  );
  await mkdir(userImagesDir, { recursive: true });

  // Copy unplaced images that haven't been copied yet by step 08.5
  let copied = 0;
  for (const img of unplaced) {
    const filename = path.basename(img.file_url);
    const destPath = path.join(userImagesDir, filename);

    if (!existsSync(destPath)) {
      const sourcePath = path.join("/workspace/platform-app", "public", img.file_url);
      try {
        await copyFile(sourcePath, destPath);
        copied++;
      } catch (err) {
        logger.warn(`Failed to copy unplaced image ${sourcePath}: ${err}`, { step: "create-unplaced-media" });
      }
    }
  }

  if (copied > 0) {
    logger.info(`Copied ${copied} unplaced images to ${userImagesDir}.`, { step: "create-unplaced-media" });
  }

  // Build Drush manifest for unplaced images
  const drushManifest: DrushManifestEntry[] = unplaced.map((img) => ({
    file: `public://user-images/${path.basename(img.file_url)}`,
    alt: img.description,
    name: img.filename || path.basename(img.file_url),
    bundle: "image",
  }));

  // Write manifest to temp file
  const manifestPath = path.join(tmpdir(), `media-manifest-${config.siteId}.json`);
  await writeFile(manifestPath, JSON.stringify(drushManifest, null, 2), "utf-8");

  // Invoke Drush import-media command
  try {
    const output = await drush(
      "ai-site-builder:import-media",
      [`--manifest=${manifestPath}`],
      {
        sitesSubdir: config.domain,
        drupalRoot: config.drupalRoot,
        logger,
      }
    );

    logger.info(`Drush import-media output: ${output}`, { step: "create-unplaced-media" });
  } catch (err) {
    logger.warn(`Drush import-media failed: ${err}`, { step: "create-unplaced-media" });
    // Non-fatal — placed images still work, only unplaced media creation failed
  }

  return {
    success: true,
    message: `${unplaced.length} unplaced images processed for Media creation`,
    data: { unplacedCount: unplaced.length, copiedCount: copied },
  };
}

/**
 * Scan the blueprint to collect IDs of user images that were placed in sections.
 * A placed image has its URL in a section prop and _meta.imageSource === "user".
 */
function collectPlacedImageIds(blueprint: Record<string, unknown>): Set<string> {
  const placedIds = new Set<string>();
  const pages = blueprint.pages as Array<Record<string, unknown>> | undefined;
  const userImages = blueprint.user_images as UserImageManifestEntry[] | undefined;

  if (!pages || !userImages) return placedIds;

  // Build a URL→ID lookup from user_images manifest
  const urlToId = new Map<string, string>();
  for (const img of userImages) {
    urlToId.set(img.file_url, img.id);
    // Also map the rewritten Drupal path (after step 08.5)
    const filename = path.basename(img.file_url);
    urlToId.set(`/sites/${(blueprint as Record<string, unknown>).domain || ""}/files/user-images/${filename}`, img.id);
  }

  for (const page of pages) {
    const sections = page.sections as Array<Record<string, unknown>> | undefined;
    if (!sections) continue;

    for (const section of sections) {
      const meta = section._meta as Record<string, unknown> | undefined;
      if (meta?.imageSource !== "user") continue;

      // Scan all props for image objects with user image URLs
      const props = section.props as Record<string, unknown>;
      if (props) {
        for (const value of Object.values(props)) {
          if (value && typeof value === "object" && "src" in (value as Record<string, unknown>)) {
            const src = (value as Record<string, string>).src;
            const id = urlToId.get(src);
            if (id) placedIds.add(id);
          }
        }
      }

      // Also check children
      const children = section.children as Array<Record<string, unknown>> | undefined;
      if (children) {
        for (const child of children) {
          const childProps = child.props as Record<string, unknown>;
          if (!childProps) continue;
          for (const value of Object.values(childProps)) {
            if (value && typeof value === "object" && "src" in (value as Record<string, unknown>)) {
              const src = (value as Record<string, string>).src;
              const id = urlToId.get(src);
              if (id) placedIds.add(id);
            }
          }
        }
      }
    }
  }

  return placedIds;
}
