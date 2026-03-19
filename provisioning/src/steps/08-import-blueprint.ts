import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function importBlueprintStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  await drush(
    "ai-site-builder:import-blueprint",
    [`--json=${config.blueprintPath}`],
    drushOptions
  );

  logger.info("Blueprint imported.", { step: "import-blueprint" });

  return {
    success: true,
    message: "Blueprint entities created (pages, content, forms)",
  };
}
