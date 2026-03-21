import type { CompositionPattern } from "@ai-builder/ds-types";

/**
 * Composition patterns for CivicTheme.
 *
 * KEY DIFFERENCE from Space DS: CivicTheme patterns map to pre-composed
 * organisms (promo, list, callout) rather than container+grid+atoms.
 * The tree builder uses the pattern name to select the correct organism.
 */
export const COMPOSITION_PATTERNS: Record<string, CompositionPattern> = {
  "text-image-split-50-50": {
    name: "text-image-split-50-50",
    description: "Text content with image — maps to civictheme:promo organism",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "text-image-split-66-33": {
    name: "text-image-split-66-33",
    description: "Wider text with narrow image — maps to civictheme:promo organism",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "image-text-split-33-66": {
    name: "image-text-split-33-66",
    description: "Image first, then text (reversed) — maps to civictheme:promo organism",
    childRoles: ["image", "heading", "text", "button"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "features-grid-3col": {
    name: "features-grid-3col",
    description: "Three feature columns — maps to civictheme:list with navigation-cards",
    childRoles: ["icon", "heading", "text"],
    applicablePageTypes: ["home", "services", "landing", "generic"],
  },
  "features-grid-4col": {
    name: "features-grid-4col",
    description: "Four feature columns — maps to civictheme:list with navigation-cards",
    childRoles: ["icon", "heading", "text"],
    applicablePageTypes: ["home", "services", "landing"],
  },
  "stats-row": {
    name: "stats-row",
    description: "Row of key statistics — maps to civictheme:list with heading+paragraph items",
    childRoles: ["heading", "text"],
    applicablePageTypes: ["home", "about", "services", "landing"],
  },
  "testimonials-carousel": {
    name: "testimonials-carousel",
    description: "Testimonial carousel — maps to civictheme:slider with snippets",
    childRoles: ["testimonial-card"],
    applicablePageTypes: ["home", "services", "landing", "about"],
  },
  "team-grid-4col": {
    name: "team-grid-4col",
    description: "Team member grid (4 cols) — maps to civictheme:list with promo-cards",
    childRoles: ["user-card"],
    applicablePageTypes: ["team", "about"],
  },
  "team-grid-3col": {
    name: "team-grid-3col",
    description: "Team member grid (3 cols) — maps to civictheme:list with promo-cards",
    childRoles: ["user-card"],
    applicablePageTypes: ["team", "about"],
  },
  "card-grid-3col": {
    name: "card-grid-3col",
    description: "Grid of content cards — maps to civictheme:list with promo-cards",
    childRoles: ["card"],
    applicablePageTypes: ["portfolio", "home", "services", "generic"],
  },
  "card-carousel": {
    name: "card-carousel",
    description: "Sliding carousel of cards — maps to civictheme:carousel with promo-cards",
    childRoles: ["card"],
    applicablePageTypes: ["portfolio", "home", "generic"],
  },
  "contact-info": {
    name: "contact-info",
    description: "Contact cards — maps to civictheme:list with service-cards",
    childRoles: ["contact-card"],
    applicablePageTypes: ["contact"],
  },
  "faq-accordion": {
    name: "faq-accordion",
    description: "Collapsible FAQ — maps to civictheme:accordion with accordion-panels",
    childRoles: ["accordion", "accordion-item"],
    applicablePageTypes: ["faq", "contact", "services"],
  },
  "logo-showcase": {
    name: "logo-showcase",
    description: "Logo/partner showcase — maps to civictheme:list with navigation-cards",
    childRoles: ["card"],
    applicablePageTypes: ["home", "landing", "about"],
  },
  "full-width-text": {
    name: "full-width-text",
    description: "Full-width text section — maps to civictheme:callout (simple variant)",
    childRoles: ["heading", "text"],
    applicablePageTypes: ["about", "generic", "faq", "team", "portfolio"],
  },
  "blog-grid": {
    name: "blog-grid",
    description: "Blog post grid — maps to civictheme:list with publication-cards",
    childRoles: ["card"],
    applicablePageTypes: ["home", "landing", "generic"],
  },
  "cta-banner": {
    name: "cta-banner",
    description: "Call-to-action banner — maps to civictheme:callout",
    childRoles: ["heading", "text", "button"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
};
