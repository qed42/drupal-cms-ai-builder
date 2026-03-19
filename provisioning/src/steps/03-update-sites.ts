import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function updateSitesStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const sitesPhpPath = join(config.drupalRoot, "web", "sites", "sites.php");

  let content: string;
  try {
    content = await readFile(sitesPhpPath, "utf-8");
  } catch {
    // Create sites.php if it doesn't exist.
    content = `<?php\n\n/**\n * @file\n * Site directory mapping.\n */\n\n`;
  }

  const mapping = `\$sites['${config.domain}'] = '${config.domain}';\n`;

  // Don't add duplicate entries.
  if (!content.includes(`'${config.domain}'`)) {
    content += mapping;
    await writeFile(sitesPhpPath, content, "utf-8");
    logger.info(`Added ${config.domain} to sites.php`, {
      step: "update-sites",
    });
  } else {
    logger.info(`${config.domain} already in sites.php`, {
      step: "update-sites",
    });
  }

  return {
    success: true,
    message: `sites.php updated for ${config.domain}`,
  };
}
