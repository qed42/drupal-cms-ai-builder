import type { CompositionPattern } from "@ai-builder/ds-types";

/**
 * Composition patterns — declarative layout recipes for building sections.
 *
 * Each pattern describes a layout strategy (flexi grid or organism-level)
 * and the child roles that populate it. The pipeline uses these to validate
 * AI output and to guide the tree builder.
 */
export const COMPOSITION_PATTERNS: Record<string, CompositionPattern> = {
  "text-image-split-50-50": {
    name: "text-image-split-50-50",
    description: "Text content with image, evenly split",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "text-image-split-66-33": {
    name: "text-image-split-66-33",
    description: "Wider text column with narrow image",
    childRoles: ["heading", "text", "button", "image"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "image-text-split-33-66": {
    name: "image-text-split-33-66",
    description: "Image first, then wider text (reversed layout)",
    childRoles: ["image", "heading", "text", "button"],
    applicablePageTypes: ["home", "about", "services", "landing", "generic"],
  },
  "features-grid-3col": {
    name: "features-grid-3col",
    description: "Three feature columns — one molecule per column (content-detail, card, stats-kpi, or contact-card)",
    childRoles: ["content-detail", "card", "stats-kpi"],
    applicablePageTypes: ["home", "services", "landing", "generic"],
  },
  "features-grid-4col": {
    name: "features-grid-4col",
    description: "Four feature columns — one molecule per column (content-detail, card, stats-kpi, or contact-card)",
    childRoles: ["content-detail", "card", "stats-kpi"],
    applicablePageTypes: ["home", "services", "landing"],
  },
  "stats-row": {
    name: "stats-row",
    description: "Row of 3-4 key statistics/KPIs",
    childRoles: ["stats-kpi"],
    applicablePageTypes: ["home", "about", "services", "landing"],
  },
  "testimonials-carousel": {
    name: "testimonials-carousel",
    description: "Sliding carousel of testimonial cards",
    childRoles: ["slider", "testimonial-card"],
    applicablePageTypes: ["home", "services", "landing", "about"],
  },
  "team-grid-4col": {
    name: "team-grid-4col",
    description: "Grid of team member cards, 4 columns",
    childRoles: ["user-card"],
    applicablePageTypes: ["team", "about"],
  },
  "team-grid-3col": {
    name: "team-grid-3col",
    description: "Grid of team member cards, 3 columns",
    childRoles: ["user-card"],
    applicablePageTypes: ["team", "about"],
  },
  "card-grid-3col": {
    name: "card-grid-3col",
    description: "Grid of image cards (blog, portfolio, etc.)",
    childRoles: ["card"],
    applicablePageTypes: ["portfolio", "home", "services", "generic"],
  },
  "card-carousel": {
    name: "card-carousel",
    description: "Sliding carousel of image cards",
    childRoles: ["slider", "card"],
    applicablePageTypes: ["portfolio", "home", "generic"],
  },
  "contact-info": {
    name: "contact-info",
    description: "Contact cards with email, phone, and FAQ link",
    childRoles: ["contact-card"],
    applicablePageTypes: ["contact"],
  },
  "faq-accordion": {
    name: "faq-accordion",
    description: "Collapsible FAQ section",
    childRoles: ["accordion", "accordion-item"],
    applicablePageTypes: ["faq", "contact", "services"],
  },
  "logo-showcase": {
    name: "logo-showcase",
    description: "Logo/partner/client showcase",
    childRoles: ["logo-section"],
    applicablePageTypes: ["home", "landing", "about"],
  },
  "full-width-text": {
    name: "full-width-text",
    description: "Full-width text content section",
    childRoles: ["heading", "text"],
    applicablePageTypes: ["about", "generic", "faq", "team", "portfolio"],
  },
};
