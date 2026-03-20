/**
 * Page Design Rules — declarative composition constraints per page type.
 *
 * Guides the AI to produce design-consistent pages by injecting page-type-specific
 * rules into the plan and generation prompts. Based on the Space DS v2 compositional
 * model where sections are built from layout primitives (flexi/container) + atoms/molecules
 * placed in slots.
 *
 * Space DS v2 components (31 total):
 *   Base:      space-container, space-flexi
 *   Atoms:     space-button, space-heading, space-icon, space-image, space-input-submit, space-link, space-text
 *   Molecules: space-accordion-item, space-breadcrumb, space-contact-card, space-content-detail,
 *              space-dark-bg-imagecard, space-imagecard, space-logo-section, space-pagination,
 *              space-section-heading, space-stats-kpi, space-testimony-card, space-user-card, space-videocard
 *   Organisms: space-accordion, space-cta-banner-type-1, space-detail-page-hero-banner,
 *              space-footer, space-header, space-hero-banner-style-02, space-hero-banner-with-media,
 *              space-slider, space-video-banner
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageType =
  | "home"
  | "about"
  | "services"
  | "contact"
  | "portfolio"
  | "faq"
  | "team"
  | "landing"
  | "generic";

export interface CompositionPattern {
  name: string;
  description: string;
  layout: {
    component: "space_ds:space-flexi";
    column_width: string;
    gap?: string;
  } | null;
  children: string[];
}

export interface SectionRule {
  type: string;
  required: boolean;
  position: "opening" | "middle" | "closing" | "any";
  visualWeight: "heavy" | "medium" | "light";
  preferredPatterns: string[];
  wordCountRange: [number, number];
}

export interface PageDesignRule {
  pageType: PageType;
  slugPatterns: string[];
  titlePatterns: string[];
  description: string;
  sectionCountRange: [number, number];
  sections: SectionRule[];
  heroRule: {
    preferredStyles: string[];
    selectionGuidance: string;
  };
  rhythm: {
    pattern: string;
    guidance: string;
  };
  avoidComponents: string[];
  closingPattern: string;
  compositionGuidance: string;
}

// ---------------------------------------------------------------------------
// Composition Patterns
// ---------------------------------------------------------------------------

export const COMPOSITION_PATTERNS: Record<string, CompositionPattern> = {
  "text-image-split-50-50": {
    name: "text-image-split-50-50",
    description: "Text content with image, evenly split",
    layout: { component: "space_ds:space-flexi", column_width: "50-50", gap: "large" },
    children: ["space_ds:space-heading", "space_ds:space-text", "space_ds:space-button", "space_ds:space-image"],
  },
  "text-image-split-66-33": {
    name: "text-image-split-66-33",
    description: "Wider text column with narrow image",
    layout: { component: "space_ds:space-flexi", column_width: "66-33", gap: "large" },
    children: ["space_ds:space-heading", "space_ds:space-text", "space_ds:space-button", "space_ds:space-image"],
  },
  "image-text-split-33-66": {
    name: "image-text-split-33-66",
    description: "Image first, then wider text (reversed layout)",
    layout: { component: "space_ds:space-flexi", column_width: "33-66", gap: "large" },
    children: ["space_ds:space-image", "space_ds:space-heading", "space_ds:space-text", "space_ds:space-button"],
  },
  "features-grid-3col": {
    name: "features-grid-3col",
    description: "Three feature columns with icon, heading, and text each",
    layout: { component: "space_ds:space-flexi", column_width: "33-33-33", gap: "medium" },
    children: ["space_ds:space-icon", "space_ds:space-heading", "space_ds:space-text"],
  },
  "features-grid-4col": {
    name: "features-grid-4col",
    description: "Four feature columns for compact display",
    layout: { component: "space_ds:space-flexi", column_width: "25-25-25-25", gap: "medium" },
    children: ["space_ds:space-icon", "space_ds:space-heading", "space_ds:space-text"],
  },
  "stats-row": {
    name: "stats-row",
    description: "Row of 3-4 key statistics/KPIs",
    layout: { component: "space_ds:space-flexi", column_width: "25-25-25-25", gap: "medium" },
    children: ["space_ds:space-stats-kpi"],
  },
  "testimonials-carousel": {
    name: "testimonials-carousel",
    description: "Sliding carousel of testimonial cards",
    layout: null,
    children: ["space_ds:space-slider", "space_ds:space-testimony-card"],
  },
  "team-grid-4col": {
    name: "team-grid-4col",
    description: "Grid of team member cards, 4 columns",
    layout: { component: "space_ds:space-flexi", column_width: "25-25-25-25", gap: "medium" },
    children: ["space_ds:space-user-card"],
  },
  "team-grid-3col": {
    name: "team-grid-3col",
    description: "Grid of team member cards, 3 columns",
    layout: { component: "space_ds:space-flexi", column_width: "33-33-33", gap: "medium" },
    children: ["space_ds:space-user-card"],
  },
  "card-grid-3col": {
    name: "card-grid-3col",
    description: "Grid of image cards (blog, portfolio, etc.)",
    layout: { component: "space_ds:space-flexi", column_width: "33-33-33", gap: "medium" },
    children: ["space_ds:space-imagecard"],
  },
  "card-carousel": {
    name: "card-carousel",
    description: "Sliding carousel of image cards",
    layout: null,
    children: ["space_ds:space-slider", "space_ds:space-imagecard"],
  },
  "contact-info": {
    name: "contact-info",
    description: "Contact cards with email, phone, and FAQ link",
    layout: { component: "space_ds:space-flexi", column_width: "33-33-33", gap: "medium" },
    children: ["space_ds:space-contact-card"],
  },
  "faq-accordion": {
    name: "faq-accordion",
    description: "Collapsible FAQ section",
    layout: null,
    children: ["space_ds:space-accordion", "space_ds:space-accordion-item"],
  },
  "logo-showcase": {
    name: "logo-showcase",
    description: "Logo/partner/client showcase",
    layout: null,
    children: ["space_ds:space-logo-section"],
  },
  "full-width-text": {
    name: "full-width-text",
    description: "Full-width text content section",
    layout: { component: "space_ds:space-flexi", column_width: "100" },
    children: ["space_ds:space-heading", "space_ds:space-text"],
  },
};

// ---------------------------------------------------------------------------
// Rules Data
// ---------------------------------------------------------------------------

export const PAGE_DESIGN_RULES: PageDesignRule[] = [
  // -- Home -----------------------------------------------------------------
  {
    pageType: "home",
    slugPatterns: ["home", ""],
    titlePatterns: ["home", "welcome", "homepage"],
    description:
      "Primary landing page — maximum visual impact, clear value proposition, social proof, strong CTA",
    sectionCountRange: [7, 9],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-style-02",
          "space_ds:space-hero-banner-with-media",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["features-grid-3col", "features-grid-4col"],
        wordCountRange: [100, 200],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "text-image-split-66-33"],
        wordCountRange: [150, 250],
      },
      {
        type: "testimonials",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["testimonials-carousel"],
        wordCountRange: [80, 150],
      },
      {
        type: "stats",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["stats-row"],
        wordCountRange: [40, 80],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-02",
        "space_ds:space-hero-banner-with-media",
      ],
      selectionGuidance:
        "Home heroes need maximum visual impact. Use hero-banner-style-02 (full-width bg image with title, sub-headline, and stats slot) for dramatic imagery. Use hero-banner-with-media (split with featured image) for balanced text+image layouts.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Start bold (hero), alternate between visual-rich and text-focused sections, end with a strong CTA. Never place two text-heavy sections back-to-back.",
    },
    avoidComponents: ["space_ds:space-accordion"],
    closingPattern:
      "End with a CTA banner. Optionally precede it with testimonials or stats for social proof before the ask.",
    compositionGuidance: [
      "Every content section should start with a space-section-heading (label, title, description) before the content grid.",
      "Use flexi column layouts rather than stacking individual components as separate sections.",
      "TESTIMONIALS: Use slider organism with testimony-cards in the slide_item slot for a carousel effect.",
      "FEATURES: Use a flexi grid (33-33-33 or 25-25-25-25) with icon + heading + text per column.",
      "STATS: Use a flexi grid (25-25-25-25) with stats-kpi components, or place stats in the hero items slot.",
    ].join("\n"),
  },

  // -- About ----------------------------------------------------------------
  {
    pageType: "about",
    slugPatterns: ["about", "about-us", "our-story", "who-we-are"],
    titlePatterns: ["about", "our story", "who we are"],
    description:
      "Narrative-driven page — builds trust through story, team, and values",
    sectionCountRange: [6, 8],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-style-02",
          "space_ds:space-hero-banner-with-media",
        ],
        wordCountRange: [40, 80],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "text-image-split-66-33", "full-width-text"],
        wordCountRange: [200, 350],
      },
      {
        type: "team",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["team-grid-4col", "team-grid-3col"],
        wordCountRange: [50, 100],
      },
      {
        type: "stats",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["stats-row"],
        wordCountRange: [40, 80],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-02",
        "space_ds:space-hero-banner-with-media",
      ],
      selectionGuidance:
        "About page heroes should support narrative. Use hero-banner-style-02 (bg image with title/sub-headline) for a mission-forward feel. Use hero-banner-with-media (split with image) for a balanced story intro.",
    },
    rhythm: {
      pattern: "heavy-light-medium-light-heavy",
      guidance:
        "Open with a narrative hero, follow with the core story (text-heavy), break up with a visual team or stats section, close with a warm CTA. The page should feel personal and flowing.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a warm CTA (e.g., 'Let's work together' or 'Get to know us better').",
    compositionGuidance: [
      "Every content section should start with a space-section-heading (label, title, description) before the content grid.",
      "Use flexi column layouts rather than stacking individual components as separate sections.",
      "TEAM: Use a flexi grid (25-25-25-25 or 33-33-33) with user-card components in column slots.",
      "TESTIMONIALS (if used): Use slider organism with testimony-cards in the slide_item slot.",
      "TEXT SECTIONS: Alternate text-image-split-50-50 and image-text-split-33-66 for visual variety.",
    ].join("\n"),
  },

  // -- Services -------------------------------------------------------------
  {
    pageType: "services",
    slugPatterns: [
      "services",
      "what-we-do",
      "solutions",
      "offerings",
      "practice-areas",
    ],
    titlePatterns: [
      "services",
      "what we do",
      "solutions",
      "offerings",
      "practice areas",
    ],
    description:
      "Showcase page — highlight service offerings with clear differentiation and CTAs",
    sectionCountRange: [6, 9],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-with-media",
          "space_ds:space-hero-banner-style-02",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["features-grid-3col", "features-grid-4col"],
        wordCountRange: [150, 300],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "image-text-split-33-66"],
        wordCountRange: [100, 200],
      },
      {
        type: "testimonials",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["testimonials-carousel"],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-with-media",
        "space_ds:space-hero-banner-style-02",
      ],
      selectionGuidance:
        "Services heroes should feel professional and action-oriented. Use hero-banner-with-media (split with featured image) for a versatile look. Use hero-banner-style-02 (full bg image) for dramatic service showcases.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Open with impact, present services in visually distinct blocks, break up dense content with lighter sections, close with a conversion CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a CTA banner pushing consultation or inquiry. Consider testimonials just before the CTA for social proof.",
    compositionGuidance: [
      "Every content section should start with a space-section-heading (label, title, description) before the content grid.",
      "FEATURES: Use flexi grid (33-33-33) with icon + heading + text per column for service highlights.",
      "TEXT: Use text-image-split patterns to describe individual services in detail.",
      "FAQ (if used): Use accordion organism with accordion-item children for service-related questions.",
      "TESTIMONIALS (if used): Use slider organism with testimony-cards in the slide_item slot.",
    ].join("\n"),
  },

  // -- Contact --------------------------------------------------------------
  {
    pageType: "contact",
    slugPatterns: ["contact", "contact-us", "get-in-touch", "reach-us"],
    titlePatterns: ["contact", "get in touch", "reach us"],
    description:
      "Utility page — minimal content, focused on contact info cards",
    sectionCountRange: [4, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "medium",
        preferredPatterns: ["space_ds:space-hero-banner-style-02"],
        wordCountRange: [20, 40],
      },
      {
        type: "contact",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["contact-info"],
        wordCountRange: [50, 100],
      },
      {
        type: "faq",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["faq-accordion"],
        wordCountRange: [100, 200],
      },
    ],
    heroRule: {
      preferredStyles: ["space_ds:space-hero-banner-style-02"],
      selectionGuidance:
        "Contact heroes should be understated. Use hero-banner-style-02 with a simple background image and minimal text to keep focus on the contact information below.",
    },
    rhythm: {
      pattern: "medium-light",
      guidance:
        "Keep it brief. A simple hero followed by contact cards. Do NOT pad with unnecessary sections.",
    },
    avoidComponents: [
      "space_ds:space-stats-kpi",
      "space_ds:space-testimony-card",
    ],
    closingPattern:
      "The contact info IS the closing. No separate CTA needed.",
    compositionGuidance: [
      "CONTACT: Use flexi grid (33-33-33) with contact-card components for email, phone, and other channels.",
      "FAQ (if used): Use accordion organism with accordion-item children for common contact questions.",
      "Contact pages are minimal. Use space-section-heading before the contact cards grid.",
    ].join("\n"),
  },

  // -- Portfolio / Gallery --------------------------------------------------
  {
    pageType: "portfolio",
    slugPatterns: ["portfolio", "gallery", "our-work", "projects", "case-studies"],
    titlePatterns: ["portfolio", "gallery", "our work", "projects", "case studies"],
    description:
      "Visual showcase page — let the work speak through imagery and brief captions",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-hero-banner-with-media"],
        wordCountRange: [20, 40],
      },
      {
        type: "gallery",
        required: true,
        position: "middle",
        visualWeight: "heavy",
        preferredPatterns: ["card-grid-3col", "card-carousel"],
        wordCountRange: [50, 100],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "full-width-text"],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["space_ds:space-hero-banner-with-media"],
      selectionGuidance:
        "Portfolio heroes should be image-forward. Use hero-banner-with-media (split with featured image) to showcase a highlight project immediately.",
    },
    rhythm: {
      pattern: "heavy-heavy-light-heavy",
      guidance:
        "Visual-first page. Open with a strong hero, showcase work in image-rich card grids, optionally add a brief narrative, close with CTA.",
    },
    avoidComponents: ["space_ds:space-accordion"],
    closingPattern:
      "End with a CTA to start a project or view more work.",
    compositionGuidance: [
      "GALLERY: Use flexi grid (33-33-33) with imagecard components, or use a slider with imagecards in the slide_item slot for a carousel.",
      "Every content section should start with a space-section-heading before the content grid.",
      "TESTIMONIALS (if used): Use slider organism with testimony-cards in the slide_item slot.",
    ].join("\n"),
  },

  // -- FAQ ------------------------------------------------------------------
  {
    pageType: "faq",
    slugPatterns: ["faq", "frequently-asked-questions", "help"],
    titlePatterns: ["faq", "frequently asked", "common questions"],
    description:
      "Utility page — comprehensive Q&A in collapsible format, minimal surrounding content",
    sectionCountRange: [4, 6],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "light",
        preferredPatterns: ["space_ds:space-hero-banner-style-02"],
        wordCountRange: [15, 30],
      },
      {
        type: "faq",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["faq-accordion"],
        wordCountRange: [300, 600],
      },
      {
        type: "cta",
        required: false,
        position: "closing",
        visualWeight: "medium",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["space_ds:space-hero-banner-style-02"],
      selectionGuidance:
        "FAQ heroes should be minimal. Use hero-banner-style-02 with a simple background and minimal text to keep focus on the accordion content.",
    },
    rhythm: {
      pattern: "light-light-medium",
      guidance:
        "Minimal hero, let the accordion do the work. Optionally add a CTA at the end.",
    },
    avoidComponents: [
      "space_ds:space-stats-kpi",
    ],
    closingPattern:
      "Optionally end with a CTA pointing to contact for unanswered questions.",
    compositionGuidance:
      "FAQ: Use accordion organism with accordion-item children. Each Q&A pair becomes an accordion-item with title (question) and body (answer). Precede the accordion with a space-section-heading.",
  },

  // -- Team -----------------------------------------------------------------
  {
    pageType: "team",
    slugPatterns: ["team", "our-team", "staff", "people", "leadership"],
    titlePatterns: ["team", "our team", "people", "staff", "leadership"],
    description:
      "People-focused page — introduce team members with photos, roles, and brief bios",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-style-02",
          "space_ds:space-hero-banner-with-media",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["full-width-text", "text-image-split-50-50"],
        wordCountRange: [100, 200],
      },
      {
        type: "team",
        required: true,
        position: "middle",
        visualWeight: "heavy",
        preferredPatterns: ["team-grid-4col", "team-grid-3col"],
        wordCountRange: [50, 100],
      },
      {
        type: "cta",
        required: false,
        position: "closing",
        visualWeight: "medium",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-02",
        "space_ds:space-hero-banner-with-media",
      ],
      selectionGuidance:
        "Team page heroes should set a welcoming tone. Use hero-banner-style-02 for a simple, mission-forward intro. Use hero-banner-with-media for a narrative intro with team photo.",
    },
    rhythm: {
      pattern: "heavy-light-heavy-medium",
      guidance:
        "Hero -> optional narrative intro -> team grid as the centerpiece -> optional CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "The team grid is the main content. Optionally close with a hiring CTA or contact CTA.",
    compositionGuidance: [
      "TEAM: Use a flexi grid (25-25-25-25 or 33-33-33) with user-card components. Each user-card has name, role, image, and social links.",
      "Every content section should start with a space-section-heading before the content grid.",
      "TESTIMONIALS (if used): Use slider organism with testimony-cards in the slide_item slot.",
    ].join("\n"),
  },

  // -- Landing --------------------------------------------------------------
  {
    pageType: "landing",
    slugPatterns: ["landing", "promo", "campaign", "offer", "special"],
    titlePatterns: ["landing", "special offer", "limited time", "exclusive"],
    description:
      "Conversion-focused page — single goal, persuasive flow, urgency, minimal distractions",
    sectionCountRange: [6, 8],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-style-02",
          "space_ds:space-hero-banner-with-media",
          "space_ds:space-video-banner",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["features-grid-3col", "features-grid-4col"],
        wordCountRange: [100, 200],
      },
      {
        type: "testimonials",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["testimonials-carousel"],
        wordCountRange: [80, 150],
      },
      {
        type: "logos",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["logo-showcase"],
        wordCountRange: [10, 30],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-02",
        "space_ds:space-hero-banner-with-media",
        "space_ds:space-video-banner",
      ],
      selectionGuidance:
        "Landing heroes need to capture attention immediately. Use hero-banner-style-02 (full bg image) for dramatic impact. Use hero-banner-with-media (split with image) for balanced copy+visual. Use video-banner for video-ready campaigns.",
    },
    rhythm: {
      pattern: "heavy-medium-medium-heavy",
      guidance:
        "Hook immediately (hero), build value (features), prove it (testimonials), close the deal (CTA). Every section should drive toward the single conversion goal.",
    },
    avoidComponents: ["space_ds:space-accordion"],
    closingPattern:
      "End with a strong, urgent CTA. The entire page should funnel toward this single action.",
    compositionGuidance: [
      "Every content section should start with a space-section-heading (label, title, description) before the content grid.",
      "TESTIMONIALS: Use slider organism with testimony-cards in the slide_item slot for social proof.",
      "FEATURES: Use a flexi grid (33-33-33) with icon + heading + text per column for benefit highlights.",
      "LOGOS: Use logo-section organism for client/partner social proof.",
    ].join("\n"),
  },

  // -- Generic (fallback) ---------------------------------------------------
  {
    pageType: "generic",
    slugPatterns: [],
    titlePatterns: [],
    description:
      "General-purpose page — balanced mix of content sections with reasonable defaults",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "space_ds:space-hero-banner-style-02",
          "space_ds:space-hero-banner-with-media",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "full-width-text"],
        wordCountRange: [150, 300],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-02",
        "space_ds:space-hero-banner-with-media",
      ],
      selectionGuidance:
        "Default to hero-banner-style-02 (full bg image) for a professional look. Use hero-banner-with-media (split with image) for a versatile alternative.",
    },
    rhythm: {
      pattern: "heavy-light-heavy",
      guidance:
        "Start with a hero, deliver the main content, close with a CTA. Keep it balanced.",
    },
    avoidComponents: [],
    closingPattern: "End with a CTA banner.",
    compositionGuidance: [
      "Every content section should start with a space-section-heading (label, title, description) before the content grid.",
      "Use flexi column layouts rather than stacking individual components as separate sections.",
      "TESTIMONIALS (if used): Use slider organism with testimony-cards in the slide_item slot.",
      "FAQ (if used): Use accordion organism with accordion-item children.",
      "TEAM (if used): Use a flexi grid (25-25-25-25 or 33-33-33) with user-card components.",
    ].join("\n"),
  },
];

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * Classify a page's type from its slug and title. Deterministic — no AI call.
 */
