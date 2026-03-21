import type { ComponentRole } from "@ai-builder/ds-types";

/**
 * Maps abstract ComponentRole identifiers to concrete CivicTheme component IDs.
 *
 * KEY DIFFERENCE: "container" maps to an empty array because CivicTheme
 * uses pre-composed organisms (promo, list, callout) instead of a generic
 * container+grid layout primitive.
 */
export const ROLE_MAP: Record<ComponentRole, string[]> = {
  // Required roles
  container: [],  // CivicTheme organisms handle their own wrappers
  heading: ["civictheme:heading"],
  text: ["civictheme:paragraph"],
  image: ["civictheme:figure"],
  button: ["civictheme:button"],
  link: ["civictheme:content-link"],

  // Standard roles
  hero: ["civictheme:banner", "civictheme:campaign"],
  "cta-banner": ["civictheme:callout"],
  "section-heading": ["civictheme:heading"],
  accordion: ["civictheme:accordion"],
  "accordion-item": ["civictheme:accordion-panel"],
  slider: ["civictheme:slider"],
  card: ["civictheme:navigation-card", "civictheme:promo-card"],
  header: ["civictheme:header"],
  footer: ["civictheme:footer"],

  // Extended roles — CivicTheme has rich card type coverage
  "testimonial-card": ["civictheme:snippet"],
  "user-card": ["civictheme:promo-card"],
  "stats-kpi": [],  // No direct equivalent; use heading+paragraph in a list
  "contact-card": ["civictheme:service-card"],
  "video-banner": ["civictheme:campaign"],
  "logo-section": ["civictheme:navigation-card"],
  "content-detail": ["civictheme:promo"],
  icon: ["civictheme:icon"],
  "pricing-card": ["civictheme:price-card"],
  badge: ["civictheme:tag"],
  blockquote: ["civictheme:quote"],
  video: [],
};
