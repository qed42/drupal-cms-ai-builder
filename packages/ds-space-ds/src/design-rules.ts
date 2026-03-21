import type { PageDesignRule } from "@ai-builder/ds-types";

/**
 * Page Design Rules — declarative composition constraints per page type.
 *
 * Guides the AI to produce design-consistent pages by injecting page-type-specific
 * rules into the plan and generation prompts.
 */
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
