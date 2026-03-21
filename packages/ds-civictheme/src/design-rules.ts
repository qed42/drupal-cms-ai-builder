import type { PageDesignRule } from "@ai-builder/ds-types";

/**
 * Page Design Rules for CivicTheme.
 *
 * These reference CivicTheme organisms directly instead of flexi grids.
 * Sections alternate between light/dark theme for visual rhythm.
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
        preferredPatterns: ["civictheme:campaign", "civictheme:banner"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:campaign", "civictheme:banner"],
      selectionGuidance:
        "Home heroes need maximum visual impact. Use campaign (full-width bg image with video support) for dramatic landing pages. Use banner (standard hero with breadcrumb) for professional sites.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Start bold (hero), alternate between visual-rich and text-focused sections, end with a strong CTA callout. Alternate light/dark theme per section for visual rhythm.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a civictheme:callout (dark theme). Optionally precede it with testimonials for social proof.",
    compositionGuidance: [
      "Use pre-composed organisms — never try to build grids from atoms.",
      "FEATURES: Use civictheme:list with civictheme:navigation-card children.",
      "TEXT+IMAGE: Use civictheme:promo organism directly — it handles layout internally.",
      "TESTIMONIALS: Use civictheme:slider with civictheme:snippet children.",
      "STATS: Use civictheme:list with civictheme:promo-card children displaying stat values.",
      "CTA: Use civictheme:callout with button children in the cta slot.",
      "Alternate theme: light/dark between sections for visual rhythm.",
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
        preferredPatterns: ["civictheme:banner", "civictheme:campaign"],
        wordCountRange: [40, 80],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredPatterns: ["text-image-split-50-50", "full-width-text"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:banner", "civictheme:campaign"],
      selectionGuidance:
        "About page heroes should support narrative. Use banner for a clean, mission-forward feel. Use campaign for a visual story intro with background imagery.",
    },
    rhythm: {
      pattern: "heavy-light-medium-light-heavy",
      guidance:
        "Open with narrative hero, follow with story (promo sections), break with team list, close with warm CTA callout. Alternate light/dark theme.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a warm civictheme:callout (e.g., 'Let's work together').",
    compositionGuidance: [
      "TEXT SECTIONS: Use civictheme:promo for text+image blocks.",
      "TEAM: Use civictheme:list with civictheme:promo-card children.",
      "Alternate civictheme:promo sections for visual variety.",
      "Use civictheme:callout for CTA sections.",
    ].join("\n"),
  },

  // -- Services -------------------------------------------------------------
  {
    pageType: "services",
    slugPatterns: ["services", "what-we-do", "solutions", "offerings", "practice-areas"],
    titlePatterns: ["services", "what we do", "solutions", "offerings", "practice areas"],
    description:
      "Showcase page — highlight service offerings with clear differentiation",
    sectionCountRange: [6, 9],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: ["civictheme:banner", "civictheme:campaign"],
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
        preferredPatterns: ["text-image-split-50-50"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:banner", "civictheme:campaign"],
      selectionGuidance:
        "Services heroes should feel professional. Use banner for clean service intros. Use campaign for dramatic service showcases.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Open with impact, present services in list/card blocks, break with promo text sections, close with CTA callout.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a CTA callout pushing consultation or inquiry.",
    compositionGuidance: [
      "FEATURES: Use civictheme:list with civictheme:navigation-card children.",
      "TEXT: Use civictheme:promo for individual service descriptions.",
      "FAQ: Use civictheme:accordion with civictheme:accordion-panel children.",
      "TESTIMONIALS: Use civictheme:slider with civictheme:snippet children.",
    ].join("\n"),
  },

  // -- Contact --------------------------------------------------------------
  {
    pageType: "contact",
    slugPatterns: ["contact", "contact-us", "get-in-touch", "reach-us"],
    titlePatterns: ["contact", "get in touch", "reach us"],
    description:
      "Utility page — minimal content, focused on contact information",
    sectionCountRange: [4, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "medium",
        preferredPatterns: ["civictheme:banner"],
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
      preferredStyles: ["civictheme:banner"],
      selectionGuidance:
        "Contact heroes should be understated. Use banner with simple background to keep focus on contact info below.",
    },
    rhythm: {
      pattern: "medium-light",
      guidance: "Keep it brief. Hero followed by service-card contact info.",
    },
    avoidComponents: ["civictheme:snippet"],
    closingPattern: "The contact info IS the closing. No separate CTA needed.",
    compositionGuidance: [
      "CONTACT: Use civictheme:list with civictheme:service-card children for email, phone, etc.",
      "FAQ: Use civictheme:accordion with civictheme:accordion-panel children.",
      "Contact pages are minimal — do not pad with unnecessary sections.",
    ].join("\n"),
  },

  // -- Portfolio / Gallery --------------------------------------------------
  {
    pageType: "portfolio",
    slugPatterns: ["portfolio", "gallery", "our-work", "projects", "case-studies"],
    titlePatterns: ["portfolio", "gallery", "our work", "projects", "case studies"],
    description:
      "Visual showcase page — let the work speak through imagery",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: ["civictheme:campaign"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:campaign"],
      selectionGuidance:
        "Portfolio heroes should be image-forward. Use campaign for a dramatic visual showcase.",
    },
    rhythm: {
      pattern: "heavy-heavy-light-heavy",
      guidance: "Visual-first. Strong hero, image-rich card lists, optional narrative, CTA.",
    },
    avoidComponents: ["civictheme:accordion"],
    closingPattern: "End with a CTA callout to start a project or view more work.",
    compositionGuidance: [
      "GALLERY: Use civictheme:list with civictheme:promo-card children, or civictheme:carousel.",
      "TEXT: Use civictheme:promo for narrative sections.",
    ].join("\n"),
  },

  // -- FAQ ------------------------------------------------------------------
  {
    pageType: "faq",
    slugPatterns: ["faq", "frequently-asked-questions", "help"],
    titlePatterns: ["faq", "frequently asked", "common questions"],
    description:
      "Utility page — comprehensive Q&A in collapsible format",
    sectionCountRange: [4, 6],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "light",
        preferredPatterns: ["civictheme:banner"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:banner"],
      selectionGuidance:
        "FAQ heroes should be minimal. Use banner with simple background to keep focus on accordion content.",
    },
    rhythm: {
      pattern: "light-light-medium",
      guidance: "Minimal hero, let the accordion do the work. Optional CTA at end.",
    },
    avoidComponents: [],
    closingPattern:
      "Optionally end with a callout pointing to contact for unanswered questions.",
    compositionGuidance:
      "FAQ: Use civictheme:accordion with civictheme:accordion-panel children. Each Q&A pair is a panel with title (question) and content (answer HTML).",
  },

  // -- Team -----------------------------------------------------------------
  {
    pageType: "team",
    slugPatterns: ["team", "our-team", "staff", "people", "leadership"],
    titlePatterns: ["team", "our team", "people", "staff", "leadership"],
    description:
      "People-focused page — introduce team members with photos and roles",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: ["civictheme:banner", "civictheme:campaign"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:banner", "civictheme:campaign"],
      selectionGuidance:
        "Team page heroes should be welcoming. Use banner for clean intro. Use campaign for visual narrative with team photo.",
    },
    rhythm: {
      pattern: "heavy-light-heavy-medium",
      guidance: "Hero -> optional narrative (promo) -> team list as centerpiece -> optional CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "The team list is the main content. Optionally close with a hiring CTA callout.",
    compositionGuidance: [
      "TEAM: Use civictheme:list with civictheme:promo-card children (name, role, image).",
      "TEXT: Use civictheme:promo or civictheme:callout for narrative intro.",
    ].join("\n"),
  },

  // -- Landing --------------------------------------------------------------
  {
    pageType: "landing",
    slugPatterns: ["landing", "promo", "campaign", "offer", "special"],
    titlePatterns: ["landing", "special offer", "limited time", "exclusive"],
    description:
      "Conversion-focused page — single goal, persuasive flow, urgency",
    sectionCountRange: [6, 8],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredPatterns: ["civictheme:campaign", "civictheme:banner"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:campaign", "civictheme:banner"],
      selectionGuidance:
        "Landing heroes need to capture attention immediately. Use campaign for dramatic impact with video support. Use banner for clean, professional look.",
    },
    rhythm: {
      pattern: "heavy-medium-medium-heavy",
      guidance:
        "Hook immediately (hero), build value (features list), prove it (testimonials slider), close the deal (CTA callout).",
    },
    avoidComponents: ["civictheme:accordion"],
    closingPattern:
      "End with a strong, urgent CTA callout. The entire page funnels toward this single action.",
    compositionGuidance: [
      "FEATURES: Use civictheme:list with civictheme:navigation-card children.",
      "TESTIMONIALS: Use civictheme:slider with civictheme:snippet children.",
      "LOGOS: Use civictheme:list with civictheme:navigation-card children (logo images).",
      "CTA: Use civictheme:callout (dark theme) with button in cta slot.",
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
        preferredPatterns: ["civictheme:banner", "civictheme:campaign"],
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
        preferredPatterns: ["cta-banner"],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: ["civictheme:banner", "civictheme:campaign"],
      selectionGuidance:
        "Default to banner for a professional look. Use campaign for a more visual alternative.",
    },
    rhythm: {
      pattern: "heavy-light-heavy",
      guidance: "Start with hero, deliver main content via promo sections, close with CTA callout.",
    },
    avoidComponents: [],
    closingPattern: "End with a CTA callout.",
    compositionGuidance: [
      "Use civictheme:promo for text+image content sections.",
      "Use civictheme:callout for CTA sections.",
      "Use civictheme:list with appropriate card types for grid layouts.",
      "Use civictheme:accordion for FAQ sections.",
      "Alternate light/dark theme between sections.",
    ].join("\n"),
  },
];
