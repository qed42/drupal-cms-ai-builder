/**
 * Provisioning step: copy stock images from platform-app uploads
 * into Drupal's public files directory and rewrite blueprint paths.
 * TASK-280f: Provisioning Image Copy
 */

import { readFile, writeFile, mkdir, readdir, copyFile } from "fs/promises";
import path from "path";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Copy stock images and rewrite src paths in the blueprint JSON.
 */
export async function copyStockImagesStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const blueprintPath = config.blueprintPath;

  // Read the blueprint
  const raw = await readFile(blueprintPath, "utf-8");
  const blueprint = JSON.parse(raw);

  if (!blueprint.pages || !Array.isArray(blueprint.pages)) {
    return { success: true, message: "No pages in blueprint, skipping image copy" };
  }

  const siteFilesDir = path.join(
    config.drupalRoot,
    "web",
    "sites",
    config.domain,
    "files",
    "stock"
  );

  let imagesCopied = 0;
  let pathsRewritten = 0;

  // Scan all pages/sections for image objects with /uploads/stock/ paths
  for (const page of blueprint.pages) {
    if (!page.sections) continue;

    for (const section of page.sections) {
      if (!section.props) continue;

      for (const [key, value] of Object.entries(section.props)) {
        if (!isImageObject(value)) continue;

        const imgObj = value as { src: string; alt: string; width: number; height: number };

        // Only rewrite local stock image paths
        if (!imgObj.src.startsWith("/uploads/stock/")) continue;

        const filename = path.basename(imgObj.src);

        // Source: /app/public/uploads/stock/{siteId}/{filename}
        // In Docker, platform-app is mounted at /app, provisioning at /provisioning
        const sourcePath = path.join("/app", "public", imgObj.src);

        // Destination: drupal-site/web/sites/{domain}/files/stock/{filename}
        await mkdir(siteFilesDir, { recursive: true });
        const destPath = path.join(siteFilesDir, filename);

        try {
          await copyFile(sourcePath, destPath);
          imagesCopied++;
        } catch (err) {
          logger.warn(`Failed to copy image ${sourcePath}: ${err}`, { step: "copy-stock-images" });
          continue;
        }

        // Rewrite path in blueprint
        const newSrc = `/sites/${config.domain}/files/stock/${filename}`;
        imgObj.src = newSrc;
        section.props[key] = imgObj;
        pathsRewritten++;
      }
    }

    // Also rewrite paths in component_tree inputs
    if (page.component_tree) {
      for (const item of page.component_tree) {
        if (!item.inputs) continue;

        for (const [key, value] of Object.entries(item.inputs)) {
          if (!isImageObject(value)) continue;

          const imgObj = value as { src: string; alt: string; width: number; height: number };
          if (!imgObj.src.startsWith("/uploads/stock/")) continue;

          const filename = path.basename(imgObj.src);
          imgObj.src = `/sites/${config.domain}/files/stock/${filename}`;
          item.inputs[key] = imgObj;
        }
      }
    }
  }

  // Write the updated blueprint back
  if (pathsRewritten > 0) {
    await writeFile(blueprintPath, JSON.stringify(blueprint, null, 2), "utf-8");
    logger.info(`Rewrote ${pathsRewritten} image paths in blueprint.`, { step: "copy-stock-images" });
  }

  logger.info(`Copied ${imagesCopied} stock images to ${siteFilesDir}.`, { step: "copy-stock-images" });

  return {
    success: true,
    message: `${imagesCopied} images copied, ${pathsRewritten} paths rewritten`,
    data: { imagesCopied, pathsRewritten },
  };
}

function isImageObject(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "src" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>).src === "string"
  );
}
