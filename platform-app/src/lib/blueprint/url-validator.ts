/**
 * Post-generation URL validation and rewriting.
 * Ensures all internal links in component trees point to real pages.
 *
 * TASK-337: Validate and rewrite URLs against the site's page list.
 */

import type { ComponentTreeItem } from "./types";

/** Props that may contain URLs. */
const URL_PROP_NAMES = new Set(["url", "href", "link"]);

/**
 * Simple Levenshtein distance for fuzzy slug matching.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Find the closest matching slug using Levenshtein distance.
 * Returns the match only if distance <= 3 (reasonable typo threshold).
 */
function findClosestSlug(slug: string, validSlugs: string[]): string | null {
  let bestSlug: string | null = null;
  let bestDist = Infinity;

  for (const candidate of validSlugs) {
    const dist = levenshtein(slug, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      bestSlug = candidate;
    }
  }

  return bestDist <= 3 ? bestSlug : null;
}

/**
 * Validate and rewrite a single URL value.
 * Returns the corrected URL and whether it was rewritten.
 */
function validateUrl(
  url: string,
  validSlugs: Set<string>,
  slugArray: string[],
  fallbackSlug: string
): { url: string; rewritten: boolean } {
  // External URLs, anchors, empty — leave as-is
  if (!url || url.startsWith("http") || url.startsWith("#") || url.startsWith("mailto:")) {
    return { url, rewritten: false };
  }

  // Homepage root is always valid
  if (url === "/") {
    return { url, rewritten: false };
  }

  // Extract base slug (strip query params and anchors)
  const basePath = url.split("?")[0].split("#")[0];
  const slug = basePath.replace(/^\//, "").replace(/\/$/, "");

  if (!slug) {
    return { url, rewritten: false };
  }

  // Valid slug
  if (validSlugs.has(slug)) {
    return { url, rewritten: false };
  }

  // Try fuzzy match
  const closest = findClosestSlug(slug, slugArray);
  if (closest) {
    return { url: `/${closest}`, rewritten: true };
  }

  // Fallback to conversion page
  return { url: `/${fallbackSlug}`, rewritten: true };
}

/**
 * Rewrite <a href="..."> links inside HTML strings.
 */
function rewriteHtmlLinks(
  html: string,
  validSlugs: Set<string>,
  slugArray: string[],
  fallbackSlug: string,
  rewrites: string[]
): string {
  return html.replace(/<a\s+href="(\/[^"]*?)"/g, (_match, href: string) => {
    const result = validateUrl(href, validSlugs, slugArray, fallbackSlug);
    if (result.rewritten) {
      rewrites.push(`HTML link "${href}" → "${result.url}"`);
    }
    return `<a href="${result.url}"`;
  });
}

/**
 * Validate and rewrite all URLs in a component tree.
 * Mutates the tree items in-place for efficiency.
 *
 * @returns Array of rewrite log messages for debugging.
 */
export function validateAndRewriteUrls(
  tree: ComponentTreeItem[],
  allSlugs: string[]
): string[] {
  const validSlugs = new Set(allSlugs);
  const fallbackSlug = allSlugs.find((s) => s.includes("contact")) ?? allSlugs[0] ?? "";
  const rewrites: string[] = [];

  for (const item of tree) {
    if (!item.inputs) continue;

    for (const [key, value] of Object.entries(item.inputs)) {
      // Check URL-type props
      if (URL_PROP_NAMES.has(key) && typeof value === "string") {
        const result = validateUrl(value, validSlugs, allSlugs, fallbackSlug);
        if (result.rewritten) {
          item.inputs[key] = result.url;
          rewrites.push(`${item.label ?? item.component_id} "${key}": "${value}" → "${result.url}"`);
        }
      }

      // Check HTML content for inline <a> links (space-text "text" prop)
      if (key === "text" && typeof value === "string" && value.includes("<a ")) {
        const rewritten = rewriteHtmlLinks(value, validSlugs, allSlugs, fallbackSlug, rewrites);
        if (rewritten !== value) {
          item.inputs[key] = rewritten;
        }
      }
    }
  }

  return rewrites;
}
