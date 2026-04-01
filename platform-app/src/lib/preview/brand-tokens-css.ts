/**
 * TASK-514: Brand tokens to CSS custom properties converter.
 *
 * Converts BrandTokens and design rule tokens into CSS custom property blocks
 * for injection into the preview iframe.
 */

import type { BrandTokens } from "@/lib/blueprint/types";
import type { TokenRules } from "@/lib/rules/types";

/**
 * Convert brand colors and fonts to a CSS custom properties block.
 *
 * Output example:
 * ```css
 * :root {
 *   --color-primary: #2563eb;
 *   --font-heading: 'Inter', sans-serif;
 * }
 * ```
 */
export function brandTokensToCss(brand: BrandTokens, tokens?: TokenRules): string {
  const lines: string[] = [":root {"];

  // Brand colors
  for (const [name, value] of Object.entries(brand.colors)) {
    lines.push(`  --color-${name}: ${value};`);
  }

  // Brand fonts
  if (brand.fonts.heading) {
    lines.push(`  --font-heading: '${brand.fonts.heading}', sans-serif;`);
  }
  if (brand.fonts.body) {
    lines.push(`  --font-body: '${brand.fonts.body}', sans-serif;`);
  }

  // Design rule tokens (M27)
  if (tokens) {
    if (tokens.container) {
      lines.push(`  --token-container: ${tokens.container};`);
    }
    if (tokens.sectionSpacing) {
      lines.push(`  --token-section-spacing: ${tokens.sectionSpacing};`);
    }
    if (tokens.card) {
      lines.push(`  --token-card: ${tokens.card};`);
    }
    if (tokens.gridGap) {
      lines.push(`  --token-grid-gap: ${tokens.gridGap};`);
    }
    if (tokens.intraSpacing) {
      lines.push(`  --token-intra-spacing: ${tokens.intraSpacing};`);
    }
    if (tokens.focus) {
      lines.push(`  --token-focus: ${tokens.focus};`);
    }
    if (tokens.backgroundAlternation) {
      lines.push(`  --token-bg-alternation: ${tokens.backgroundAlternation};`);
    }
    if (tokens.typography) {
      const t = tokens.typography;
      if (t.h1) lines.push(`  --token-typo-h1: ${t.h1};`);
      if (t.h2) lines.push(`  --token-typo-h2: ${t.h2};`);
      if (t.h3) lines.push(`  --token-typo-h3: ${t.h3};`);
      if (t.body) lines.push(`  --token-typo-body: ${t.body};`);
      if (t.small) lines.push(`  --token-typo-small: ${t.small};`);
      if (t.maxWidth) lines.push(`  --token-typo-max-width: ${t.maxWidth};`);
    }
    if (tokens.button) {
      if (tokens.button.primary) lines.push(`  --token-btn-primary: ${tokens.button.primary};`);
      if (tokens.button.secondary) lines.push(`  --token-btn-secondary: ${tokens.button.secondary};`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

/**
 * Generate a Google Fonts `<link>` URL for the given font families.
 * Deduplicates fonts and formats them for the Google Fonts API.
 *
 * Returns empty string if no fonts are provided.
 */
export function googleFontsLink(fonts: string[]): string {
  const unique = [...new Set(fonts.filter(Boolean))];
  if (unique.length === 0) return "";

  const families = unique
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
