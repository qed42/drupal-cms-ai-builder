/**
 * Quality Review Agent — deterministic content evaluation for generated pages.
 *
 * Evaluates each page against content depth, SEO, and GEO checks.
 * Returns structured results with actionable feedback for retry prompts.
 * Pure function — no AI calls, no database access, no side effects.
 *
 * TASK-290: Content depth checks
 * TASK-291: SEO quality checks
 * TASK-292: GEO quality checks
 */

import { classifyPageType, getRule } from "../../ai/page-design-rules";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal section shape needed by the review agent. */
export interface ReviewPageSection {
  component_id: string;
  props: Record<string, unknown>;
  pattern?: string;
  children?: Array<{
    component_id: string;
    slot: string;
    props: Record<string, unknown>;
  }>;
}

/** Minimal page shape needed by the review agent. */
export interface ReviewPageLayout {
  slug: string;
  title: string;
  seo?: { meta_title: string; meta_description: string };
  sections: ReviewPageSection[];
}

export interface ReviewInput {
  page: ReviewPageLayout;
  planPage: {
    slug: string;
    title: string;
    targetKeywords: string[];
    sections: Array<{ type: string; heading: string; estimatedWordCount: number }>;
  };
  research: {
    industry: string;
    keyMessages: string[];
    targetAudience: { primary: string };
  };
  /** Other pages in the site — needed for site-level checks like FAQ presence */
  sitePages?: Array<{ slug: string; sections: ReviewPageSection[] }>;
}

export interface ReviewCheck {
  name: string;
  dimension: "depth" | "seo" | "geo" | "design";
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  fix?: string;
}

export interface ReviewResult {
  passed: boolean;
  score: number;
  checks: ReviewCheck[];
  feedback: string;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /your (business|company|brand) (here|name)/i,
  /\[.*?\]/,
  /example\.com/i,
  /placeholder/i,
  /TODO/,
];

/** Estimate word count from all string values in a props object. */
export function estimateWordCount(props: Record<string, unknown>): number {
  let words = 0;
  for (const value of Object.values(props)) {
    if (typeof value === "string") {
      words += value.split(/\s+/).filter(Boolean).length;
    }
  }
  return words;
}

/** Estimate total word count for a section including children. */
function estimateSectionWordCount(section: ReviewPageSection): number {
  let words = estimateWordCount(section.props);
  if (section.children) {
    for (const child of section.children) {
      words += estimateWordCount(child.props);
    }
  }
  return words;
}

/** Concatenate all string prop values for text analysis, including children. */
function getAllText(sections: ReviewPageSection[]): string {
  return sections
    .map((s) => {
      const sectionText = Object.values(s.props)
        .filter((v): v is string => typeof v === "string")
        .join(" ");
      const childrenText = (s.children ?? [])
        .map((c) =>
          Object.values(c.props)
            .filter((v): v is string => typeof v === "string")
            .join(" ")
        )
        .join(" ");
      return `${sectionText} ${childrenText}`;
    })
    .join(" ");
}

/** Get minimum total word count threshold by page type. */
function getMinWordCount(pageType: string): number {
  const thresholds: Record<string, number> = {
    home: 400,
    services: 350,
    about: 350,
    landing: 350,
    portfolio: 200,
    pricing: 200,
    team: 200,
    faq: 200,
    contact: 100,
    generic: 200,
  };
  return thresholds[pageType] ?? 200;
}

// ---------------------------------------------------------------------------
// Content Depth Checks (TASK-290)
// ---------------------------------------------------------------------------

function checkSectionCount(input: ReviewInput): ReviewCheck {
  const pageType = classifyPageType(input.page.slug, input.page.title);
  const rule = getRule(pageType);
  const min = rule.sectionCountRange[0];
  const actual = input.page.sections.length;

  return {
    name: "section-count",
    dimension: "depth",
    passed: actual >= min,
    severity: "error",
    message: actual >= min
      ? `Section count ${actual} meets minimum ${min} for ${pageType} page`
      : `Section count ${actual} is below minimum ${min} for ${pageType} page`,
    fix: actual < min
      ? `Add ${min - actual} more sections. Consider adding: ${rule.sections.filter((s) => !s.required).map((s) => s.type).join(", ")}`
      : undefined,
  };
}

