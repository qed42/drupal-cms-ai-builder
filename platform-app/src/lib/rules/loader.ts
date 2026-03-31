/**
 * YAML Rule Loader (M27).
 *
 * Loads and caches design rule definitions from the definitions/ directory.
 * Falls back gracefully when files don't exist.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { DesignRuleDefinition } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = resolve(__dirname, "definitions");

/** Module-level cache for parsed YAML files. */
const cache = new Map<string, DesignRuleDefinition | null>();

/**
 * Load a rule definition file by name (without .yaml extension).
 * Returns null if the file doesn't exist. Caches results.
 */
export function loadRuleFile(name: string): DesignRuleDefinition | null {
  if (cache.has(name)) return cache.get(name)!;

  const filePath = resolve(DEFINITIONS_DIR, `${name}.yaml`);

  if (!existsSync(filePath)) {
    cache.set(name, null);
    return null;
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = parseYaml(raw) as DesignRuleDefinition;
    cache.set(name, parsed);
    return parsed;
  } catch (err) {
    console.warn(`[rules] Failed to parse ${name}.yaml:`, err);
    cache.set(name, null);
    return null;
  }
}

/**
 * Slugify an industry name for file lookup.
 * "Healthcare & Medical" → "healthcare"
 * "E-Commerce" → "ecommerce"
 */
export function slugifyIndustry(industry: string): string {
  return industry
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")[0]; // Take first word as primary slug
}

/** Clear the cache (for testing). */
export function clearRuleCache(): void {
  cache.clear();
}
