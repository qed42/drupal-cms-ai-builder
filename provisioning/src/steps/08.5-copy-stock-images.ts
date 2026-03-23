/**
 * Provisioning step: copy uploaded/stock images from platform-app uploads
 * into Drupal's public files directory and rewrite blueprint paths.
 * TASK-280f: Provisioning Image Copy
 *
 * Handles two image sources:
 *   1. Stock images:  /uploads/stock/{siteId}/...  (from Pexels enhance phase)
 *   2. User uploads:  /uploads/{userId}/...        (logo, palette from onboarding)
 *
 * Also processes header/footer component trees, not just page sections.
 */

import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import path from "path";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/** Prefixes for local image paths that need to be copied into Drupal. */
const UPLOAD_PREFIXES = ["/uploads/stock/", "/uploads/"];

/**
 * Copy uploaded images and rewrite src paths in the blueprint JSON.
 */
export async function copyStockImagesStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const blueprintPath = config.blueprintPath;

  // Read the blueprint
  const raw = await readFile(blueprintPath, "utf-8");
  const blueprint = JSON.parse(raw);

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

  /**
   * Copy a single image from platform-app public/ to Drupal files/.
   * Returns the new Drupal-relative path, or null on failure.
   */
  async function copyAndRewrite(imgObj: { src: string }): Promise<string | null> {
    if (!isLocalUploadPath(imgObj.src)) return null;

    const filename = path.basename(imgObj.src);

    // Source: /workspace/platform-app/public{imgObj.src}
    // In Docker, platform-app is mounted at /workspace/platform-app (see docker-compose.yml)
    const sourcePath = path.join("/workspace/platform-app", "public", imgObj.src);

    // Destination: drupal-site/web/sites/{domain}/files/stock/{filename}
    await mkdir(siteFilesDir, { recursive: true });
    const destPath = path.join(siteFilesDir, filename);

    try {
      await copyFile(sourcePath, destPath);
      imagesCopied++;
    } catch (err) {
      logger.warn(`Failed to copy image ${sourcePath}: ${err}`, { step: "copy-stock-images" });
      return null;
    }

    const newSrc = `/sites/${config.domain}/files/stock/${filename}`;
    pathsRewritten++;
    return newSrc;
  }

  /**
   * Rewrite image paths inside a flat component tree array.
   */
  async function rewriteComponentTree(tree: Array<Record<string, unknown>>): Promise<void> {
    for (const item of tree) {
      const inputs = item.inputs as Record<string, unknown> | undefined;
      if (!inputs) continue;

      for (const [key, value] of Object.entries(inputs)) {
        if (!isImageObject(value)) continue;
        const imgObj = value as { src: string; alt: string; width: number; height: number };
        const newSrc = await copyAndRewrite(imgObj);
        if (newSrc) {
          imgObj.src = newSrc;
          inputs[key] = imgObj;
        }
      }
    }
  }

  // ── Process page sections + component trees ──
  if (Array.isArray(blueprint.pages)) {
    for (const page of blueprint.pages) {
      // Section props
      if (Array.isArray(page.sections)) {
        for (const section of page.sections) {
          if (!section.props) continue;

          for (const [key, value] of Object.entries(section.props)) {
            if (!isImageObject(value)) continue;
            const imgObj = value as { src: string; alt: string; width: number; height: number };
            const newSrc = await copyAndRewrite(imgObj);
            if (newSrc) {
              imgObj.src = newSrc;
              section.props[key] = imgObj;
            }
          }
        }
      }

      // Page component tree
      if (Array.isArray(page.component_tree)) {
        await rewriteComponentTree(page.component_tree);
      }
    }
  }

  // ── Process header component tree ──
  if (Array.isArray(blueprint.header?.component_tree)) {
    await rewriteComponentTree(blueprint.header.component_tree);
  }

  // ── Process footer component tree ──
  if (Array.isArray(blueprint.footer?.component_tree)) {
    await rewriteComponentTree(blueprint.footer.component_tree);
  }

  // ── Process brand logo_url (string, not image object) ──
  if (typeof blueprint.brand?.logo_url === "string" && isLocalUploadPath(blueprint.brand.logo_url)) {
    const newSrc = await copyAndRewrite({ src: blueprint.brand.logo_url });
    if (newSrc) {
      blueprint.brand.logo_url = newSrc;
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

/** Check if a path is a local upload path that needs copying. */
function isLocalUploadPath(src: string): boolean {
  return UPLOAD_PREFIXES.some((prefix) => src.startsWith(prefix));
}
