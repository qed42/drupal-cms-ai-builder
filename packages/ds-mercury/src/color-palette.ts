import type { ColorPalette } from "@ai-builder/ds-types";

export const COLOR_PALETTE: ColorPalette = {
  values: [
    "primary",
    "secondary",
    "accent",
    "muted",
  ],
  darkBackgrounds: ["primary", "secondary", "accent"],
  lightBackgrounds: ["muted"],
  defaultAlternation: ["muted", "accent"],
};
