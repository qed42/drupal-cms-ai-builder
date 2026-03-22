import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Modules that must be enabled before a given theme can be installed.
 * CivicTheme registers Layout Builder plugins at install time, so
 * layout_builder must already be present.
 */
const THEME_PREREQUISITES: Record<string, string[]> = {
  civictheme: ["layout_builder"],
};

/**
 * Install and set the active design system theme.
 * Reads the theme name from the provisioning config's designSystemTheme field,
 * defaulting to "space_ds" for backward compatibility.
 *
 * Some themes (e.g. CivicTheme) require prerequisite modules to be enabled
 * before installation — this step handles that automatically.
 */
export async function installThemeStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  // Read theme from config, default to space_ds for backward compatibility
  const themeName = config.designSystemTheme ?? "space_ds";

  // Enable prerequisite modules before theme installation.
  const prerequisites = THEME_PREREQUISITES[themeName];
  if (prerequisites && prerequisites.length > 0) {
    logger.info(
      `Enabling prerequisite modules for ${themeName}: ${prerequisites.join(", ")}`,
      { step: "install-theme" }
    );
    await drush("en", prerequisites, drushOptions);
  }

  // Install the theme.
  await drush("theme:install", [themeName], drushOptions);

  // Set as default theme.
  await drush(
    "config:set",
    ["system.theme", "default", themeName],
    drushOptions
  );

  // Rebuild cache to register components in Canvas.
  await drush("cr", [], drushOptions);

  logger.info(`${themeName} theme installed and set as default.`, {
    step: "install-theme",
  });

  return {
    success: true,
    message: `${themeName} theme installed, cache rebuilt for component discovery`,
  };
}
