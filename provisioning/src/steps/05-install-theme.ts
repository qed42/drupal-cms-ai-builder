import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function installThemeStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  // Install Space DS theme.
  await drush("theme:install", ["space_ds"], drushOptions);

  // Set as default theme.
  await drush(
    "config:set",
    ["system.theme", "default", "space_ds"],
    drushOptions
  );

  // Rebuild cache to register components in Canvas.
  await drush("cr", [], drushOptions);

  logger.info("Space DS theme installed and set as default.", {
    step: "install-theme",
  });

  return {
    success: true,
    message: "Space DS theme installed, cache rebuilt for component discovery",
  };
}
