import type { ImagePropMapping } from "@ai-builder/ds-types";

export const IMAGE_PROP_MAPPINGS: Record<string, ImagePropMapping> = {
  "space_ds:space-hero-banner-style-02": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "space_ds:space-hero-banner-with-media": {
    props: ["image"],
    dimensions: { width: 800, height: 600 },
    orientation: "landscape",
  },
  "space_ds:space-detail-page-hero-banner": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "space_ds:space-video-banner": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 1080 },
    orientation: "landscape",
  },
  "space_ds:space-imagecard": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "space_ds:space-dark-bg-imagecard": {
    props: ["image"],
    dimensions: { width: 600, height: 400 },
    orientation: "landscape",
  },
  "space_ds:space-testimony-card": {
    props: ["image"],
    dimensions: { width: 200, height: 200 },
    orientation: "square",
  },
  "space_ds:space-user-card": {
    props: ["image"],
    dimensions: { width: 300, height: 300 },
    orientation: "square",
  },
  "space_ds:space-content-detail": {
    props: ["image"],
    dimensions: { width: 800, height: 500 },
    orientation: "landscape",
  },
  "space_ds:space-image": {
    props: ["image"],
    dimensions: { width: 1080, height: 600 },
    orientation: "landscape",
  },
  "space_ds:space-cta-banner-type-1": {
    props: ["background_image"],
    dimensions: { width: 1920, height: 800 },
    orientation: "landscape",
  },
};
