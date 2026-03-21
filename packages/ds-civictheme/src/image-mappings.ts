import type { ImagePropMapping } from "@ai-builder/ds-types";

export const IMAGE_PROP_MAPPINGS: Record<string, ImagePropMapping> = {
  "civictheme:banner": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "civictheme:campaign": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "civictheme:promo": {
    props: ["image"],
    dimensions: { width: 800, height: 600 },
    orientation: "landscape",
  },
  "civictheme:figure": {
    props: ["image"],
    dimensions: { width: 1080, height: 600 },
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
  "civictheme:service-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:subject-card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "civictheme:snippet": {
    props: ["author_image"],
    dimensions: { width: 200, height: 200 },
    orientation: "square",
  },
};
