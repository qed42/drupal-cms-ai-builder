/**
 * Page Design Rules — declarative composition constraints per page type.
 *
 * Guides the AI to produce design-consistent pages by injecting page-type-specific
 * rules into the plan and generation prompts. Based on modern UI design patterns
 * and the Space DS component library.
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
  | "pricing"
  | "faq"
  | "team"
  | "landing"
  | "generic";

export interface SectionRule {
  type: string;
  required: boolean;
  position: "opening" | "middle" | "closing" | "any";
  visualWeight: "heavy" | "medium" | "light";
  preferredComponents: string[];
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
}

// ---------------------------------------------------------------------------
// Rules Data
// ---------------------------------------------------------------------------

export const PAGE_DESIGN_RULES: PageDesignRule[] = [
  // ── Home ──────────────────────────────────────────────────────────────
  {
    pageType: "home",
    slugPatterns: ["home", ""],
    titlePatterns: ["home", "welcome", "homepage"],
    description:
      "Primary landing page — maximum visual impact, clear value proposition, social proof, strong CTA",
    sectionCountRange: [5, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-01",
          "space_ds:space-hero-banner-style-05",
          "space_ds:space-hero-banner-style-10",
          "space_ds:space-hero-banner-style-11",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-text-media-with-checklist",
          "space_ds:space-text-media-with-stats",
        ],
        wordCountRange: [100, 200],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredComponents: [
          "space_ds:space-text-media-default",
          "space_ds:space-text-media-with-images",
        ],
        wordCountRange: [150, 250],
      },
      {
        type: "testimonials",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-testimony-card",
          "space_ds:space-people-card-testimony-with-avatar",
        ],
        wordCountRange: [80, 150],
      },
      {
        type: "stats",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: ["space_ds:space-stats-kpi"],
        wordCountRange: [40, 80],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-1",
          "space_ds:space-cta-banner-type-2",
        ],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-01",
        "space_ds:space-hero-banner-style-05",
        "space_ds:space-hero-banner-style-10",
        "space_ds:space-hero-banner-style-11",
      ],
      selectionGuidance:
        "Home heroes need maximum visual impact. Use style-01 (full-width background image) for dramatic imagery, style-05 (split 50/50) for balanced text+image, style-10 (dual images) for creative/agency sites, style-11 (gradient split) for modern tech brands.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Start bold (hero), alternate between visual-rich and text-focused sections, end with a strong CTA. Never place two text-heavy sections back-to-back.",
    },
    avoidComponents: ["space_ds:space-accordion"],
    closingPattern:
      "End with a CTA banner. Optionally precede it with testimonials or stats for social proof before the ask.",
  },

  // ── About ─────────────────────────────────────────────────────────────
  {
    pageType: "about",
    slugPatterns: ["about", "about-us", "our-story", "who-we-are"],
    titlePatterns: ["about", "our story", "who we are"],
    description:
      "Narrative-driven page — builds trust through story, team, and values",
    sectionCountRange: [4, 6],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-03",
          "space_ds:space-hero-banner-style-09",
          "space_ds:space-hero-banner-style-06",
        ],
        wordCountRange: [40, 80],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredComponents: [
          "space_ds:space-text-media-default",
          "space_ds:space-text-media-with-images",
        ],
        wordCountRange: [200, 350],
      },
      {
        type: "team",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-team-section-image-card-1",
          "space_ds:space-team-section-simple-1",
        ],
        wordCountRange: [50, 100],
      },
      {
        type: "stats",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-stats-kpi",
          "space_ds:space-text-media-with-stats",
        ],
        wordCountRange: [40, 80],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-1",
          "space_ds:space-cta-banner-type-3",
        ],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-03",
        "space_ds:space-hero-banner-style-09",
        "space_ds:space-hero-banner-style-08",
      ],
      selectionGuidance:
        "About page heroes should support narrative. Style-03 (split with description) tells your story. Style-09 (text-only) works when imagery is secondary. Style-08 (bold uppercase) suits mission-forward brands.",
    },
    rhythm: {
      pattern: "heavy-light-medium-light-heavy",
      guidance:
        "Open with a narrative hero, follow with the core story (text-heavy), break up with a visual team or stats section, close with a warm CTA. The page should feel personal and flowing.",
    },
    avoidComponents: [
      "space_ds:space-pricing-card",
      "space_ds:space-pricing-featured-card",
    ],
    closingPattern:
      "End with a warm CTA (e.g., 'Let's work together' or 'Get to know us better').",
  },

  // ── Services ──────────────────────────────────────────────────────────
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
    sectionCountRange: [4, 7],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-04",
          "space_ds:space-hero-banner-style-05",
          "space_ds:space-hero-banner-style-03",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-text-media-with-checklist",
          "space_ds:space-text-media-with-stats",
        ],
        wordCountRange: [150, 300],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredComponents: [
          "space_ds:space-text-media-default",
          "space_ds:space-text-media-with-images",
        ],
        wordCountRange: [100, 200],
      },
      {
        type: "testimonials",
        required: false,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-testimony-card",
          "space_ds:space-people-card-testimony-with-avatar",
        ],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-2",
          "space_ds:space-cta-banner-type-1",
        ],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-04",
        "space_ds:space-hero-banner-style-05",
        "space_ds:space-hero-banner-style-03",
      ],
      selectionGuidance:
        "Services heroes should feel professional and action-oriented. Style-04 (centered with image below) for SaaS/tech. Style-05 (split 50/50) is versatile. Style-03 (split with description) adds narrative depth.",
    },
    rhythm: {
      pattern: "heavy-medium-light-medium-heavy",
      guidance:
        "Open with impact, present services in visually distinct blocks, break up dense content with lighter sections, close with a conversion CTA.",
    },
    avoidComponents: [],
    closingPattern:
      "End with a CTA banner pushing consultation or inquiry. Consider testimonials just before the CTA for social proof.",
  },

  // ── Contact ───────────────────────────────────────────────────────────
  {
    pageType: "contact",
    slugPatterns: ["contact", "contact-us", "get-in-touch", "reach-us"],
    titlePatterns: ["contact", "get in touch", "reach us"],
    description:
      "Utility page — minimal content, focused on contact info and form",
    sectionCountRange: [2, 3],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-hero-banner-style-09",
          "space_ds:space-hero-banner-style-06",
        ],
        wordCountRange: [20, 40],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredComponents: [
          "space_ds:space-text-media-default",
          "space_ds:space-text-media-with-link",
        ],
        wordCountRange: [50, 100],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-09",
        "space_ds:space-hero-banner-style-06",
      ],
      selectionGuidance:
        "Contact heroes should be understated. Style-09 (text-only) is cleanest. Style-06 (text-heavy split) works with a small supporting image.",
    },
    rhythm: {
      pattern: "medium-light",
      guidance:
        "Keep it brief. A simple hero followed by contact information. Do NOT pad with unnecessary sections.",
    },
    avoidComponents: [
      "space_ds:space-pricing-card",
      "space_ds:space-stats-kpi",
      "space_ds:space-testimony-card",
      "space_ds:space-accordion",
    ],
    closingPattern:
      "The contact info/form IS the closing. No separate CTA needed.",
  },

  // ── Portfolio / Gallery ───────────────────────────────────────────────
  {
    pageType: "portfolio",
    slugPatterns: ["portfolio", "gallery", "our-work", "projects", "case-studies"],
    titlePatterns: ["portfolio", "gallery", "our work", "projects", "case studies"],
    description:
      "Visual showcase page — let the work speak through imagery and brief captions",
    sectionCountRange: [3, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-07",
          "space_ds:space-hero-banner-style-04",
        ],
        wordCountRange: [20, 40],
      },
      {
        type: "gallery",
        required: true,
        position: "middle",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-text-media-with-images",
          "space_ds:space-text-media-default",
        ],
        wordCountRange: [50, 100],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredComponents: ["space_ds:space-text-media-default"],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-2",
          "space_ds:space-cta-banner-type-3",
        ],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-07",
        "space_ds:space-hero-banner-style-04",
      ],
      selectionGuidance:
        "Portfolio heroes should be image-forward. Style-07 (centered with large image below) showcases work beautifully. Style-04 (centered text + image) also works well.",
    },
    rhythm: {
      pattern: "heavy-heavy-light-heavy",
      guidance:
        "Visual-first page. Open with a strong hero, showcase work in image-rich sections, optionally add a brief narrative, close with CTA.",
    },
    avoidComponents: ["space_ds:space-accordion", "space_ds:space-stats-kpi"],
    closingPattern:
      "End with a CTA to start a project or view more work.",
  },

  // ── Pricing ───────────────────────────────────────────────────────────
  {
    pageType: "pricing",
    slugPatterns: ["pricing", "plans", "packages"],
    titlePatterns: ["pricing", "plans", "packages"],
    description:
      "Conversion page — clear pricing tiers, comparison, FAQ to remove objections",
    sectionCountRange: [3, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-hero-banner-style-09",
          "space_ds:space-hero-banner-style-05",
        ],
        wordCountRange: [20, 40],
      },
      {
        type: "pricing",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-pricing-card",
          "space_ds:space-pricing-featured-card",
        ],
        wordCountRange: [100, 200],
      },
      {
        type: "faq",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredComponents: ["space_ds:space-accordion"],
        wordCountRange: [150, 300],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-09",
        "space_ds:space-hero-banner-style-05",
      ],
      selectionGuidance:
        "Pricing heroes should be clean and not distract from the pricing table. Style-09 (text-only) is ideal. Style-05 works if you want a small visual element.",
    },
    rhythm: {
      pattern: "medium-medium-light-heavy",
      guidance:
        "Clean hero, pricing tiers front and center, optional FAQ to remove objections, strong CTA to close.",
    },
    avoidComponents: ["space_ds:space-team-section-image-card-1"],
    closingPattern:
      "End with a CTA pushing the primary conversion action (sign up, start trial, contact sales).",
  },

  // ── FAQ ───────────────────────────────────────────────────────────────
  {
    pageType: "faq",
    slugPatterns: ["faq", "frequently-asked-questions", "help"],
    titlePatterns: ["faq", "frequently asked", "common questions"],
    description:
      "Utility page — comprehensive Q&A in collapsible format, minimal surrounding content",
    sectionCountRange: [2, 4],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "light",
        preferredComponents: ["space_ds:space-hero-banner-style-09"],
        wordCountRange: [15, 30],
      },
      {
        type: "faq",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredComponents: ["space_ds:space-accordion"],
        wordCountRange: [300, 600],
      },
      {
        type: "cta",
        required: false,
        position: "closing",
        visualWeight: "medium",
        preferredComponents: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: ["space_ds:space-hero-banner-style-09"],
      selectionGuidance:
        "FAQ heroes should be text-only and minimal. Style-09 (text-only split) is the clear choice.",
    },
    rhythm: {
      pattern: "light-light-medium",
      guidance:
        "Minimal hero, let the accordion do the work. Optionally add a CTA at the end.",
    },
    avoidComponents: [
      "space_ds:space-text-media-with-images",
      "space_ds:space-stats-kpi",
    ],
    closingPattern:
      "Optionally end with a CTA pointing to contact for unanswered questions.",
  },

  // ── Team ──────────────────────────────────────────────────────────────
  {
    pageType: "team",
    slugPatterns: ["team", "our-team", "staff", "people", "leadership"],
    titlePatterns: ["team", "our team", "people", "staff", "leadership"],
    description:
      "People-focused page — introduce team members with photos, roles, and brief bios",
    sectionCountRange: [3, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-03",
          "space_ds:space-hero-banner-style-09",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "text",
        required: false,
        position: "middle",
        visualWeight: "light",
        preferredComponents: ["space_ds:space-text-media-default"],
        wordCountRange: [100, 200],
      },
      {
        type: "team",
        required: true,
        position: "middle",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-team-section-image-card-1",
          "space_ds:space-team-section-image-card-2",
          "space_ds:space-team-section-simple-1",
        ],
        wordCountRange: [50, 100],
      },
      {
        type: "cta",
        required: false,
        position: "closing",
        visualWeight: "medium",
        preferredComponents: ["space_ds:space-cta-banner-type-1"],
        wordCountRange: [20, 40],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-03",
        "space_ds:space-hero-banner-style-09",
      ],
      selectionGuidance:
        "Team page heroes should set a welcoming tone. Style-03 (split with description) works for a narrative intro. Style-09 (text-only) keeps focus on the team grid below.",
    },
    rhythm: {
      pattern: "heavy-light-heavy-medium",
      guidance:
        "Hero → optional narrative intro → team grid as the centerpiece → optional CTA.",
    },
    avoidComponents: [
      "space_ds:space-pricing-card",
      "space_ds:space-pricing-featured-card",
    ],
    closingPattern:
      "The team grid is the main content. Optionally close with a hiring CTA or contact CTA.",
  },

  // ── Landing ───────────────────────────────────────────────────────────
  {
    pageType: "landing",
    slugPatterns: ["landing", "promo", "campaign", "offer", "special"],
    titlePatterns: ["landing", "special offer", "limited time", "exclusive"],
    description:
      "Conversion-focused page — single goal, persuasive flow, urgency, minimal distractions",
    sectionCountRange: [4, 6],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-01",
          "space_ds:space-hero-banner-style-05",
          "space_ds:space-hero-banner-style-02",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "features",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-text-media-with-checklist",
          "space_ds:space-text-media-with-stats",
        ],
        wordCountRange: [100, 200],
      },
      {
        type: "testimonials",
        required: true,
        position: "middle",
        visualWeight: "medium",
        preferredComponents: [
          "space_ds:space-testimony-card",
          "space_ds:space-people-card-testimony-with-avatar",
        ],
        wordCountRange: [80, 150],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-2",
          "space_ds:space-cta-banner-type-1",
        ],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-01",
        "space_ds:space-hero-banner-style-05",
        "space_ds:space-hero-banner-style-02",
      ],
      selectionGuidance:
        "Landing heroes need to capture attention immediately. Style-01 (full-bg image) for dramatic impact. Style-05 (split) for balanced copy+visual. Style-02 (with stats) if you have compelling numbers.",
    },
    rhythm: {
      pattern: "heavy-medium-medium-heavy",
      guidance:
        "Hook immediately (hero), build value (features), prove it (testimonials), close the deal (CTA). Every section should drive toward the single conversion goal.",
    },
    avoidComponents: ["space_ds:space-accordion"],
    closingPattern:
      "End with a strong, urgent CTA. The entire page should funnel toward this single action.",
  },

  // ── Generic (fallback) ────────────────────────────────────────────────
  {
    pageType: "generic",
    slugPatterns: [],
    titlePatterns: [],
    description:
      "General-purpose page — balanced mix of content sections with reasonable defaults",
    sectionCountRange: [3, 5],
    sections: [
      {
        type: "hero",
        required: true,
        position: "opening",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-hero-banner-style-03",
          "space_ds:space-hero-banner-style-01",
        ],
        wordCountRange: [30, 60],
      },
      {
        type: "text",
        required: true,
        position: "middle",
        visualWeight: "light",
        preferredComponents: [
          "space_ds:space-text-media-default",
          "space_ds:space-text-media-with-checklist",
        ],
        wordCountRange: [150, 300],
      },
      {
        type: "cta",
        required: true,
        position: "closing",
        visualWeight: "heavy",
        preferredComponents: [
          "space_ds:space-cta-banner-type-1",
          "space_ds:space-cta-banner-type-2",
        ],
        wordCountRange: [20, 50],
      },
    ],
    heroRule: {
      preferredStyles: [
        "space_ds:space-hero-banner-style-03",
        "space_ds:space-hero-banner-style-01",
      ],
      selectionGuidance:
        "Default to style-03 (split with description) for a versatile, professional look. Style-01 (full-bg) if a strong image is available.",
    },
    rhythm: {
      pattern: "heavy-light-heavy",
      guidance:
        "Start with a hero, deliver the main content, close with a CTA. Keep it balanced.",
    },
    avoidComponents: [],
    closingPattern: "End with a CTA banner.",
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
  ];

  for (const page of pages) {
    const pageType = classifyPageType(page.slug, page.title);
    const rule = getRule(pageType);
    const required = rule.sections
      .filter((s) => s.required)
      .map((s) => {
        const pos = s.position !== "any" ? ` (${s.position})` : "";
        const wordRange = `~${s.wordCountRange[0]}-${s.wordCountRange[1]} words`;
        return `${s.type}${pos} [${wordRange}]`;
      });
    const optional = rule.sections
      .filter((s) => !s.required)
      .map((s) => s.type);
    lines.push(
      `- **${page.title}** (/${page.slug}) [${pageType}]:`,
      `  - MINIMUM ${rule.sectionCountRange[0]} sections, up to ${rule.sectionCountRange[1]}`,
      `  - REQUIRED sections: ${required.join(", ")}`,
      optional.length > 0 ? `  - Optional sections (pick 1-2): ${optional.join(", ")}` : ``,
      `  - Rhythm: ${rule.rhythm.guidance}`,
    );
  }

  lines.push(
    ``,
    `REMINDER: Do NOT produce pages with only 2-3 sections. Content-rich pages (home, services, about, landing) MUST have at least 4-5 sections to provide sufficient depth for a professional website.`
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

  // Required/optional sections
  lines.push(`Required sections:`);
  for (const s of rule.sections.filter((s) => s.required)) {
    const pos = s.position !== "any" ? ` — position: ${s.position}` : "";
    lines.push(
      `- ${s.type}${pos} (~${s.wordCountRange[0]}-${s.wordCountRange[1]} words) → prefer: ${s.preferredComponents[0]}`
    );
  }

  const optional = rule.sections.filter((s) => !s.required);
  if (optional.length > 0) {
    lines.push(``, `Optional sections (use 1-2 as needed):`);
    for (const s of optional) {
      lines.push(
        `- ${s.type} (~${s.wordCountRange[0]}-${s.wordCountRange[1]} words) → prefer: ${s.preferredComponents[0]}`
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

  // Component mapping (page-type-aware)
  lines.push(
    `Component ID mapping (ranked by suitability for this ${pageType} page):`
  );

  // Build a section-type → components map from this rule
  const typeMap = new Map<string, string[]>();
  for (const s of rule.sections) {
    typeMap.set(s.type, s.preferredComponents);
  }

  // Always include the generic fallback mappings for types not in this rule
  const fallbackMap: Record<string, string[]> = {
    hero: rule.heroRule.preferredStyles,
    "text/about": ["space_ds:space-text-media-default"],
    features: [
      "space_ds:space-text-media-with-checklist",
      "space_ds:space-text-media-with-stats",
    ],
    cta: [
      "space_ds:space-cta-banner-type-1",
      "space_ds:space-cta-banner-type-2",
      "space_ds:space-cta-banner-type-3",
    ],
    testimonials: [
      "space_ds:space-testimony-card",
      "space_ds:space-people-card-testimony-with-avatar",
    ],
    team: [
      "space_ds:space-team-section-image-card-1",
      "space_ds:space-team-section-simple-1",
    ],
    faq: ["space_ds:space-accordion"],
    "stats/kpi": ["space_ds:space-stats-kpi"],
    "gallery/images": ["space_ds:space-text-media-with-images"],
    "links/resources": ["space_ds:space-text-media-with-link"],
    pricing: [
      "space_ds:space-pricing-card",
      "space_ds:space-pricing-featured-card",
    ],
  };

  // Merge rule-specific preferences with fallbacks
  for (const [sectionType, components] of Object.entries(fallbackMap)) {
    const ruleComponents = typeMap.get(sectionType) ?? components;
    const compList = ruleComponents.map((c) => `"${c}"`).join(" or ");
    lines.push(`- ${sectionType} → ${compList}`);
  }

  // Avoid list
  if (rule.avoidComponents.length > 0) {
    lines.push(
      ``,
      `AVOID on ${pageType} pages: ${rule.avoidComponents.map((c) => `"${c}"`).join(", ")}`
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
