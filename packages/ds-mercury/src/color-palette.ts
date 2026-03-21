import type { ColorPalette } from "@ai-builder/ds-types";

export const COLOR_PALETTE: ColorPalette = {
  values: [
    "transparent",
    "background",
    "primary",
    "secondary",
    "accent",
    "muted",
  ],
  darkBackgrounds: ["primary", "secondary", "accent"],
  lightBackgrounds: ["transparent", "background", "muted"],
  defaultAlternation: ["transparent", "muted", "background", "transparent"],
};
