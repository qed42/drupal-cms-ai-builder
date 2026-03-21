import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Install and set the active design system theme.
 * Reads the theme name from the provisioning config's designSystemTheme field,
 * defaulting to "space_ds" for backward compatibility.
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
  const themeName = (config as Record<string, unknown>).designSystemTheme as string ?? "space_ds";

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