function checkTotalWordCount(input: ReviewInput): ReviewCheck {
  const pageType = classifyPageType(input.page.slug, input.page.title);
  const minWords = getMinWordCount(pageType);
  const totalWords = input.page.sections.reduce(
    (sum, s) => sum + estimateSectionWordCount(s),
    0
  );

  return {
    name: "total-word-count",
    dimension: "depth",
    passed: totalWords >= minWords,
    severity: "error",
    message: totalWords >= minWords
      ? `Total word count ${totalWords} meets minimum ${minWords}`
      : `Total word count ${totalWords} is below minimum ${minWords} for ${pageType} page`,
    fix: totalWords < minWords
      ? `Increase content depth. Current: ~${totalWords} words, need at least ${minWords}. Expand section descriptions and add more detail.`
      : undefined,
  };
}

function checkNoPlaceholders(input: ReviewInput): ReviewCheck {
  const allText = getAllText(input.page.sections);
  const matches: string[] = [];

  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = allText.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }

  return {
    name: "no-placeholders",
    dimension: "depth",
    passed: matches.length === 0,
    severity: "error",
    message: matches.length === 0
      ? "No placeholder text detected"
      : `Placeholder text detected: "${matches.join('", "')}"`,
    fix: matches.length > 0
      ? `Replace all placeholder text with real, specific content for this business. Found: ${matches.join(", ")}`
      : undefined,
  };
}

function checkVisualRhythm(input: ReviewInput): ReviewCheck {
  const sections = input.page.sections;
  const duplicates: string[] = [];

  // Use pattern for composed sections (Type B), component_id for organisms (Type A)
  const sectionIdentity = (s: ReviewPageSection) => s.pattern || s.component_id;

  for (let i = 1; i < sections.length; i++) {
    const curr = sectionIdentity(sections[i]);
    const prev = sectionIdentity(sections[i - 1]);
    if (curr && prev && curr === prev) {
      duplicates.push(curr);
    }
  }

  return {
    name: "visual-rhythm",
    dimension: "depth",
    passed: duplicates.length === 0,
    severity: "warning",
    message: duplicates.length === 0
      ? "Good visual rhythm — no consecutive identical components"
      : `Consecutive identical components: ${duplicates.join(", ")}`,
    fix: duplicates.length > 0
      ? `Alternate component variants to create visual rhythm. Do not use the same component type for consecutive sections.`
      : undefined,
  };
}

function checkRequiredSections(input: ReviewInput): ReviewCheck {
  const pageType = classifyPageType(input.page.slug, input.page.title);
  const rule = getRule(pageType);
  const requiredTypes = rule.sections.filter((s) => s.required).map((s) => s.type);

  // Map component_id + pattern + children to section types heuristically
  const presentTypes = new Set<string>();
  for (const section of input.page.sections) {
    const cid = section.component_id.toLowerCase();
    const pattern = (section.pattern ?? "").toLowerCase();

    // Type A: organism component_id detection
    if (cid.includes("hero")) presentTypes.add("hero");
    if (cid.includes("cta")) presentTypes.add("cta");
    if (cid.includes("text-media")) presentTypes.add("text");
    if (cid.includes("testimony") || cid.includes("people-card-testimony")) presentTypes.add("testimonials");
    if (cid.includes("team-section")) presentTypes.add("team");
    if (cid.includes("accordion")) presentTypes.add("faq");
    if (cid.includes("stats") || cid.includes("kpi")) presentTypes.add("stats");
    if (cid.includes("pricing")) presentTypes.add("pricing");
    if (cid.includes("icon-card")) presentTypes.add("features");
    if (cid.includes("checklist") || cid.includes("with-stats")) presentTypes.add("features");
    if (cid.includes("with-images")) presentTypes.add("gallery");

    // Type B: pattern-based detection for composed sections
    if (pattern.includes("text-image") || pattern.includes("image-text") || pattern === "full-width-text") presentTypes.add("text");
    if (pattern.includes("features") || pattern.includes("card-grid")) presentTypes.add("features");
    if (pattern.includes("stats")) presentTypes.add("stats");
    if (pattern.includes("team")) presentTypes.add("team");
    if (pattern.includes("contact")) presentTypes.add("contact-info");
    if (pattern.includes("testimonial") || pattern.includes("carousel")) presentTypes.add("testimonials");
    if (pattern.includes("faq") || pattern.includes("accordion")) presentTypes.add("faq");

    // Type B: detect from children component IDs
    for (const child of section.children ?? []) {
      const childId = child.component_id.toLowerCase();
      if (childId.includes("testimony")) presentTypes.add("testimonials");
      if (childId.includes("stats") || childId.includes("kpi")) presentTypes.add("stats");
      if (childId.includes("user-card")) presentTypes.add("team");
      if (childId.includes("contact-card")) presentTypes.add("contact-info");
      if (childId.includes("icon-card")) presentTypes.add("features");
      if (childId.includes("accordion")) presentTypes.add("faq");
    }
  }

  const missing = requiredTypes.filter((t) => !presentTypes.has(t));

  return {
    name: "required-sections",
    dimension: "depth",
    passed: missing.length === 0,
    severity: "error",
    message: missing.length === 0
      ? `All required section types present for ${pageType} page`
      : `Missing required section types for ${pageType} page: ${missing.join(", ")}`,
    fix: missing.length > 0
      ? `Add the following required sections: ${missing.join(", ")}. Refer to the page composition rules for component suggestions.`
      : undefined,
  };
}

