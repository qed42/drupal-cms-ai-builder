/**
 * Page Design Rules — declarative composition constraints per page type.
 *
 * Delegates to the active design system adapter for composition patterns and
 * page design rules. Type definitions and utility functions remain here for
 * backward compatibility.
 */

import { getDefaultAdapter } from "@/lib/design-systems/setup";
import type {
  CompositionPattern,
  SectionRule,
  PageDesignRule,
} from "@ai-builder/ds-types";

// ---------------------------------------------------------------------------
// Types (re-exported for backward compatibility)
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

export type { CompositionPattern, SectionRule, PageDesignRule };

// ---------------------------------------------------------------------------
// Composition Patterns & Rules — lazy accessors that resolve at call time,
// so they reflect whichever adapter is active (not just the one loaded at
// module init).
// ---------------------------------------------------------------------------

/** Get composition patterns from the currently active adapter. */
export function getCompositionPatterns(): Record<string, CompositionPattern> {
  return getDefaultAdapter().getCompositionPatterns();
}

/** Get page design rules from the currently active adapter. */
export function getPageDesignRules(): PageDesignRule[] {
  return getDefaultAdapter().getPageDesignRules();
}

// Legacy constants — kept as getters for backward compatibility.
// Consumers that destructure at import time will still see the active adapter's
// data because these evaluate lazily through the getter.
export const COMPOSITION_PATTERNS: Record<string, CompositionPattern> = new Proxy(
  {} as Record<string, CompositionPattern>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getCompositionPatterns(), prop, receiver);
    },
    ownKeys() {
      return Reflect.ownKeys(getCompositionPatterns());
    },
    getOwnPropertyDescriptor(_target, prop) {
      const patterns = getCompositionPatterns();
      if (prop in patterns) {
        return { configurable: true, enumerable: true, value: (patterns as Record<string | symbol, unknown>)[prop] };
      }
      return undefined;
    },
    has(_target, prop) {
      return prop in getCompositionPatterns();
    },
  }
);

