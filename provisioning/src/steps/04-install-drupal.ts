import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function installDrupalStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const dbName = `site_${config.siteId}`;
  const dbUrl = `mysql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${dbName}`;

  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  await drush(
    "site:install",
    [
      "drupal_cms_installer",
      `--sites-subdir=${config.domain}`,
      `--db-url=${dbUrl}`,
      `--site-name=${config.siteName}`,
      `--account-mail=${config.email}`,
      "--account-name=admin",
      "--account-pass=admin",
    ],
    drushOptions
  );

  logger.info("Drupal CMS installed successfully.", {
    step: "install-drupal",
  });

  return {
    success: true,
    message: "Drupal installed with drupal_cms_installer profile",
  };
}
