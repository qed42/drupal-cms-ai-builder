import type { ComponentRole } from "@ai-builder/ds-types";

/**
 * Maps abstract ComponentRole identifiers to concrete Space DS v2 component IDs.
 */
export const ROLE_MAP: Record<ComponentRole, string[]> = {
  // Required roles
  container: ["space_ds:space-container"],
  heading: ["space_ds:space-heading"],
  text: ["space_ds:space-text"],
  image: ["space_ds:space-image"],
  button: ["space_ds:space-button"],
  link: ["space_ds:space-link"],

  // Standard roles
  hero: [
    "space_ds:space-hero-banner-style-02",
    "space_ds:space-hero-banner-with-media",
    "space_ds:space-detail-page-hero-banner",
    "space_ds:space-video-banner",
  ],
  "cta-banner": ["space_ds:space-cta-banner-type-1"],
  "section-heading": ["space_ds:space-section-heading"],
  accordion: ["space_ds:space-accordion"],
  "accordion-item": ["space_ds:space-accordion-item"],
  slider: ["space_ds:space-slider"],
  card: ["space_ds:space-imagecard", "space_ds:space-dark-bg-imagecard"],
  header: ["space_ds:space-header"],
  footer: ["space_ds:space-footer"],

  // Extended roles
  "testimonial-card": ["space_ds:space-testimony-card"],
  "user-card": ["space_ds:space-user-card"],
  "stats-kpi": ["space_ds:space-stats-kpi"],
  "contact-card": ["space_ds:space-contact-card"],
  "video-banner": ["space_ds:space-video-banner"],
  "logo-section": ["space_ds:space-logo-section"],
  "content-detail": ["space_ds:space-content-detail"],
  icon: ["space_ds:space-icon"],

  // Unsupported extended roles — empty arrays for graceful degradation
  "pricing-card": [],
  badge: [],
  blockquote: [],
  video: [],
};
