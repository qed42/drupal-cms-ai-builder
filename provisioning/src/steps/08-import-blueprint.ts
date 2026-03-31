import { readFileSync, writeFileSync } from "node:fs";
import { drush } from "../utils/drush.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

/**
 * Sanitize component tree inputs before Drupal import.
 * Canvas validates URL-typed props at save time — invalid values cause
 * a LogicException that aborts the entire import. This catches AI-generated
 * description text in URL prop fields and replaces them with safe values.
 */
function sanitizeBlueprintInputs(blueprint: Record<string, unknown>, logger: winston.Logger): void {
  const URL_PROP_PATTERN = /url|link|href/i;
  // Canvas uses RFC 3986 strict URI validation (justinrainbow/json-schema).
  // `format: uri` requires an absolute URI — bare "#", relative refs, and
  // descriptive placeholder text all fail. Image URLs starting with "/" are
  // nested inside $ref:image objects and not subject to URI validation.
  const VALID_URL_PATTERN = /^(https?:\/\/|\/[a-z0-9]|mailto:|tel:)/i;
  const SAFE_URL_PLACEHOLDER = "https://example.com";
  let fixed = 0;

  function sanitizeInputs(inputs: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === "string" && URL_PROP_PATTERN.test(key)) {
        if (value && !VALID_URL_PATTERN.test(value)) {
          inputs[key] = SAFE_URL_PLACEHOLDER;
          fixed++;
        }
      }
      // Fix stringified arrays ("[]" string instead of [] array)
      if (typeof value === "string" && value === "[]") {
        inputs[key] = [];
        fixed++;
      }
      // Recurse into nested objects (e.g. UUID-keyed sub-inputs)
      if (value && typeof value === "object" && !Array.isArray(value)) {
        sanitizeInputs(value as Record<string, unknown>);
      }
    }
  }

  function sanitizeTree(tree: Array<Record<string, unknown>> | undefined): void {
    if (!tree) return;
    for (const node of tree) {
      const inputs = node.inputs as Record<string, unknown> | undefined;
      if (!inputs) continue;
      sanitizeInputs(inputs);
    }
  }

  const pages = blueprint.pages as Array<Record<string, unknown>> | undefined;
  if (pages) {
    for (const page of pages) {
      sanitizeTree(page.component_tree as Array<Record<string, unknown>> | undefined);
      // Also sanitize sections[].props — the Drupal import service builds
      // component tree inputs from these props.
      const sections = page.sections as Array<Record<string, unknown>> | undefined;
      if (sections) {
        for (const section of sections) {
          const props = section.props as Record<string, unknown> | undefined;
          if (!props) continue;
          sanitizeInputs(props);
        }
      }
    }
  }
  const header = blueprint.header as Record<string, unknown> | undefined;
  sanitizeTree(header?.component_tree as Array<Record<string, unknown>> | undefined);
  const footer = blueprint.footer as Record<string, unknown> | undefined;
  sanitizeTree(footer?.component_tree as Array<Record<string, unknown>> | undefined);

  if (fixed > 0) {
    logger.info(`Sanitized ${fixed} invalid input value(s) in blueprint`, {
      step: "import-blueprint",
    });
  }
}

export async function importBlueprintStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  // Pre-process: sanitize invalid URL inputs that would cause Canvas LogicException
  const raw = readFileSync(config.blueprintPath, "utf-8");
  const blueprint = JSON.parse(raw) as Record<string, unknown>;
  sanitizeBlueprintInputs(blueprint, logger);
  writeFileSync(config.blueprintPath, JSON.stringify(blueprint, null, 2), "utf-8");

  const drushOptions = {
    sitesSubdir: config.domain,
    drupalRoot: config.drupalRoot,
    logger,
  };

  await drush(
    "ai-site-builder:import-blueprint",
    [`--json=${config.blueprintPath}`],
    drushOptions
  );

  logger.info("Blueprint imported.", { step: "import-blueprint" });

  return {
    success: true,
    message: "Blueprint entities created (pages, content, forms)",
  };
}
