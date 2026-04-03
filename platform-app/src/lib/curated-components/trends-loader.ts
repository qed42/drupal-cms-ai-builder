/**
 * Trend database loader — reads and filters design trends for prompt injection.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrendEntry {
  id: string;
  name: string;
  description: string;
  applicableSections: string[];
  cssPattern: string;
  visualStyles: string[];
  since: string;
}

interface TrendsDatabase {
  version: string;
  lastUpdated: string;
  trends: TrendEntry[];
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const TRENDS_DIR = dirname(fileURLToPath(import.meta.url));
let cachedTrends: TrendsDatabase | null = null;

function loadTrends(): TrendsDatabase | null {
  if (cachedTrends) return cachedTrends;
  const trendsPath = join(TRENDS_DIR, "trends.json");
  if (!existsSync(trendsPath)) {
    console.warn(`[curated-components] trends.json not found at ${trendsPath}`);
    return null;
  }
  const raw = readFileSync(trendsPath, "utf-8");
  cachedTrends = JSON.parse(raw) as TrendsDatabase;
  return cachedTrends;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get trends applicable to a section type and visual style.
 * Returns up to `limit` trends, sorted by relevance (style match first).
 */
export function getApplicableTrends(
  sectionType: string,
  visualStyle: string,
  limit: number = 3
): TrendEntry[] {
  const db = loadTrends();
  if (!db) return [];

  const applicable = db.trends.filter((t) =>
    t.applicableSections.includes(sectionType)
  );

  // Score by visual style match
  const scored = applicable.map((t) => ({
    trend: t,
    score: t.visualStyles.includes(visualStyle) ? 1 : 0,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.trend);
}

/**
 * Format trend entries as a prompt fragment for the designer agent.
 */
export function formatTrendsForPrompt(trends: TrendEntry[]): string {
  if (trends.length === 0) return "";

  const lines = trends.map(
    (t) =>
      `- **${t.name}**: ${t.description}\n  CSS hint: \`${t.cssPattern}\``
  );

  return `## CURRENT DESIGN TRENDS (for inspiration — use selectively)\n\n${lines.join("\n\n")}`;
}

/**
 * Clear the trends cache (useful for testing).
 */
export function clearTrendsCache(): void {
  cachedTrends = null;
}
