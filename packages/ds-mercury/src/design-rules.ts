import type { PageDesignRule } from "@ai-builder/ds-types";

/**
 * Page Design Rules — declarative composition constraints per page type.
 *
 * Guides the AI to produce design-consistent pages using Mercury components.
 */
export const PAGE_DESIGN_RULES: PageDesignRule[] = [
  // -- Home -----------------------------------------------------------------
  {
    pageType: "home",
    slugPatterns: ["home", ""],
    titlePatterns: ["home", "welcome", "homepage"],
    description:
      "Primary landing page — maximum visual impact, clear value proposition, social proof, strong CTA",
    sectionCountRange: [9, 11],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: [
          "mercury:hero-billboard",
          "mercury:hero-side-by-side",
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
        preferredPatterns: ["text-image-split-50-50", "text-image-split-67-33"],
        wordCountRange: [150, 250],
      },
      {
        type: "highlights",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["features-grid-4col", "card-grid-3col"],
        wordCountRange: [60, 120],
      },
      {
        type: "testimonials",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["testimonials-grid-3col"],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-billboard",
        "mercury:hero-side-by-side",
      ],
      selectionGuidance:
        "Home heroes need maximum visual impact. Use hero-billboard (full-width bg image with overlay) for dramatic imagery. Use hero-side-by-side (split with featured image) for balanced text+image layouts.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Start bold (hero), alternate between visual-rich and text-focused sections, end with a strong CTA. Never place two text-heavy sections back-to-back.",
    },
    avoidComponents: ["mercury:accordion-container"],
    closingPattern:
      "End with a CTA. Optionally precede it with testimonials or logo showcase for social proof before the ask.",
    compositionGuidance: [
      "Every content section should include a heading in the section header_slot before content in main_slot.",
      "TESTIMONIALS: Use a section with 33-33-33 columns containing card-testimonial components in main_slot.",
      "FEATURES: Use a section with 33-33-33 or 25-25-25-25 columns containing card-icon components in main_slot.",
      "HIGHLIGHTS: Use a section with 25-25-25-25 or 33-33-33 columns containing card-icon components to showcase key stats or differentiators.",
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
          "mercury:hero-billboard",
          "mercury:hero-side-by-side",
        ],
        wordCountRange: [40, 80],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "text-image-split-67-33", "full-width-text"],
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
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-billboard",
        "mercury:hero-side-by-side",
      ],
      selectionGuidance:
        "About page heroes should support narrative. Use hero-billboard for a mission-forward feel. Use hero-side-by-side for a balanced story intro with image.",
    },
    rhythm: {
      pattern: "heavy-light-medium-light-heavy",
      guidance:
        "Open with a narrative hero, follow with the core story (text-heavy), break up with a visual team section, close with a warm CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a warm CTA (e.g., 'Let's work together' or 'Get to know us better').",
    compositionGuidance: [
      "Every content section should include a heading in the section header_slot.",
      "TEAM: Use a section with 33-33-33 or 25-25-25-25 columns containing card components with team member photos.",
      "TEXT SECTIONS: Alternate text-image-split-50-50 and image-text-split-33-67 for visual variety.",
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
          "mercury:hero-side-by-side",
          "mercury:hero-billboard",
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
        preferredPatterns: ["text-image-split-50-50", "image-text-split-33-67"],
        wordCountRange: [100, 200],
      },
      {
        type: "testimonials",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["testimonials-grid-3col"],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-side-by-side",
        "mercury:hero-billboard",
      ],
      selectionGuidance:
        "Services heroes should feel professional. Use hero-side-by-side for a versatile split layout. Use hero-billboard for dramatic service showcases.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Open with impact, present services in visually distinct blocks, break up dense content with lighter sections, close with a conversion CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a CTA pushing consultation or inquiry. Consider testimonials just before the CTA for social proof.",
    compositionGuidance: [
      "FEATURES: Use section with 33-33-33 columns containing card-icon components for service highlights.",
      "TEXT: Use text-image-split patterns to describe individual services in detail.",
      "FAQ (if used): Use accordion-container with accordion children for service-related questions.",
      "TESTIMONIALS: Use section with 33-33-33 columns containing card-testimonial components.",
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
        preferredPatterns: ["mercury:hero-billboard"],
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
      preferredStyles: ["mercury:hero-billboard"],
      selectionGuidance:
        "Contact heroes should be understated. Use hero-billboard with a simple background and minimal text to keep focus on the contact information below.",
    },
    rhythm: {
      pattern: "medium-light",
      guidance:
        "Keep it brief. A simple hero followed by contact cards. Do NOT pad with unnecessary sections.",
    },
    avoidComponents: [
      "mercury:card-testimonial",
      "mercury:card-pricing",
    ],
    closingPattern:
      "The contact info IS the closing. No separate CTA needed.",
    compositionGuidance: [
      "CONTACT: Use section with 33-33-33 columns containing card-icon components for email, phone, and other channels.",
      "FAQ (if used): Use accordion-container with accordion children for common contact questions.",
      "Contact pages are minimal. Use a heading in the section header_slot before the contact cards.",
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
        preferredPatterns: ["mercury:hero-side-by-side"],
        wordCountRange: [20, 40],
      },
      {
        type: "gallery",
        required: true,
        position: "middle",
        visualWeight: "heavy",
        preferredPatterns: ["card-grid-3col"],
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
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["mercury:hero-side-by-side"],
      selectionGuidance:
        "Portfolio heroes should be image-forward. Use hero-side-by-side to showcase a highlight project immediately.",
    },
    rhythm: {
      pattern: "heavy-heavy-light-heavy",
      guidance:
        "Visual-first page. Open with a strong hero, showcase work in card grids, optionally add a brief narrative, close with CTA.",
    },
    avoidComponents: ["mercury:accordion-container"],
    closingPattern:
      "End with a CTA to start a project or view more work.",
    compositionGuidance: [
      "GALLERY: Use section with 33-33-33 columns containing card components with project images.",
      "Every content section should include a heading in the section header_slot.",
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
        preferredPatterns: ["mercury:hero-billboard"],
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
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["mercury:hero-billboard"],
      selectionGuidance:
        "FAQ heroes should be minimal. Use hero-billboard with a simple background and minimal text to keep focus on the accordion content.",
    },
    rhythm: {
      pattern: "light-light-medium",
      guidance:
        "Minimal hero, let the accordion do the work. Optionally add a CTA at the end.",
    },
    avoidComponents: [],
    closingPattern:
      "Optionally end with a CTA pointing to contact for unanswered questions.",
    compositionGuidance:
      "FAQ: Use a section (100 column) with an accordion-container in main_slot. Each Q&A pair becomes an accordion with title (question) and text content (answer). Precede with a heading in header_slot.",
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
          "mercury:hero-billboard",
          "mercury:hero-side-by-side",
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
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-billboard",
        "mercury:hero-side-by-side",
      ],
      selectionGuidance:
        "Team page heroes should set a welcoming tone. Use hero-billboard for a simple, mission-forward intro. Use hero-side-by-side for a narrative intro with team photo.",
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
      "TEAM: Use a section with 25-25-25-25 or 33-33-33 columns containing card components with member photos, names, and roles.",
      "Every content section should include a heading in the section header_slot.",
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
          "mercury:hero-billboard",
          "mercury:hero-side-by-side",
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
        preferredPatterns: ["testimonials-grid-3col"],
        wordCountRange: [80, 150],
      },
      {
        type: "pricing",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredPatterns: ["pricing-grid-3col"],
        wordCountRange: [60, 120],
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
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-billboard",
        "mercury:hero-side-by-side",
      ],
      selectionGuidance:
        "Landing heroes need to capture attention immediately. Use hero-billboard for dramatic impact. Use hero-side-by-side for balanced copy+visual.",
    },
    rhythm: {
      pattern: "heavy-medium-medium-heavy",
      guidance:
        "Hook immediately (hero), build value (features), prove it (testimonials), close the deal (CTA). Every section should drive toward the single conversion goal.",
    },
    avoidComponents: ["mercury:accordion-container"],
    closingPattern:
      "End with a strong, urgent CTA. The entire page should funnel toward this single action.",
    compositionGuidance: [
      "TESTIMONIALS: Use section with 33-33-33 columns containing card-testimonial components for social proof.",
      "FEATURES: Use section with 33-33-33 columns containing card-icon components for benefit highlights.",
      "PRICING: Use section with 33-33-33 columns containing card-pricing components.",
      "LOGOS: Use section with 25-25-25-25 columns containing card-logo components for client/partner social proof.",
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
          "mercury:hero-billboard",
          "mercury:hero-side-by-side",
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
        preferredPatterns: ["mercury:cta"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "mercury:hero-billboard",
        "mercury:hero-side-by-side",
      ],
      selectionGuidance:
        "Default to hero-billboard for a professional look. Use hero-side-by-side for a versatile alternative.",
    },
    rhythm: {
      pattern: "heavy-light-heavy",
      guidance:
        "Start with a hero, deliver the main content, close with a CTA. Keep it balanced.",
    },
    avoidComponents: [],
    closingPattern: "End with a CTA.",
    compositionGuidance: [
      "Every content section should include a heading in the section header_slot.",
      "TESTIMONIALS (if used): Use section with 33-33-33 columns containing card-testimonial components.",
      "FAQ (if used): Use accordion-container with accordion children.",
      "TEAM (if used): Use section with 25-25-25-25 or 33-33-33 columns containing card components.",
    ].join("\n"),
  },
];
