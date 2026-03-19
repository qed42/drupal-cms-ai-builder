#!/usr/bin/env tsx

import { program } from "commander";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createLogger } from "./utils/logger.js";
import { dropDatabase } from "./utils/database.js";
import { createDatabaseStep } from "./steps/01-create-database.js";
import { generateSettingsStep } from "./steps/02-generate-settings.js";
import { updateSitesStep } from "./steps/03-update-sites.js";
import { installDrupalStep } from "./steps/04-install-drupal.js";
import { installThemeStep } from "./steps/05-install-theme.js";
import { enableModulesStep } from "./steps/06-enable-modules.js";
import { importConfigStep } from "./steps/07-import-config.js";
import { importBlueprintStep } from "./steps/08-import-blueprint.js";
import { copyStockImagesStep } from "./steps/08.5-copy-stock-images.js";
import { applyBrandStep } from "./steps/09-apply-brand.js";
import { configureSiteStep } from "./steps/10-configure-site.js";
import { callbackStep, sendFailureCallback } from "./steps/11-callback.js";
import type { ProvisioningConfig, RollbackAction } from "./types.js";
import { rm } from "node:fs/promises";
import { join } from "node:path";

program
  .name("provision")
  .description("Provision a new Drupal CMS site from a blueprint")
  .requiredOption("--blueprint <path>", "Path to blueprint JSON file")
  .requiredOption("--domain <domain>", "Domain for the new site")
  .requiredOption("--email <email>", "Admin email address")
  .requiredOption("--site-name <name>", "Site name")
  .requiredOption("--site-id <id>", "Site ID in the platform")
  .option("--industry <type>", "Industry type", "professional_services")
  .option(
    "--drupal-root <path>",
    "Path to Drupal root",
    resolve(import.meta.dirname, "../../drupal-site")
  )
  .option("--db-host <host>", "Database host", "db")
  .option("--db-port <port>", "Database port", "3306")
  .option("--db-user <user>", "Database user", "db")
  .option("--db-password <password>", "Database password", "db")
  .option("--callback-url <url>", "Platform API callback URL")
  .parse();

const opts = program.opts();

const config: ProvisioningConfig = {
  blueprintPath: resolve(opts.blueprint),
  domain: opts.domain,
  email: opts.email,
  siteName: opts.siteName,
  siteId: opts.siteId,
  industry: opts.industry,
  drupalRoot: resolve(opts.drupalRoot),
  database: {
    host: opts.dbHost,
    port: parseInt(opts.dbPort, 10),
    user: opts.dbUser,
    password: opts.dbPassword,
  },
  callbackUrl: opts.callbackUrl,
};

// Validate inputs.
if (!existsSync(config.blueprintPath)) {
  console.error(`Blueprint file not found: ${config.blueprintPath}`);
  process.exit(1);
}

if (!existsSync(config.drupalRoot)) {
  console.error(`Drupal root not found: ${config.drupalRoot}`);
  process.exit(1);
}

const logger = createLogger(config.siteId);
const rollbackActions: RollbackAction[] = [];

/**
 * Execute provisioning steps sequentially with rollback tracking.
 */
async function provision(): Promise<void> {
  const startTime = Date.now();
  logger.info("Starting provisioning...", { step: "init" });
  logger.info(`Blueprint: ${config.blueprintPath}`, { step: "init" });
  logger.info(`Domain: ${config.domain}`, { step: "init" });
  logger.info(`Industry: ${config.industry}`, { step: "init" });

  const steps = [
    { name: "Create database", fn: createDatabaseStep },
    { name: "Generate settings.php", fn: generateSettingsStep },
    { name: "Update sites.php", fn: updateSitesStep },
    { name: "Install Drupal CMS", fn: installDrupalStep },
    { name: "Install Space DS theme", fn: installThemeStep },
    { name: "Enable modules", fn: enableModulesStep },
    { name: "Import industry config", fn: importConfigStep },
    { name: "Import blueprint", fn: importBlueprintStep },
    { name: "Copy stock images", fn: copyStockImagesStep },
    { name: "Apply brand tokens", fn: applyBrandStep },
    { name: "Configure site", fn: configureSiteStep },
    { name: "Platform callback", fn: callbackStep },
  ];

  // Register rollback for database after step 1.
  rollbackActions.push({
    name: "Drop database",
    execute: async () => {
      await dropDatabase(`site_${config.siteId}`, config.database, logger);
    },
  });

  // Register rollback for settings directory after step 2.
  rollbackActions.push({
    name: "Remove site directory",
    execute: async () => {
      const sitesDir = join(config.drupalRoot, "web", "sites", config.domain);
      await rm(sitesDir, { recursive: true, force: true });
      logger.info(`Removed ${sitesDir}`, { step: "rollback" });
    },
  });

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNum = i + 1;
    logger.info(`[${stepNum}/${steps.length}] ${step.name}...`, {
      step: step.name,
    });

    try {
      const result = await step.fn(config, logger);
      logger.info(
        `[${stepNum}/${steps.length}] ${step.name}: ${result.message}`,
        { step: step.name }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      logger.error(
        `[${stepNum}/${steps.length}] ${step.name} FAILED: ${message}`,
        { step: step.name }
      );

      // If the callback step itself fails, the site is already provisioned —
      // don't roll back the entire Drupal installation.
      if (step.name === "Platform callback") {
        logger.warn("Callback failed but site is provisioned. Skipping rollback.", { step: "callback" });
        process.exit(1);
      }

      // Notify the platform about the failure before rolling back.
      await sendFailureCallback(config, `Step "${step.name}" failed: ${message}`, logger);
      await rollback();
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info(`Provisioning complete in ${elapsed}s. Site live at https://${config.domain}`, {
    step: "done",
  });
}

/**
 * Execute rollback actions in reverse order.
 */
async function rollback(): Promise<void> {
  logger.info("Rolling back...", { step: "rollback" });

  for (const action of [...rollbackActions].reverse()) {
    try {
      await action.execute();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      logger.error(`Rollback "${action.name}" failed: ${message}`, {
        step: "rollback",
      });
    }
  }

  logger.info("Rollback complete.", { step: "rollback" });
}

provision().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`, { step: "fatal" });
  process.exit(1);
});