export function classifyPageType(slug: string, title: string): PageType {
  const s = slug.toLowerCase().trim();
  const t = title.toLowerCase().trim();

  for (const rule of PAGE_DESIGN_RULES) {
    if (rule.pageType === "generic") continue; // fallback, check last
    if (
      rule.slugPatterns.some(
        (p) => s === p || s.startsWith(p + "-") || s.endsWith("-" + p)
      )
    ) {
      return rule.pageType;
    }
    if (rule.titlePatterns.some((p) => t.includes(p))) {
      return rule.pageType;
    }
  }
  return "generic";
}

/**
 * Get the design rule for a page type.
 */
export function getRule(pageType: PageType): PageDesignRule {
  return (
    PAGE_DESIGN_RULES.find((r) => r.pageType === pageType) ??
    PAGE_DESIGN_RULES.find((r) => r.pageType === "generic")!
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a preferred pattern name to a human-readable description.
 * If the name is a component ID (starts with "space_ds:"), return it as-is.
 * Otherwise, look up the composition pattern description.
 */
function resolvePatternLabel(patternName: string): string {
  if (patternName.startsWith("space_ds:")) {
    return patternName;
  }
  const pattern = COMPOSITION_PATTERNS[patternName];
  return pattern ? `${patternName} (${pattern.description})` : patternName;
}

// ---------------------------------------------------------------------------
// Prompt Formatters
// ---------------------------------------------------------------------------

/**
 * Format rules for the plan phase prompt. Produces per-page guidance lines
 * to replace the hardcoded plan.ts guidelines.
 */
export function formatRulesForPlan(
  pages: Array<{ slug: string; title: string }>
): string[] {
  const lines: string[] = [
    `## MANDATORY Page Composition Requirements`,
    ``,
    `CRITICAL: Each page MUST meet the minimum section count specified below. This is a hard constraint, NOT a suggestion. Pages with fewer sections than the minimum will be REJECTED and regenerated.`,
    ``,
    `### Space DS v2 Compositional Model`,
    `Sections are composed from layout primitives (space-flexi for multi-column, space-container for full-width) with atoms/molecules placed in slots. Every content section should start with a space-section-heading.`,
    ``,
  ];

  for (const page of pages) {
    const pageType = classifyPageType(page.slug, page.title);
    const rule = getRule(pageType);
    const required = rule.sections
      .filter((s) => s.required)
      .map((s) => {
        const pos = s.position !== "any" ? ` (${s.position})` : "";
        const wordRange = `~${s.wordCountRange[0]}-${s.wordCountRange[1]} words`;
        const patternLabel = resolvePatternLabel(s.preferredPatterns[0]);
        return `${s.type}${pos} [${wordRange}] -> ${patternLabel}`;
      });
    const optional = rule.sections
      .filter((s) => !s.required)
      .map((s) => {
        const patternLabel = resolvePatternLabel(s.preferredPatterns[0]);
        return `${s.type} -> ${patternLabel}`;
      });
    lines.push(
      `- **${page.title}** (/${page.slug}) [${pageType}]:`,
      `  - MINIMUM ${rule.sectionCountRange[0]} sections, up to ${rule.sectionCountRange[1]}`,
      `  - REQUIRED sections: ${required.join(", ")}`,
      optional.length > 0 ? `  - Optional sections (pick 1-2): ${optional.join(", ")}` : ``,
      `  - Rhythm: ${rule.rhythm.guidance}`,
      rule.compositionGuidance ? `  - Composition: ${rule.compositionGuidance.split("\n")[0]}` : ``,
    );
  }

  lines.push(
    ``,
    `REMINDER: Do NOT produce pages with only 2-3 sections. Content-rich pages (home, services, about, landing) MUST have at least 5-6 sections to provide sufficient depth for a professional website.`
  );

  return lines.filter(Boolean);
}

/**
 * Format rules for the generation phase prompt. Produces composition rules,
 * hero selection guidance, and component mapping for a specific page.
 */
export function formatRulesForGeneration(
  slug: string,
  title: string
): string[] {
  const pageType = classifyPageType(slug, title);
  const rule = getRule(pageType);

  const lines: string[] = [];

  // Composition rules
  lines.push(
    `## Page Composition Rules (${pageType} page)`,
    `${rule.description}`,
    ``,
    `Section count: ${rule.sectionCountRange[0]}-${rule.sectionCountRange[1]}`,
    ``
  );

  // Required/optional sections with composition patterns
  lines.push(`Required sections:`);
  for (const s of rule.sections.filter((s) => s.required)) {
    const pos = s.position !== "any" ? ` — position: ${s.position}` : "";
    const patternLabel = resolvePatternLabel(s.preferredPatterns[0]);
    lines.push(
      `- ${s.type}${pos} (~${s.wordCountRange[0]}-${s.wordCountRange[1]} words) -> prefer: ${patternLabel}`
    );
  }

  const optional = rule.sections.filter((s) => !s.required);
  if (optional.length > 0) {
    lines.push(``, `Optional sections (use 1-2 as needed):`);
    for (const s of optional) {
      const patternLabel = resolvePatternLabel(s.preferredPatterns[0]);
      lines.push(
        `- ${s.type} (~${s.wordCountRange[0]}-${s.wordCountRange[1]} words) -> prefer: ${patternLabel}`
      );
    }
  }

  // Hero selection
  lines.push(
    ``,
    `## Hero Style Selection`,
    `Recommended for ${pageType} pages: ${rule.heroRule.preferredStyles.map((s) => `"${s}"`).join(", ")}`,
    rule.heroRule.selectionGuidance,
    ``
  );

  // Composition pattern reference
  lines.push(
    `## Composition Patterns Reference`,
    `Sections are built by composing layout primitives with atoms/molecules:`,
    ``
  );

  // Collect all patterns referenced by this page type's sections
  const referencedPatterns = new Set<string>();
  for (const s of rule.sections) {
    for (const p of s.preferredPatterns) {
      if (!p.startsWith("space_ds:")) {
        referencedPatterns.add(p);
      }
    }
  }

  for (const patternName of referencedPatterns) {
    const pattern = COMPOSITION_PATTERNS[patternName];
    if (!pattern) continue;
    const layoutStr = pattern.layout
      ? `flexi(${pattern.layout.column_width}${pattern.layout.gap ? `, gap: ${pattern.layout.gap}` : ""})`
      : "organism-level (no flexi wrapper)";
    lines.push(
      `- **${pattern.name}**: ${pattern.description}`,
      `  Layout: ${layoutStr}`,
      `  Children: ${pattern.children.map((c) => `"${c}"`).join(", ")}`,
      ``
    );
  }

  // Component mapping for this page type
  lines.push(
    `## Component ID Mapping (${pageType} page)`
  );

  const sectionTypeMap: Record<string, string[]> = {
    hero: rule.heroRule.preferredStyles,
    cta: ["space_ds:space-cta-banner-type-1"],
    "text/about": ["text-image-split-50-50", "text-image-split-66-33", "full-width-text"],
    features: ["features-grid-3col", "features-grid-4col"],
    testimonials: ["testimonials-carousel"],
    team: ["team-grid-4col", "team-grid-3col"],
    faq: ["faq-accordion"],
    "stats/kpi": ["stats-row"],
    "gallery/cards": ["card-grid-3col", "card-carousel"],
    contact: ["contact-info"],
    logos: ["logo-showcase"],
    "section-heading": ["space_ds:space-section-heading"],
  };

  for (const [sectionType, patterns] of Object.entries(sectionTypeMap)) {
    const labels = patterns.map((p) => {
      if (p.startsWith("space_ds:")) return `"${p}"`;
      return `"${p}"`;
    }).join(" or ");
    lines.push(`- ${sectionType} -> ${labels}`);
  }

  // Avoid list
  if (rule.avoidComponents.length > 0) {
    lines.push(
      ``,
      `AVOID on ${pageType} pages: ${rule.avoidComponents.map((c) => `"${c}"`).join(", ")}`
    );
  }

  // Section heading + container guidance
  lines.push(
    ``,
    `## Section Composition Rules (CRITICAL)`,
    `Every content section should follow this structure:`,
    `1. space-container (with background_color alternating between sections)`,
    `2. space-section-heading (label, title, description) at the top of the container`,
    `3. space-flexi layout OR organism component for the section content`,
    ``,
    `Background alternation: alternate between light (white/light-gray) and colored (brand accent) backgrounds to create visual rhythm.`,
    ``
  );

  // Anti-monotony & image alternation rules
  lines.push(
    `## Anti-Monotony Rules`,
    `- NEVER use the same composition pattern in two consecutive sections`,
    `- When two text+image sections appear near each other, alternate the image position:`,
    `  - First: text-image-split-50-50 or text-image-split-66-33 (image on right)`,
    `  - Second: image-text-split-33-66 (image on left)`,
    `- Vary visual weight between sections (heavy → light → medium → light → heavy)`,
    ``
  );

  // Heading hierarchy rules
  lines.push(
    `## Heading Hierarchy (Semantic HTML)`,
    `- Hero title = h1 (the ONLY h1 on the page)`,
    `- Section headings (space-section-heading title) = h2`,
    `- Subsection headings within content columns = h3`,
    `- Card/item titles = h3 or h4`,
    `- Never skip heading levels (no h1 → h3 without h2 in between)`,
    ``
  );

  // Icon validation
  lines.push(
    `## Icon Validation`,
    `- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)`,
    `- Safe values: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-line, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe`,
    ``
  );

  // Flexi column matching
  lines.push(
    `## Flexi Column Matching`,
    `- column_width segments MUST equal the number of children in the flexi grid`,
    `- "33-33-33" = exactly 3 children (column_one, column_two, column_three)`,
    `- "50-50" = exactly 2 children (column_one, column_two)`,
    `- "25-25-25-25" = exactly 4 children (column_one, column_two, column_three, column_four)`,
    `- "100" = exactly 1 child (column_one or content)`,
    ``
  );

  // Page-specific composition guidance
  if (rule.compositionGuidance) {
    lines.push(
      `## Composition Guidance`,
      rule.compositionGuidance
    );
  }

  // Rhythm
  lines.push(
    ``,
    `## Visual Rhythm`,
    rule.rhythm.guidance,
    `Pattern: ${rule.rhythm.pattern}`,
    `Closing: ${rule.closingPattern}`
  );

  return lines;
}
