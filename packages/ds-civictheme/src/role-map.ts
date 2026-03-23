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
  "accordion-item": [],  // Accordion panels are a PROP (array) on the accordion, not a separate component
  slider: ["civictheme:slider"],
  card: ["civictheme:navigation-card", "civictheme:promo-card"],
  header: ["civictheme:header"],
  footer: ["civictheme:footer"],

  // Extended roles — CivicTheme has rich card type coverage
  "testimonial-card": ["civictheme:snippet"],
  "user-card": ["civictheme:promo-card"],
  "stats-kpi": ["civictheme:fast-fact-card"],
  "contact-card": ["civictheme:service-card"],
  "video-banner": ["civictheme:campaign"],
  "logo-section": ["civictheme:navigation-card"],
  "content-detail": ["civictheme:promo"],
  icon: ["civictheme:icon"],
  "pricing-card": [],  // No pricing card component in CivicTheme SDC
  badge: ["civictheme:tag"],
  blockquote: [],  // No blockquote/quote component in CivicTheme SDC
  video: [],
};
