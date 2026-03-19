/**
 * Enhance phase: inject stock images into the generated blueprint.
 * Runs after Generate, before blueprint is saved.
 * TASK-280d: Enhance Phase
 */

import { prisma } from "@/lib/prisma";
import { extractImageIntents } from "@/lib/images/image-intent";
import { searchStockImage, clearImageCache } from "@/lib/images/stock-image-service";
import { downloadStockImage } from "@/lib/images/image-downloader";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import type { BlueprintBundle, PageLayout } from "@/lib/blueprint/types";

export interface EnhancePhaseResult {
  imagesAdded: number;
  imagesFailed: number;
  durationMs: number;
}

/**
 * Canvas image object shape matching json-schema-definitions://canvas.module/image.
 */
interface CanvasImageObject {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Run the enhance phase on a generated blueprint.
 * Fetches stock images for all image-capable components and injects them.
 * Failures are graceful — sections without images still render.
 */
export async function runEnhancePhase(
  siteId: string,
  blueprint: BlueprintBundle
): Promise<EnhancePhaseResult> {
  const startTime = Date.now();
  clearImageCache();

  const industry = blueprint.site.industry || "business";
  const audience = blueprint.site.audience || "";

  // Extract all image slots from the blueprint
  const intents = extractImageIntents(blueprint.pages, industry, audience);

  if (intents.length === 0) {
    return { imagesAdded: 0, imagesFailed: 0, durationMs: Date.now() - startTime };
  }

  console.log(`[enhance] Found ${intents.length} image slots across ${blueprint.pages.length} pages`);

  let imagesAdded = 0;
  let imagesFailed = 0;

  // Process intents sequentially to respect API rate limits
  for (const intent of intents) {
    try {
      // Search for a stock image
      const searchResult = await searchStockImage(intent.query, {
        orientation: intent.orientation,
      });

      if (!searchResult) {
        imagesFailed++;
        continue;
      }

      // Download the image locally
      const downloaded = await downloadStockImage(
        searchResult.url,
        siteId,
        searchResult.alt,
        intent.targetWidth,
        intent.targetHeight
      );

      if (!downloaded) {
        imagesFailed++;
        continue;
      }

      // Build Canvas-compatible image object
      const imageObj: CanvasImageObject = {
        src: downloaded.localPath,
        alt: downloaded.alt,
        width: intent.targetWidth,
        height: intent.targetHeight,
      };

      // Inject into the section's props
      const page = blueprint.pages[intent.pageIndex];
      const section = page.sections[intent.sectionIndex];
      section.props[intent.propName] = imageObj;

      imagesAdded++;
    } catch (err) {
      console.warn(`[enhance] Failed to process image for page ${intent.pageIndex}, section ${intent.sectionIndex}:`, err);
      imagesFailed++;
    }
  }

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
  console.log(`[enhance] Complete: ${imagesAdded} images added, ${imagesFailed} failed in ${durationMs}ms`);

  return { imagesAdded, imagesFailed, durationMs };
}
