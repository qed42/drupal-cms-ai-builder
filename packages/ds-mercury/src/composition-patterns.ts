import type { CompositionPattern } from "@ai-builder/ds-types";

/**
 * Composition patterns — declarative layout recipes for building sections.
 *
 * Mercury uses `section` as the combined container+grid. Patterns map to
 * section column splits rather than separate flexi grids.
 */
export const COMPOSITION_PATTERNS: Record<string, CompositionPattern> = {
  "text-image-split-50-50": {
    name: "text-image-split-50-50",
    description: "Text content with image, evenly split in a 50-50 section",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "text-image-split-67-33": {
    name: "text-image-split-67-33",
    description: "Wider text column with narrow image in a 67-33 section",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "image-text-split-33-67": {
    name: "image-text-split-33-67",
    description: "Image first, then wider text (reversed layout) in a 33-67 section",
    childRoles: ["image", "heading", "text", "button"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "features-grid-3col": {
    name: "features-grid-3col",
    description: "Three feature columns using card-icon components",
    childRoles: ["icon", "heading", "text"],
    applicablePageTypes: ["home", "services", "landing", "generic"],
  },
  "features-grid-4col": {
    name: "features-grid-4col",
    description: "Four feature columns using card-icon components",
    childRoles: ["icon", "heading", "text"],
    applicablePageTypes: ["home", "services", "landing"],
  },
  "testimonials-grid-3col": {
    name: "testimonials-grid-3col",
    description: "Three testimonial cards in a 33-33-33 section",
    childRoles: ["testimonial-card"],
    applicablePageTypes: ["home", "services", "landing", "about"],
  },
  "card-grid-3col": {
    name: "card-grid-3col",
    description: "Grid of cards (blog, portfolio, etc.) in 3 columns",
    childRoles: ["card"],
    applicablePageTypes: ["portfolio", "home", "services", "generic"],
  },
  "pricing-grid-3col": {
    name: "pricing-grid-3col",
    description: "Three pricing plan cards side by side",
    childRoles: ["pricing-card"],
    applicablePageTypes: ["landing", "services"],
  },
  "logo-showcase": {
    name: "logo-showcase",
    description: "Logo/partner/client showcase row",
    childRoles: ["logo-section"],
    applicablePageTypes: ["home", "landing", "about"],
  },
  "faq-accordion": {
    name: "faq-accordion",
    description: "Collapsible FAQ section with accordion items",
    childRoles: ["accordion", "accordion-item"],
    applicablePageTypes: ["faq", "contact", "services"],
  },
  "contact-info": {
    name: "contact-info",
    description: "Contact icon cards with email, phone, and other channels",
    childRoles: ["contact-card"],
    applicablePageTypes: ["contact"],
  },
  "full-width-text": {
    name: "full-width-text",
    description: "Full-width text content section with 100 column layout",
    childRoles: ["heading", "text"],
    applicablePageTypes: ["about", "generic", "faq", "team", "portfolio"],
  },
  "team-grid-3col": {
    name: "team-grid-3col",
    description: "Grid of team member cards, 3 columns",
    childRoles: ["card"],
    applicablePageTypes: ["team", "about"],
  },
  "team-grid-4col": {
    name: "team-grid-4col",
    description: "Grid of team member cards, 4 columns",
    childRoles: ["card"],
    applicablePageTypes: ["team", "about"],
  },
  "card-grid-2col": {
    name: "card-grid-2col",
    description: "Two cards side by side in a 50-50 layout",
    childRoles: ["card"],
    applicablePageTypes: ["portfolio", "services", "generic"],
  },
};
