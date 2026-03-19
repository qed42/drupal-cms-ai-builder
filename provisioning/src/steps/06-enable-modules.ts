import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function enableModulesStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  // Enable additional required modules (toolbar needed by site_owner role config).
  await drush("en", ["toolbar", "webform", "metatag"], drushOptions);

  // Enable our custom module.
  await drush("en", ["ai_site_builder"], drushOptions);

  logger.info("Required modules enabled.", { step: "enable-modules" });

  return {
    success: true,
    message: "webform, metatag, ai_site_builder enabled",
  };
}
