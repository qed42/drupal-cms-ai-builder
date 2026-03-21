import type { BrandTokens, BrandPayload } from "@ai-builder/ds-types";

/**
 * Map abstract BrandTokens to a space_ds.settings Drupal config payload.
 */
export function prepareBrandPayload(tokens: BrandTokens): BrandPayload {
  return {
    type: "drupal-config",
    configName: "space_ds.settings",
    values: {
      accent_color_primary: tokens.colors.primary,
      accent_color_secondary: tokens.colors.secondary,
      base_brand_color: tokens.colors.accent ?? tokens.colors.primary,
      neutral_color: tokens.colors.neutral ?? "#6b7280",
      heading_color: "#1a1a1a",
      border_color: "#e5e7eb",
      font_family: tokens.fonts.body ?? "sans-serif",
    },
  };
}
