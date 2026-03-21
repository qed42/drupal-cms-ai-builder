import type { ColorPalette } from "@ai-builder/ds-types";

/**
 * CivicTheme uses per-component theme: "light" | "dark" instead of named
 * background colors on containers. The palette values here represent the
 * theme alternation used when building sections for visual rhythm.
 */
export const COLOR_PALETTE: ColorPalette = {
  values: ["light", "dark"],
  darkBackgrounds: ["dark"],
  lightBackgrounds: ["light"],
  defaultAlternation: ["light", "dark", "light", "light"],
};
