import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function configureSiteStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  await drush("ai-site-builder:configure-site", [], drushOptions);

  logger.info("Site configuration finalized.", { step: "configure-site" });

  return {
    success: true,
    message: "Routes rebuilt, aliases generated, caches cleared",
  };
}
