import { writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function applyBrandStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  // Read the blueprint to extract brand tokens.
  const blueprintJson = await readFile(config.blueprintPath, "utf-8");
  const blueprint = JSON.parse(blueprintJson);

  if (!blueprint.brand) {
    logger.info("No brand tokens in blueprint, skipping.", {
      step: "apply-brand",
    });
    return { success: true, message: "No brand tokens to apply" };
  }

  // Write brand tokens alongside the blueprint in the shared volume
  // so the DDEV web container can access them via docker exec.
  const tokensPath = join(dirname(config.blueprintPath), `tokens-${config.siteId}.json`);
  await writeFile(tokensPath, JSON.stringify(blueprint.brand), "utf-8");

  await drush(
    "ai-site-builder:apply-brand",
    [`--tokens=${tokensPath}`],
    drushOptions
  );

  logger.info("Brand tokens applied.", { step: "apply-brand" });

  return {
    success: true,
    message: "Brand tokens CSS generated and applied",
  };
}
