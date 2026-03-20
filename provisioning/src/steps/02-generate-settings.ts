import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function generateSettingsStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const sitesDir = join(config.drupalRoot, "web", "sites", config.domain);
  const settingsPath = join(sitesDir, "settings.php");
  const { name: dbName, user: dbUser, password: dbPassword } = config.siteDatabase;
  const hashSalt = randomBytes(32).toString("hex");

  await mkdir(sitesDir, { recursive: true });

  // Escape single quotes for safe PHP string interpolation.
  const esc = (val: string | number) =>
    String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const settings = `<?php

/**
 * @file
 * Auto-generated settings.php for ${esc(config.domain)}.
 */

$databases['default']['default'] = [
  'database' => '${esc(dbName)}',
  'username' => '${esc(dbUser)}',
  'password' => '${esc(dbPassword)}',
  'host' => '${esc(config.database.host)}',
  'port' => '${esc(config.database.port)}',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_general_ci',
];

$settings['hash_salt'] = '${esc(hashSalt)}';
$settings['config_sync_directory'] = '../config/sync';
$settings['file_public_path'] = 'sites/${esc(config.domain)}/files';
$settings['file_private_path'] = 'sites/${esc(config.domain)}/private';

// Trusted host patterns.
$settings['trusted_host_patterns'] = [
  '^${config.domain.replace(/\./g, "\\\\.")}$',
];
`;

  await writeFile(settingsPath, settings, "utf-8");
  logger.info(`settings.php written to ${settingsPath}`, {
    step: "generate-settings",
  });

  return {
    success: true,
    message: `Settings generated at ${settingsPath}`,
    data: { settingsPath, sitesDir },
  };
}