export const PAGE_DESIGN_RULES: PageDesignRule[] = new Proxy(
  [] as PageDesignRule[],
  {
    get(_target, prop, receiver) {
      return Reflect.get(getPageDesignRules(), prop, receiver);
    },
  }
);

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
      return rule.pageType as PageType;
    }
    if (rule.titlePatterns.some((p) => t.includes(p))) {
      return rule.pageType as PageType;
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
 * If the name contains ":" it's a raw component ID — return as-is.
 * Otherwise, look up the composition pattern description.
 */
function resolvePatternLabel(patternName: string): string {
  if (patternName.includes(":")) {
    return patternName;
  }
  const pattern = COMPOSITION_PATTERNS[patternName];
  return pattern ? `${patternName} (${pattern.description})` : patternName;
}

// ---------------------------------------------------------------------------
// Section Skeleton Builder
// ---------------------------------------------------------------------------

/**
 * Build a pre-determined section skeleton for a page type.
 * Returns the exact section slots (required first, then optional to fill to minimum).
 * The AI fills in headings/content for these slots rather than deciding the count.
 */
export function buildSectionSkeleton(
  pageType: PageType
): Array<{ type: string; required: boolean; position: string }> {
  const rule = getRule(pageType);
  const sections: Array<{ type: string; required: boolean; position: string }> = [];

  // Add all required sections in their declared order
  for (const s of rule.sections.filter((s) => s.required)) {
    sections.push({ type: s.type, required: true, position: s.position });
  }

  // Fill remaining slots with optional sections up to minimum count
  const remaining = rule.sectionCountRange[0] - sections.length;
  const optional = rule.sections.filter((s) => !s.required);
  for (let i = 0; i < remaining && i < optional.length; i++) {
    sections.push({ type: optional[i].type, required: false, position: optional[i].position });
  }

  return sections;
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
  const adapter = getDefaultAdapter();
  const lines: string[] = [
    `## MANDATORY Page Composition Requirements`,
    ``,
    `CRITICAL: Each page MUST meet the minimum section count specified below. This is a hard constraint, NOT a suggestion. Pages with fewer sections than the minimum will be REJECTED and regenerated.`,
    ``,
    `### ${adapter.name} Compositional Model`,
    adapter.buildPromptDesignGuidance(),
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
 * Format relaxed plan rules for code component mode.
 * No composition pattern references, fewer required sections,
 * encourages creative/novel section types.
 */
export function formatCodeComponentPlanRules(
  pages: Array<{ slug: string; title: string }>
): string[] {
  const lines: string[] = [
    `## Page Composition Guidelines (Code Component Mode)`,
    ``,
    `You are planning for a BESPOKE React/Tailwind implementation where every section is a custom-built component.`,
    `You have full creative freedom over section types, layouts, and visual treatments.`,
    `Think beyond standard web patterns — consider unconventional sections like:`,
    `- Bento grids, masonry layouts, asymmetric hero splits`,
    `- Scroll-driven narratives, animated timelines, process flows`,
    `- Interactive comparison tables, pricing calculators`,
    `- Parallax showcases, staggered card reveals, statistics counters`,
    `- Full-bleed image galleries, video backgrounds, split-screen layouts`,
    ``,
    `You MAY invent section types that best serve the business narrative.`,
    `The "type" field can be any descriptive string — you are NOT limited to the standard set.`,
    ``,
  ];

  for (const page of pages) {
    const pageType = classifyPageType(page.slug, page.title);
    const rule = getRule(pageType);
    // Reduce minimums by 2 for code components (more freedom, fewer forced sections)
    const relaxedMin = Math.max(3, rule.sectionCountRange[0] - 2);
    const relaxedMax = rule.sectionCountRange[1];
    lines.push(
      `- **${page.title}** (/${page.slug}) [${pageType}]:`,
      `  - ${relaxedMin}–${relaxedMax} sections`,
      `  - REQUIRED: hero section at the opening position`,
      `  - STRONGLY RECOMMENDED: a conversion-oriented closing section (CTA, contact form, or newsletter signup)`,
      `  - Remaining sections: choose what best serves the page's purpose and business narrative`,
      `  - Section ORDER is flexible for non-hero sections — arrange for maximum storytelling impact`,
      `  - Rhythm guidance: ${rule.rhythm.guidance}`,
      ``,
    );
  }

  lines.push(
    `REMINDER: Every page MUST have at least a hero section. Content-rich pages (home, services, about, landing) should have at least ${Math.max(3, 5)} sections for sufficient depth, but prioritize quality and narrative flow over hitting a number.`
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
    ``,
    `**Hero Heading Content Rule**: The hero heading MUST be a marketing-quality headline derived from the business's value proposition — NEVER "Welcome", "Welcome to [Name]", or any generic greeting. This is the h1 and primary SEO anchor for the page.`,
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
      if (!p.includes(":")) {
        referencedPatterns.add(p);
      }
    }
  }

  for (const patternName of referencedPatterns) {
    const pattern = COMPOSITION_PATTERNS[patternName];
    if (!pattern) continue;
    lines.push(
      `- **${pattern.name}**: ${pattern.description}`,
      `  Child roles: ${pattern.childRoles.map((c) => `"${c}"`).join(", ")}`,
      ``
    );
  }

  const adapter = getDefaultAdapter();

  // Component mapping for this page type — clearly distinguish
  // Type A (organism component_id) from Type B (composition pattern name)
  lines.push(
    `## Section Type Mapping (${pageType} page)`,
    `Type A sections use "component_id". Type B sections use "pattern" (with component_id="").`,
    ``
  );

  // Type A organism sections — these go in component_id
  lines.push(`**Type A (organism component_id):**`);
  lines.push(`- hero -> ${rule.heroRule.preferredStyles.map((s) => `"${s}"`).join(" or ")}`);
  const ctaComponent = adapter.primaryComponent("cta-banner");
  lines.push(`- cta -> "${ctaComponent}"`);
  lines.push(``);

  // Type B composed sections — these go in the pattern field, NOT component_id
  lines.push(`**Type B (composition pattern — use in "pattern" field, set component_id=""):**`);
  const patternMap: Record<string, string[]> = {
    "text/about": ["text-image-split-50-50", "text-image-split-66-33", "full-width-text"],
    features: ["features-grid-3col", "features-grid-4col"],
    testimonials: ["testimonials-carousel"],
    team: ["team-grid-4col", "team-grid-3col"],
    faq: ["faq-accordion"],
    "stats/kpi": ["stats-row"],
    "gallery/cards": ["card-grid-3col", "card-carousel"],
    contact: ["contact-info"],
    logos: ["logo-showcase"],
  };
  for (const [sectionType, patterns] of Object.entries(patternMap)) {
    lines.push(`- ${sectionType} -> pattern: ${patterns.map((p) => `"${p}"`).join(" or ")}`);
  }

  lines.push(``);
  lines.push(`**Utility (used inside containers, not as standalone sections):**`);
  const sectionHeading = adapter.primaryComponent("section-heading");
  lines.push(`- section-heading -> "${sectionHeading}"`);

  // Avoid list
  if (rule.avoidComponents.length > 0) {
    lines.push(
      ``,
      `AVOID on ${pageType} pages: ${rule.avoidComponents.map((c) => `"${c}"`).join(", ")}`
    );
  }

  // Section heading + container guidance — delegate to adapter
  lines.push(
    ``,
    `## Section Composition Rules (CRITICAL)`,
    adapter.buildPromptDesignGuidance(),
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
