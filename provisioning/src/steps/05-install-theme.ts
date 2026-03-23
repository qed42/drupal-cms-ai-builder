import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * ALL module dependencies that must be enabled before a theme's config
 * can be imported.  For themes using phased install (see
 * THEMES_WITH_SELF_REFERENCING_LAYOUTS), Drupal's automatic dependency
 * resolution is bypassed, so every module dependency from the theme's
 * .info.yml must be listed here.
 *
 * Sourced from civictheme.info.yml `dependencies:` key.
 * Core modules that are always present (config, user, taxonomy, etc.)
 * are included for safety — `drush en` is a no-op for already-enabled modules.
 */
const THEME_PREREQUISITES: Record<string, string[]> = {
  civictheme: [
    // Core modules
    "block_content",
    "ckeditor5",
    "content_moderation",
    "datetime_range",
    "help",
    "image",
    "inline_form_errors",
    "layout_builder",
    "layout_discovery",
    "media",
    "media_library",
    "options",
    "rest",
    "shortcut",
    "taxonomy",
    "views",
    // Contrib modules (must be in filesystem via composer)
    "components",
    "focal_point",
    "field_group",
    "layout_builder_restrictions",
    "linkit",
    "menu_block",
    "paragraphs",
    "pathauto",
    "redirect",
    "webform",
  ],
};

/**
 * Themes whose config/install files reference layout plugins defined in
 * their own .layouts.yml.  Standard `theme:install` fails because it
 * imports config before the layout plugins are discovered.
 *
 * For these themes we split installation into separate drush commands
 * (separate PHP processes) so that the layout plugins are fully
 * registered before config import runs.
 */
const THEMES_WITH_SELF_REFERENCING_LAYOUTS = new Set(["civictheme"]);

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

  if (THEMES_WITH_SELF_REFERENCING_LAYOUTS.has(themeName)) {
    // Split installation: CivicTheme's config/install files reference its
    // own layout plugins (e.g. civictheme_three_columns).  A single
    // `theme:install` call fails because config import runs before the
    // theme's .layouts.yml is discovered.
    //
    // Fix: register the theme in core.extension first, rebuild the
    // container (separate PHP process → layout plugins discovered), then
    // import the theme's default config in a third process.

    logger.info(
      `Using phased install for ${themeName} (self-referencing layout plugins)`,
      { step: "install-theme" }
    );

    // Phase 1 — Register theme in core.extension + refresh theme data.
    await drush("php:eval", [
      [
        `$config = \\Drupal::configFactory()->getEditable('core.extension');`,
        `$themes = $config->get('theme');`,
        `$themes['${themeName}'] = 0;`,
        `$config->set('theme', $themes)->save();`,
        `\\Drupal::service('theme_handler')->refreshInfo();`,
      ].join(" "),
    ], drushOptions);

    // Phase 2 — Rebuild cache in a fresh PHP process so the layout
    // plugin manager discovers plugins from the theme's .layouts.yml.
    await drush("cr", [], drushOptions);

    // Phase 3 — Import the theme's default config (layout plugins are
    // now available so civictheme_three_columns resolves).
    await drush("php:eval", [
      [
        `\\Drupal::service('config.installer')->installDefaultConfig('theme', '${themeName}');`,
        `\\Drupal::moduleHandler()->invokeAll('themes_installed', [['${themeName}']]);`,
      ].join(" "),
    ], drushOptions);
  } else {
    // Standard single-command install for themes without circular deps.
    await drush("theme:install", [themeName], drushOptions);
  }

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
