import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function importConfigStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  await drush(
    "ai-site-builder:import-config",
    [`--industry=${config.industry}`],
    drushOptions
  );

  logger.info(`Industry config imported for ${config.industry}.`, {
    step: "import-config",
  });

  return {
    success: true,
    message: `Industry config imported: ${config.industry}`,
  };
}
