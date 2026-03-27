#!/usr/bin/env tsx

import { program } from "commander";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
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
import { createUnplacedMediaStep } from "./steps/08.7-create-unplaced-media.js";
import { callbackStep, sendFailureCallback, sendProgressCallback } from "./steps/11-callback.js";
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
  .option("--theme <name>", "Design system theme machine name", "space_ds")
  .parse();

const opts = program.opts();

// Generate per-site database credentials.
const siteDbName = `site_${opts.siteId}`.replace(/[^a-zA-Z0-9_]/g, "");
const siteDbUser = `u_${opts.siteId}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32);
const siteDbPassword = randomBytes(32).toString("base64url");

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
  siteDatabase: {
    name: siteDbName,
    user: siteDbUser,
    password: siteDbPassword,
  },
  callbackUrl: opts.callbackUrl,
  designSystemTheme: opts.theme,
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
    { name: "Create database", label: "Setting up your website's foundation", fn: createDatabaseStep },
    { name: "Generate settings.php", label: "Configuring your site settings", fn: generateSettingsStep },
    { name: "Update sites.php", label: "Registering your website address", fn: updateSitesStep },
    { name: "Install Drupal CMS", label: "Building your website platform", fn: installDrupalStep },
    { name: `Install theme (${opts.theme})`, label: "Applying your design system", fn: installThemeStep },
    { name: "Enable modules", label: "Adding website features", fn: enableModulesStep },
    { name: "Import industry config", label: "Customizing for your industry", fn: importConfigStep },
    // TASK-285: Copy images and apply brand BEFORE importing the blueprint
    // so that rewritten paths (stock images, logo) are included in the import.
    { name: "Copy stock images", label: "Adding images to your pages", fn: copyStockImagesStep },
    { name: "Apply brand tokens", label: "Applying your brand colors and fonts", fn: applyBrandStep },
    { name: "Import blueprint", label: "Loading your content and pages", fn: importBlueprintStep },
    { name: "Create unplaced media", label: "Adding your photos to the media library", fn: createUnplacedMediaStep },
    { name: "Configure site", label: "Final site configuration", fn: configureSiteStep },
    { name: "Platform callback", label: "Completing setup", fn: callbackStep },
  ];

  // Register rollback for database and per-site user after step 1.
  rollbackActions.push({
    name: "Drop database and user",
    execute: async () => {
      await dropDatabase(
        config.siteDatabase.name,
        config.database,
        logger,
        config.siteDatabase.user
      );
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
    const totalSteps = steps.length;
    logger.info(`[${stepNum}/${totalSteps}] ${step.name}...`, {
      step: step.name,
    });

    // Send progress callback so the UI can show step-level progress.
    await sendProgressCallback(config, stepNum, totalSteps, step.label, logger);

    const stepStart = Date.now();
    try {
      const result = await step.fn(config, logger);
      const stepElapsed = ((Date.now() - stepStart) / 1000).toFixed(1);
      logger.info(
        `[${stepNum}/${totalSteps}] ${step.name}: ${result.message} (${stepElapsed}s)`,
        { step: step.name }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      const stepElapsed = ((Date.now() - stepStart) / 1000).toFixed(1);
      logger.error(
        `[${stepNum}/${totalSteps}] ${step.name} FAILED after ${stepElapsed}s: ${message}`,
        { step: step.name }
      );

      // If the callback step itself fails, the site is already provisioned —
      // don't roll back the entire Drupal installation.
      if (step.name === "Platform callback") {
        logger.warn("Callback failed but site is provisioned. Skipping rollback.", { step: "callback" });
        process.exit(1);
      }

      // Notify the platform about the failure with step detail.
      await sendFailureCallback(
        config,
        `Step "${step.name}" failed: ${message}`,
        logger,
        { failedStep: stepNum, failedStepName: step.name, totalSteps }
      );
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
