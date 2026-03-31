/**
 * Rule Resolver (M27).
 *
 * Cascade resolution engine: merges rule layers bottom-up.
 * global → industry-{slug} → persona-{slug}
 *
 * Arrays concatenate and deduplicate. Scalars overwrite.
 */

import { loadRuleFile, slugifyIndustry } from "./loader";
import type { DesignRuleDefinition, DesignRuleSet } from "./types";

/** Deep-merge two rule definitions. Later values win for scalars; arrays concatenate. */
function mergeRules(
  base: DesignRuleDefinition,
  overlay: DesignRuleDefinition
): DesignRuleDefinition {
  const result: DesignRuleDefinition = structuredClone(base);

  for (const category of ["composition", "content", "visual", "compliance"] as const) {
    const baseCategory = result[category] || {};
    const overlayCategory = overlay[category];
    if (!overlayCategory) continue;

    const merged = { ...baseCategory };

    for (const [key, value] of Object.entries(overlayCategory)) {
      const existing = (merged as Record<string, unknown>)[key];

      if (Array.isArray(value) && Array.isArray(existing)) {
        // Concatenate and deduplicate arrays
        (merged as Record<string, unknown>)[key] = [...new Set([...existing, ...value])];
      } else if (value !== undefined) {
        // Scalar overwrite
        (merged as Record<string, unknown>)[key] = value;
      }
    }

    (result as Record<string, unknown>)[category] = merged;
  }

  return result;
}

/**
 * Resolve design rules by merging layers: global → industry → persona.
 *
 * @param industry - Raw industry string from onboarding (e.g., "Healthcare")
 * @param persona - Inferred persona slug (e.g., "solo-creative")
 * @returns Fully resolved DesignRuleSet with provenance metadata
 */
export function resolveDesignRules(
  industry: string,
  persona: string
): DesignRuleSet {
  const layers: Array<{ name: string; rules: DesignRuleDefinition }> = [];

  // Layer 1: Global
  const global = loadRuleFile("global");
  if (global) layers.push({ name: "global", rules: global });

  // Layer 2: Industry
  const industrySlug = slugifyIndustry(industry);
  const industryRules = loadRuleFile(`industry-${industrySlug}`);
  if (industryRules) layers.push({ name: `industry-${industrySlug}`, rules: industryRules });

  // Layer 3: Persona
  const personaRules = loadRuleFile(`persona-${persona}`);
  if (personaRules) layers.push({ name: `persona-${persona}`, rules: personaRules });

  // Merge all layers bottom-up
  let merged: DesignRuleDefinition = {};
  for (const layer of layers) {
    merged = mergeRules(merged, layer.rules);
  }

  return {
    composition: merged.composition || {},
    content: merged.content || {},
    visual: merged.visual || {},
    compliance: merged.compliance || {},
    _meta: {
      layers: layers.map((l) => l.name),
      persona,
      resolvedAt: new Date().toISOString(),
    },
  };
}
