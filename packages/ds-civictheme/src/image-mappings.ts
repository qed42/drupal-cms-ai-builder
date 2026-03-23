import type { ImagePropMapping } from "@ai-builder/ds-types";

export const IMAGE_PROP_MAPPINGS: Record<string, ImagePropMapping> = {
  "civictheme:banner": {
    props: ["featured_image", "background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "civictheme:campaign": {
    props: ["image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "civictheme:navigation-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:promo-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:event-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:publication-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:subject-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:fast-fact-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:slide": {
    props: ["image"],
    dimensions: { width: 800, height: 600 },
    orientation: "landscape",
  },
};
