import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Map AI-classified industries to the narrower set supported by
 * ai_site_builder_content Drupal config. Unmapped industries fall
 * back to "universal".
 */
const INDUSTRY_MAP: Record<string, string> = {
  // Direct matches
  healthcare: "healthcare",
  legal: "legal",
  real_estate: "real_estate",
  restaurant: "restaurant",
  professional_services: "professional_services",
  universal: "universal",
  // Broader AI classifications → nearest Drupal industry
  food_and_beverage: "restaurant",
  hospitality: "restaurant",
  retail: "professional_services",
  education: "professional_services",
  fitness_and_wellness: "healthcare",
  technology: "professional_services",
  finance: "professional_services",
  nonprofit: "professional_services",
  construction: "professional_services",
  automotive: "professional_services",
  creative: "professional_services",
};

export async function importConfigStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  const mappedIndustry = INDUSTRY_MAP[config.industry] ?? "universal";
  if (mappedIndustry !== config.industry) {
    logger.info(
      `Mapped industry "${config.industry}" → "${mappedIndustry}" for Drupal config.`,
      { step: "import-config" }
    );
  }

  await drush(
    "ai-site-builder:import-config",
    [`--industry=${mappedIndustry}`],
    drushOptions
  );

  logger.info(`Industry config imported for ${mappedIndustry}.`, {
    step: "import-config",
  });

  return {
    success: true,
    message: `Industry config imported: ${mappedIndustry} (from ${config.industry})`,
  };
}
