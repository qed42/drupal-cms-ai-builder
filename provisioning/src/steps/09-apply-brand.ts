import { writeFile, readFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { existsSync } from "node:fs";
import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function applyBrandStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  // Read the blueprint to extract brand tokens.
  const blueprintJson = await readFile(config.blueprintPath, "utf-8");
  const blueprint = JSON.parse(blueprintJson);

  if (!blueprint.brand) {
    logger.info("No brand tokens in blueprint, skipping.", {
      step: "apply-brand",
    });
    return { success: true, message: "No brand tokens to apply" };
  }

  // Copy logo file to Drupal's public files directory so Drush can access it.
  // The logo_url is a platform-app relative path (e.g., /uploads/{siteId}/logo.jpeg)
  // which doesn't exist inside the Drupal container.
  if (blueprint.brand.logo_url) {
    const logoUrl = blueprint.brand.logo_url;
    const platformLogoPath = join("/app", "public", logoUrl);
    const siteFilesDir = join(
      config.drupalRoot,
      "web",
      "sites",
      config.domain,
      "files"
    );

    await mkdir(siteFilesDir, { recursive: true });

    const logoFilename = basename(logoUrl);
    const logoDestPath = join(siteFilesDir, logoFilename);

    if (existsSync(platformLogoPath)) {
      await copyFile(platformLogoPath, logoDestPath);
      // Rewrite logo_url to a Drupal-resolvable path using the public:// stream wrapper.
      blueprint.brand.logo_url = `public://${logoFilename}`;
      logger.info(`Logo copied to ${logoDestPath}, path rewritten.`, { step: "apply-brand" });
    } else {
      logger.warn(`Logo source not found at ${platformLogoPath}, skipping logo.`, { step: "apply-brand" });
      delete blueprint.brand.logo_url;
    }
  }

  // Write brand tokens alongside the blueprint in the shared volume
  // so the DDEV web container can access them via docker exec.
  const tokensPath = join(dirname(config.blueprintPath), `tokens-${config.siteId}.json`);
  await writeFile(tokensPath, JSON.stringify(blueprint.brand), "utf-8");

  await drush(
    "ai-site-builder:apply-brand",
    [`--tokens=${tokensPath}`],
    drushOptions
  );

  logger.info("Brand tokens applied.", { step: "apply-brand" });

  return {
    success: true,
    message: "Brand tokens CSS generated and applied",
  };
}
