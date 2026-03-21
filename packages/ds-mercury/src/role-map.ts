import type { ComponentRole } from "@ai-builder/ds-types";

/**
 * Maps abstract ComponentRole identifiers to concrete Mercury component IDs.
 */
export const ROLE_MAP: Record<ComponentRole, string[]> = {
  // Required roles
  container: ["mercury:section"],
  heading: ["mercury:heading"],
  text: ["mercury:text"],
  image: ["mercury:image"],
  button: ["mercury:button"],
  link: ["mercury:button"],

  // Standard roles
  hero: [
    "mercury:hero-billboard",
    "mercury:hero-side-by-side",
    "mercury:hero-blog",
  ],
  "cta-banner": ["mercury:cta"],
  "section-heading": ["mercury:heading"],
  accordion: ["mercury:accordion-container"],
  "accordion-item": ["mercury:accordion"],
  slider: [],
  card: ["mercury:card"],
  header: ["mercury:navbar"],
  footer: ["mercury:footer"],

  // Extended roles
  "testimonial-card": ["mercury:card-testimonial"],
  "user-card": [],
  "stats-kpi": [],
  "contact-card": ["mercury:card-icon"],
  "video-banner": [],
  "logo-section": ["mercury:card-logo"],
  "content-detail": [],
  icon: ["mercury:icon"],
  "pricing-card": ["mercury:card-pricing"],
  badge: ["mercury:badge"],
  blockquote: ["mercury:blockquote"],
  video: ["mercury:video"],
};