function checkSectionWordCount(input: ReviewInput): ReviewCheck {
  const pageType = classifyPageType(input.page.slug, input.page.title);
  const rule = getRule(pageType);
  const thinSections: string[] = [];

  for (let i = 0; i < input.page.sections.length; i++) {
    const section = input.page.sections[i];
    const words = estimateSectionWordCount(section);
    // Find matching rule section by component type heuristic
    const cid = section.component_id.toLowerCase();
    const matchingRule = rule.sections.find((r) => {
      if (r.type === "hero" && cid.includes("hero")) return true;
      if (r.type === "cta" && cid.includes("cta")) return true;
      if (r.type === "text" && cid.includes("text-media")) return true;
      if (r.type === "features" && (cid.includes("checklist") || cid.includes("with-stats") || cid.includes("icon-card"))) return true;
      if (r.type === "testimonials" && (cid.includes("testimony") || cid.includes("people-card"))) return true;
      return false;
    });

    if (matchingRule && words < matchingRule.wordCountRange[0]) {
      thinSections.push(
        `Section ${i + 1} (${section.component_id}): ${words} words, minimum ${matchingRule.wordCountRange[0]}`
      );
    }
  }

  return {
    name: "section-word-count",
    dimension: "depth",
    passed: thinSections.length === 0,
    severity: "warning",
    message: thinSections.length === 0
      ? "All sections meet word count minimums"
      : `Thin sections: ${thinSections.join("; ")}`,
    fix: thinSections.length > 0
      ? `Expand content in thin sections: ${thinSections.join("; ")}`
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// SEO Checks (TASK-291)
// ---------------------------------------------------------------------------

function checkMetaTitleLength(input: ReviewInput): ReviewCheck {
  const len = input.page.seo?.meta_title?.length ?? 0;
  return {
    name: "meta-title-length",
    dimension: "seo",
    passed: len >= 50 && len <= 60,
    severity: "warning",
    message: len >= 50 && len <= 60
      ? `Meta title length ${len} chars (target: 50-60)`
      : `Meta title length ${len} chars (target: 50-60)`,
    fix: len < 50 || len > 60
      ? `Adjust meta title to 50-60 characters. Current: ${len} chars.`
      : undefined,
  };
}

function checkMetaTitleKeyword(input: ReviewInput): ReviewCheck {
  const title = (input.page.seo?.meta_title ?? "").toLowerCase();
  const hasKeyword = input.planPage.targetKeywords.some((kw) =>
    title.includes(kw.toLowerCase())
  );

  return {
    name: "meta-title-keyword",
    dimension: "seo",
    passed: hasKeyword,
    severity: "warning",
    message: hasKeyword
      ? "Meta title contains target keyword"
      : `Meta title missing target keywords: ${input.planPage.targetKeywords.join(", ")}`,
    fix: !hasKeyword
      ? `Include at least one target keyword in the meta title: ${input.planPage.targetKeywords.join(", ")}`
      : undefined,
  };
}

function checkMetaDescLength(input: ReviewInput): ReviewCheck {
  const len = input.page.seo?.meta_description?.length ?? 0;
  return {
    name: "meta-desc-length",
    dimension: "seo",
    passed: len >= 150 && len <= 160,
    severity: "warning",
    message: `Meta description length ${len} chars (target: 150-160)`,
    fix: len < 150 || len > 160
      ? `Adjust meta description to 150-160 characters. Current: ${len} chars.`
      : undefined,
  };
}

function checkMetaDescKeyword(input: ReviewInput): ReviewCheck {
  const desc = (input.page.seo?.meta_description ?? "").toLowerCase();
  const hasKeyword = input.planPage.targetKeywords.some((kw) =>
    desc.includes(kw.toLowerCase())
  );

  return {
    name: "meta-desc-keyword",
    dimension: "seo",
    passed: hasKeyword,
    severity: "warning",
    message: hasKeyword
      ? "Meta description contains target keyword"
      : `Meta description missing target keywords`,
    fix: !hasKeyword
      ? `Include at least one target keyword in the meta description: ${input.planPage.targetKeywords.join(", ")}`
      : undefined,
  };
}

/**
 * Extract the hero heading text from a hero section, checking all design-system
 * prop variants (title, heading, heading_text) on both the section and its children.
 */
function extractHeroHeadingText(hero: ReviewPageSection): string {
  // Check section-level props
  for (const propName of ["title", "heading", "heading_text"]) {
    const val = hero.props[propName];
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
  }

  // Check children (e.g., Mercury's heading child in hero_slot)
  for (const child of hero.children ?? []) {
    for (const propName of ["heading_text", "title", "heading"]) {
      const val = child.props[propName];
      if (typeof val === "string" && val.trim().length > 0) return val.trim();
    }
  }

  return "";
}

function checkHeroHeading(input: ReviewInput): ReviewCheck {
  // First section is typically the hero — check both organism and composed
  const hero = input.page.sections.find((s) =>
    s.component_id.toLowerCase().includes("hero")
  ) ?? input.page.sections[0];
  const headingText = hero ? extractHeroHeadingText(hero) : "";
  const hasHeading = headingText.length > 0;

  return {
    name: "hero-heading",
    dimension: "seo",
    passed: hasHeading,
    severity: "error",
    message: hasHeading
      ? "Hero section has a clear heading"
      : "Hero section missing heading (title/heading/heading_text prop empty or missing)",
    fix: !hasHeading
      ? "Add a clear, descriptive heading to the hero banner component using heading_text, title, or heading prop."
      : undefined,
  };
}

/** Forbidden hero heading patterns — generic/boilerplate text that should never be an h1. */
const GENERIC_HERO_PATTERNS = [
  /^welcome$/i,
  /^welcome to\b/i,
  /^home$/i,
  /^home ?page$/i,
  /^about us$/i,
  /^about our\b/i,
  /^our services$/i,
  /^our company$/i,
  /^contact us$/i,
  /^contact$/i,
  /^discover our\b/i,
  /^get in touch$/i,
];

function checkHeroHeadingQuality(input: ReviewInput): ReviewCheck {
  const hero = input.page.sections.find((s) =>
    s.component_id.toLowerCase().includes("hero")
  ) ?? input.page.sections[0];
  const headingText = hero ? extractHeroHeadingText(hero) : "";

  // If no heading at all, checkHeroHeading already catches that — pass here to avoid double-flagging
  if (!headingText) {
    return {
      name: "hero-heading-quality",
      dimension: "seo",
      passed: true,
      severity: "error",
      message: "Hero heading quality check skipped (no heading text found — flagged by hero-heading check)",
    };
  }

  const isGeneric = GENERIC_HERO_PATTERNS.some((p) => p.test(headingText));

  return {
    name: "hero-heading-quality",
    dimension: "seo",
    passed: !isGeneric,
    severity: "error",
    message: isGeneric
      ? `Hero heading "${headingText}" is generic/boilerplate — must be a marketing-grade headline`
      : "Hero heading is a specific, marketing-grade headline",
    fix: isGeneric
      ? `Replace the hero heading "${headingText}" with a compelling, benefit-driven headline that communicates the core value proposition. Use target keywords: ${input.planPage.targetKeywords.join(", ")}. Example: "Expert [Industry] Services — [Benefit Statement]".`
      : undefined,
  };
}

function checkKeywordDistribution(input: ReviewInput): ReviewCheck {
  const keywords = input.planPage.targetKeywords.map((kw) => kw.toLowerCase());
  let sectionsWithKeywords = 0;

  for (const section of input.page.sections) {
    // Include both section-level and children props text
    const sectionText = Object.values(section.props)
      .filter((v): v is string => typeof v === "string")
      .join(" ");
    const childrenText = (section.children ?? [])
      .map((c) => Object.values(c.props).filter((v): v is string => typeof v === "string").join(" "))
      .join(" ");
    const text = `${sectionText} ${childrenText}`.toLowerCase();
    if (keywords.some((kw) => text.includes(kw))) {
      sectionsWithKeywords++;
    }
  }

  return {
    name: "keyword-distribution",
    dimension: "seo",
    passed: sectionsWithKeywords >= 2,
    severity: "warning",
    message: sectionsWithKeywords >= 2
      ? `Keywords found in ${sectionsWithKeywords} sections`
      : `Keywords found in only ${sectionsWithKeywords} section(s), need at least 2`,
    fix: sectionsWithKeywords < 2
      ? `Distribute target keywords (${input.planPage.targetKeywords.join(", ")}) across at least 2 sections naturally.`
      : undefined,
  };
}

function checkCtaInternalLinks(input: ReviewInput): ReviewCheck {
  const ctaSections = input.page.sections.filter((s) =>
    s.component_id.toLowerCase().includes("cta")
  );

  if (ctaSections.length === 0) {
    return {
      name: "cta-internal-links",
      dimension: "seo",
      passed: true,
      severity: "warning",
      message: "No CTA sections to check",
    };
  }

  const hasInternalLink = ctaSections.some((s) => {
    const text = Object.values(s.props)
      .filter((v): v is string => typeof v === "string")
      .join(" ");
    return /\/[a-z]/.test(text);
  });

  return {
    name: "cta-internal-links",
    dimension: "seo",
    passed: hasInternalLink,
    severity: "warning",
    message: hasInternalLink
      ? "CTA sections contain internal links"
      : "CTA sections missing internal link references",
    fix: !hasInternalLink
      ? "Add internal link paths (e.g., /contact, /services) to CTA button props."
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// GEO Checks (TASK-292)
// ---------------------------------------------------------------------------

function checkEntityClarity(input: ReviewInput): ReviewCheck {
  const allText = getAllText(input.page.sections).toLowerCase();
  const businessName = (input.planPage.title === "Home"
    ? input.research.keyMessages[0] ?? ""
    : ""
  ).toLowerCase();
  const industry = input.research.industry.toLowerCase();

  const hasIndustry = allText.includes(industry);

  return {
    name: "entity-clarity",
    dimension: "geo",
    passed: hasIndustry,
    severity: "warning",
    message: hasIndustry
      ? "Industry context is clear in page content"
      : `Industry "${input.research.industry}" not explicitly mentioned in page content`,
    fix: !hasIndustry
      ? `Mention the industry "${input.research.industry}" explicitly in the page content.`
      : undefined,
  };
}

function checkStructuredClaims(input: ReviewInput): ReviewCheck {
  const pageType = classifyPageType(input.page.slug, input.page.title);
  // Skip for utility pages
  if (pageType === "contact" || pageType === "faq") {
    return {
      name: "structured-claims",
      dimension: "geo",
      passed: true,
      severity: "warning",
      message: "Structured claims check skipped for utility page",
    };
  }

  const allText = getAllText(input.page.sections);
  // Look for numeric claims: numbers followed by context words
  const numericClaims = allText.match(/\d+[\+%]?\s*(?:years?|clients?|projects?|satisfied|locations?|employees?|experience|certified|award)/gi);

  return {
    name: "structured-claims",
    dimension: "geo",
    passed: (numericClaims?.length ?? 0) >= 1,
    severity: "warning",
    message: numericClaims
      ? `Found ${numericClaims.length} structured claim(s)`
      : "No structured numeric claims found (e.g., '15 years experience', '500+ clients')",
    fix: !numericClaims
      ? "Add at least one specific numeric claim (e.g., '15 years of experience', '500+ satisfied clients'). Avoid vague phrasing like 'many years'."
      : undefined,
  };
}

function checkFaqPresence(input: ReviewInput): ReviewCheck {
  const allPages = input.sitePages ?? [{ slug: input.page.slug, sections: input.page.sections }];
  const hasFaq = allPages.some((p) =>
    p.sections.some((s) =>
      s.component_id.toLowerCase().includes("accordion")
      || (s.pattern ?? "").toLowerCase().includes("faq")
      || (s.children ?? []).some((c) => c.component_id.toLowerCase().includes("accordion"))
    )
  );

  return {
    name: "faq-presence",
    dimension: "geo",
    passed: hasFaq,
    severity: "warning",
    message: hasFaq
      ? "FAQ/accordion section found in site"
      : "No FAQ/accordion section found across the site",
    fix: !hasFaq
      ? "Consider adding an FAQ section (accordion component) to at least one page to improve AI knowledge graph visibility."
      : undefined,
  };
}

function checkAuthoritativeVoice(input: ReviewInput): ReviewCheck {
  const allText = getAllText(input.page.sections).toLowerCase();
  const hasFirstPerson = /\b(we |our |we're|we've)\b/.test(allText);

  return {
    name: "authoritative-voice",
    dimension: "geo",
    passed: hasFirstPerson,
    severity: "warning",
    message: hasFirstPerson
      ? "Content uses authoritative first-person voice"
      : "Content lacks first-person voice ('we', 'our')",
    fix: !hasFirstPerson
      ? "Use first-person plural voice ('we', 'our') to establish authority and trust."
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Interlinking Checks (TASK-338)
// ---------------------------------------------------------------------------

const GENERIC_CTA_PATTERNS = [
  /^learn more$/i,
  /^click here$/i,
  /^read more$/i,
  /^find out more$/i,
  /^get started$/i,
  /^submit$/i,
];

function checkInterlinkDensity(input: ReviewInput): ReviewCheck {
  let internalLinks = 0;

  for (const section of input.page.sections) {
    // Check section-level URL props (CTA banners, organisms)
    for (const value of Object.values(section.props)) {
      if (typeof value === "string" && /^\/[a-z]/.test(value)) {
        internalLinks++;
      }
    }
    // Check children URL props (buttons, cards, links)
    for (const child of section.children ?? []) {
      for (const value of Object.values(child.props)) {
        if (typeof value === "string" && /^\/[a-z]/.test(value)) {
          internalLinks++;
        }
      }
    }
    // Check inline <a> tags in text content
    const allText = [
      ...Object.values(section.props),
      ...(section.children ?? []).flatMap((c) => Object.values(c.props)),
    ]
      .filter((v): v is string => typeof v === "string")
      .join(" ");
    const inlineLinks = allText.match(/<a\s+href="\/[^"]+"/g);
    if (inlineLinks) internalLinks += inlineLinks.length;
  }

  // Contact pages are destinations — lower threshold
  const pageType = classifyPageType(input.page.slug, input.page.title);
  const minLinks = pageType === "contact" ? 1 : 2;

  return {
    name: "interlink-density",
    dimension: "seo",
    passed: internalLinks >= minLinks,
    severity: "warning",
    message: internalLinks >= minLinks
      ? `Found ${internalLinks} internal links (minimum: ${minLinks})`
      : `Only ${internalLinks} internal link(s), need at least ${minLinks}`,
    fix: internalLinks < minLinks
      ? `Add internal links to sibling pages using space-button url, space-imagecard url, or <a> tags in space-text content.`
      : undefined,
  };
}

function checkGenericCtaText(input: ReviewInput): ReviewCheck {
  const genericCtas: string[] = [];

  for (const section of input.page.sections) {
    for (const child of section.children ?? []) {
      if (!child.component_id.includes("button") && !child.component_id.includes("link")) continue;
      const text = child.props.text;
      if (typeof text === "string" && GENERIC_CTA_PATTERNS.some((p) => p.test(text.trim()))) {
        genericCtas.push(text.trim());
      }
    }
  }

  return {
    name: "generic-cta-text",
    dimension: "seo",
    passed: genericCtas.length === 0,
    severity: "warning",
    message: genericCtas.length === 0
      ? "All CTA text is descriptive"
      : `Generic CTA text found: "${genericCtas.join('", "')}"`,
    fix: genericCtas.length > 0
      ? `Replace generic CTA text with descriptive labels that hint at the destination (e.g., "Explore Our Services →" instead of "Learn More").`
      : undefined,
  };
}

function checkSelfLinks(input: ReviewInput): ReviewCheck {
  const selfPath = `/${input.page.slug}`;
  let selfLinks = 0;

  for (const section of input.page.sections) {
    for (const value of Object.values(section.props)) {
      if (value === selfPath) selfLinks++;
    }
    for (const child of section.children ?? []) {
      for (const value of Object.values(child.props)) {
        if (value === selfPath) selfLinks++;
      }
    }
  }

  return {
    name: "no-self-links",
    dimension: "seo",
    passed: selfLinks === 0,
    severity: "warning",
    message: selfLinks === 0
      ? "No self-referencing links"
      : `${selfLinks} self-referencing link(s) to /${input.page.slug}`,
    fix: selfLinks > 0
      ? `Remove links pointing to the current page (/${input.page.slug}). Link to other relevant pages instead.`
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Design Checks (TASK-425)
// ---------------------------------------------------------------------------

function checkConsecutiveBackgrounds(input: ReviewInput): ReviewCheck {
  const sections = input.page.sections;
  const duplicates: string[] = [];

  for (let i = 1; i < sections.length; i++) {
    const currBg = (sections[i].props.container_background ?? sections[i].props.background_color ?? "") as string;
    const prevBg = (sections[i - 1].props.container_background ?? sections[i - 1].props.background_color ?? "") as string;
    if (currBg && prevBg && currBg === prevBg) {
      duplicates.push(`sections ${i} and ${i + 1} both use "${currBg}"`);
    }
  }

  return {
    name: "consecutive-backgrounds",
    dimension: "design",
    passed: duplicates.length === 0,
    severity: "warning",
    message: duplicates.length === 0
      ? "Good background alternation across sections"
      : `Consecutive identical backgrounds: ${duplicates.join("; ")}`,
    fix: duplicates.length > 0
      ? "Alternate background colors between consecutive sections for visual rhythm."
      : undefined,
  };
}

/** Text-image patterns grouped by image position (left vs right). */
const IMAGE_RIGHT_PATTERNS = new Set(["text-image-split-50-50", "text-image-split-66-33"]);
const IMAGE_LEFT_PATTERNS = new Set(["image-text-split-33-66", "image-text-split-50-50"]);

function checkImageAlternation(input: ReviewInput): ReviewCheck {
  const textImageSections: Array<{ index: number; side: "left" | "right" }> = [];

  for (let i = 0; i < input.page.sections.length; i++) {
    const pattern = input.page.sections[i].pattern;
    if (!pattern) continue;
    if (IMAGE_RIGHT_PATTERNS.has(pattern)) {
      textImageSections.push({ index: i, side: "right" });
    } else if (IMAGE_LEFT_PATTERNS.has(pattern)) {
      textImageSections.push({ index: i, side: "left" });
    }
  }

  const violations: string[] = [];
  for (let i = 1; i < textImageSections.length; i++) {
    const curr = textImageSections[i];
    const prev = textImageSections[i - 1];
    // Flag if two text-image sections within 2 positions of each other have the same image side
    if (curr.index - prev.index <= 2 && curr.side === prev.side) {
      violations.push(
        `sections ${prev.index + 1} and ${curr.index + 1} both place image on ${curr.side}`
      );
    }
  }

  return {
    name: "image-alternation",
    dimension: "design",
    passed: violations.length === 0,
    severity: "warning",
    message: violations.length === 0
      ? "Text-image sections alternate image position correctly"
      : `Non-alternating image positions: ${violations.join("; ")}`,
    fix: violations.length > 0
      ? "Alternate text-image layouts: use text-image-split (image right) followed by image-text-split (image left) for visual variety."
      : undefined,
  };
}

function checkPatternVariety(input: ReviewInput): ReviewCheck {
  const sections = input.page.sections;
  const duplicates: string[] = [];

  for (let i = 1; i < sections.length; i++) {
    const currPattern = sections[i].pattern;
    const prevPattern = sections[i - 1].pattern;
    if (currPattern && prevPattern && currPattern === prevPattern) {
      duplicates.push(`sections ${i} and ${i + 1} both use "${currPattern}"`);
    }
  }

  return {
    name: "pattern-variety",
    dimension: "design",
    passed: duplicates.length === 0,
    severity: "warning",
    message: duplicates.length === 0
      ? "Good pattern variety across sections"
      : `Consecutive identical patterns: ${duplicates.join("; ")}`,
    fix: duplicates.length > 0
      ? "Use different composition patterns for consecutive sections to create visual interest."
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Main Review Function
// ---------------------------------------------------------------------------

export function reviewPage(input: ReviewInput): ReviewResult {
  const checks: ReviewCheck[] = [
    // Depth checks (TASK-290)
    checkSectionCount(input),
    checkTotalWordCount(input),
    checkNoPlaceholders(input),
    checkVisualRhythm(input),
    checkRequiredSections(input),
    checkSectionWordCount(input),
    // SEO checks (TASK-291)
    checkMetaTitleLength(input),
    checkMetaTitleKeyword(input),
    checkMetaDescLength(input),
    checkMetaDescKeyword(input),
    checkHeroHeading(input),
    checkKeywordDistribution(input),
    checkCtaInternalLinks(input),
    // GEO checks (TASK-292)
    checkEntityClarity(input),
    checkStructuredClaims(input),
    checkFaqPresence(input),
    checkAuthoritativeVoice(input),
    // Interlinking checks (TASK-338)
    checkInterlinkDensity(input),
    checkGenericCtaText(input),
    checkSelfLinks(input),
    // Design checks (TASK-425)
    checkConsecutiveBackgrounds(input),
    checkImageAlternation(input),
    checkPatternVariety(input),
    // Hero heading quality (TASK-423) — error severity, triggers retry
    checkHeroHeadingQuality(input),
  ];

  // Score weights: errors count fully, warnings count at 0.3 weight.
  // This prevents warning-heavy pages from showing misleadingly low scores.
  const errorChecks = checks.filter((c) => c.severity === "error");
  const warningChecks = checks.filter((c) => c.severity === "warning");
  const errorScore = errorChecks.length > 0
    ? errorChecks.filter((c) => c.passed).length / errorChecks.length
    : 1;
  const warningScore = warningChecks.length > 0
    ? warningChecks.filter((c) => c.passed).length / warningChecks.length
    : 1;
  const score = errorScore * 0.7 + warningScore * 0.3;

  // Page fails if any error-severity check fails
  const hasErrors = checks.some((c) => !c.passed && c.severity === "error");
  const passed = !hasErrors;

  // Build feedback string for retry prompt — include errors and high-impact warnings
  const failedChecks = checks.filter((c) => !c.passed && (c.severity === "error") && c.fix);
  const feedback = failedChecks.length > 0
    ? [
        `--- CONTENT REVIEW FAILED ---`,
        ...failedChecks.map((c) => `- [${c.dimension}/${c.name}] ${c.message}. Fix: ${c.fix}`),
        ``,
        `IMPORTANT: Address the issues above while preserving the existing content structure. Focus on adding depth and specificity.`,
      ].join("\n")
    : "";

  return { passed, score, checks, feedback };
}

/**
 * Format review result as a concise log line.
 */
export function formatReviewLog(pageName: string, result: ReviewResult): string {
  const depthScore = dimensionScore(result.checks, "depth");
  const seoScore = dimensionScore(result.checks, "seo");
  const geoScore = dimensionScore(result.checks, "geo");
  const designScore = dimensionScore(result.checks, "design");
  const status = result.passed ? "PASS" : "FAIL";
  return `[review] Page "${pageName}" — ${status} (depth=${depthScore}, seo=${seoScore}, geo=${geoScore}, design=${designScore}, overall=${result.score.toFixed(2)})`;
}

function dimensionScore(checks: ReviewCheck[], dimension: string): string {
  const dimChecks = checks.filter((c) => c.dimension === dimension);
  const passed = dimChecks.filter((c) => c.passed).length;
  return `${passed}/${dimChecks.length}`;
}
