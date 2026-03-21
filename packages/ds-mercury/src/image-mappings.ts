import type { ImagePropMapping } from "@ai-builder/ds-types";

export const IMAGE_PROP_MAPPINGS: Record<string, ImagePropMapping> = {
  "mercury:hero-billboard": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "mercury:hero-side-by-side": {
    props: ["image"],
    dimensions: { width: 800, height: 600 },
    orientation: "landscape",
  },
  "mercury:hero-blog": {
    props: ["image"],
    dimensions: { width: 1200, height: 630 },
    orientation: "landscape",
  },
  "mercury:card": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "mercury:card-logo": {
    props: ["image"],
    dimensions: { width: 200, height: 100 },
    orientation: "landscape",
  },
  "mercury:card-testimonial": {
    props: ["image"],
    dimensions: { width: 200, height: 200 },
    orientation: "square",
  },
  "mercury:image": {
    props: ["image"],
    dimensions: { width: 1080, height: 600 },
    orientation: "landscape",
  },
};
