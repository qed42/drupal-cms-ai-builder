import type { ImagePropMapping } from "@ai-builder/ds-types";

export const IMAGE_PROP_MAPPINGS: Record<string, ImagePropMapping> = {
  "mercury:hero-billboard": {
    props: ["media"],
    dimensions: { width: 1920, height: 1344 },
    orientation: "landscape",
  },
  "mercury:hero-side-by-side": {
    props: ["media"],
    dimensions: { width: 1920, height: 1344 },
    orientation: "landscape",
  },
  "mercury:hero-blog": {
    props: ["media"],
    dimensions: { width: 1920, height: 1344 },
    orientation: "landscape",
  },
  "mercury:cta": {
    props: ["media"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "mercury:card": {
    props: ["media"],
    dimensions: { width: 1200, height: 900 },
    orientation: "landscape",
  },
  "mercury:card-logo": {
    props: ["media"],
    dimensions: { width: 188, height: 113 },
    orientation: "landscape",
  },
  "mercury:card-testimonial": {
    props: ["media"],
    dimensions: { width: 100, height: 100 },
    orientation: "square",
  },
  "mercury:image": {
    props: ["media"],
    dimensions: { width: 1920, height: 1014 },
    orientation: "landscape",
  },
  "mercury:section": {
    props: ["background_media"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
};
