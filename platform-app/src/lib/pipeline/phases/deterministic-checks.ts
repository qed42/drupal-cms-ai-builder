/**
 * Deterministic Pre-Check Pass — structural validation with auto-fix.
 *
 * Runs BEFORE the content quality review to catch and fix structural issues
 * that don't require AI regeneration. This prevents wasting review retries
 * on problems like consecutive identical backgrounds or visual rhythm violations.
 *
 * Checks extracted from review.ts deterministic checks:
 * - Section count (unfixable — needs AI)
 * - Required sections (unfixable — needs AI)
 * - Placeholder text (partially fixable)
 * - Visual rhythm / consecutive patterns (auto-fixable via reorder)
 * - Consecutive backgrounds (auto-fixable via alternation)
 */

import { classifyPageType, getRule } from "../../ai/page-design-rules";
import type { PageSection } from "@/lib/blueprint/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeterministicCheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface DeterministicResult {
  /** All checks passed (including after auto-fixes). */
  passed: boolean;
  /** Issues that were fixed in-place (mutations on sections array). */
  autoFixed: string[];
  /** Issues that cannot be auto-fixed and need AI regeneration. */
  unfixable: string[];
  /** Individual check results for logging. */
  checks: DeterministicCheckResult[];
}

// ---------------------------------------------------------------------------
// Placeholder patterns (same as review.ts)
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /your (business|company|brand) (here|name)/i,
  /\[.*?\]/,
  /example\.com/i,
  /placeholder/i,
  /TODO/,
];

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Run deterministic structural checks on a generated page.
 * Auto-fixes where possible (mutates the sections array in place).
 * Returns unfixable issues that need AI regeneration.
 */
export function runDeterministicChecks(
  slug: string,
  title: string,
  sections: PageSection[]
): DeterministicResult {
  const autoFixed: string[] = [];
  const unfixable: string[] = [];
  const checks: DeterministicCheckResult[] = [];

  // 1. Section count
  const countResult = checkSectionCount(slug, title, sections);
  checks.push(countResult);
  if (!countResult.passed) {
    unfixable.push(countResult.message);
  }

  // 2. Required sections
  const requiredResult = checkRequiredSections(slug, title, sections);
  checks.push(requiredResult);
  if (!requiredResult.passed) {
    unfixable.push(requiredResult.message);
  }

  // 3. Placeholder text
  const placeholderResult = checkPlaceholders(sections);
  checks.push(placeholderResult);
  if (!placeholderResult.passed) {
    // Placeholders need AI to rewrite — unfixable
    unfixable.push(placeholderResult.message);
  }

  // 4. Visual rhythm — auto-fixable
  const rhythmResult = fixVisualRhythm(sections);
  checks.push(rhythmResult.check);
  if (rhythmResult.fixed) {
    autoFixed.push(rhythmResult.fixed);
  }

  // 5. Consecutive backgrounds — auto-fixable
  const bgResult = fixConsecutiveBackgrounds(sections);
  checks.push(bgResult.check);
  if (bgResult.fixed) {
    autoFixed.push(bgResult.fixed);
  }

  // 6. Consecutive patterns — auto-fixable (same as rhythm but for pattern field)
  const patternResult = fixConsecutivePatterns(sections);
  checks.push(patternResult.check);
  if (patternResult.fixed) {
    autoFixed.push(patternResult.fixed);
  }

  const passed = unfixable.length === 0;

  return { passed, autoFixed, unfixable, checks };
}

// ---------------------------------------------------------------------------
// Individual Checks
// ---------------------------------------------------------------------------

function checkSectionCount(
  slug: string,
  title: string,
  sections: PageSection[]
): DeterministicCheckResult {
  const pageType = classifyPageType(slug, title);
  const rule = getRule(pageType);
  const min = rule.sectionCountRange[0];
  const actual = sections.length;

  return {
    name: "section-count",
    passed: actual >= min,
    message: actual >= min
      ? `Section count ${actual} meets minimum ${min}`
      : `Section count ${actual} is below minimum ${min} for ${pageType} page — need ${min - actual} more`,
  };
}

function checkRequiredSections(
  slug: string,
  title: string,
  sections: PageSection[]
): DeterministicCheckResult {
  const pageType = classifyPageType(slug, title);
  const rule = getRule(pageType);
  const requiredTypes = rule.sections.filter((s) => s.required).map((s) => s.type);

  const presentTypes = new Set<string>();
  for (const section of sections) {
    const id = section.component_id?.toLowerCase() || "";
    const pattern = section.pattern?.toLowerCase() || "";

    // Heuristic type detection (matches review.ts logic)
    if (id.includes("hero")) presentTypes.add("hero");
    if (id.includes("cta") || pattern.includes("cta")) presentTypes.add("cta");
    if (id.includes("accordion") || pattern.includes("faq")) presentTypes.add("faq");
    if (id.includes("testimonial") || pattern.includes("testimonial")) presentTypes.add("testimonials");
    if (pattern.includes("feature") || pattern.includes("grid")) presentTypes.add("features");
    if (pattern.includes("team")) presentTypes.add("team");
    if (pattern.includes("stat")) presentTypes.add("stats");
    if (pattern.includes("text") || pattern.includes("about")) presentTypes.add("text");
    if (pattern.includes("contact")) presentTypes.add("contact");
    if (pattern.includes("gallery") || pattern.includes("card")) presentTypes.add("gallery");

    // Check children for type detection
    if (section.children) {
      for (const child of section.children) {
        const childId = child.component_id?.toLowerCase() || "";
        if (childId.includes("testimonial")) presentTypes.add("testimonials");
        if (childId.includes("feature") || childId.includes("icon-card")) presentTypes.add("features");
        if (childId.includes("team")) presentTypes.add("team");
        if (childId.includes("stat")) presentTypes.add("stats");
      }
    }
  }

  const missing = requiredTypes.filter((t) => !presentTypes.has(t));

  return {
    name: "required-sections",
    passed: missing.length === 0,
    message: missing.length === 0
      ? "All required section types present"
      : `Missing required section types: ${missing.join(", ")}`,
  };
}

function checkPlaceholders(sections: PageSection[]): DeterministicCheckResult {
  const allText = sections
    .map((s) => {
      const sectionText = Object.values(s.props || {})
        .filter((v): v is string => typeof v === "string")
        .join(" ");
      const childrenText = (s.children ?? [])
        .map((c) =>
          Object.values(c.props || {})
            .filter((v): v is string => typeof v === "string")
            .join(" ")
        )
        .join(" ");
      return `${sectionText} ${childrenText}`;
    })
    .join(" ");

  const matches: string[] = [];
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = allText.match(pattern);
    if (match) matches.push(match[0]);
  }

  return {
    name: "no-placeholders",
    passed: matches.length === 0,
    message: matches.length === 0
      ? "No placeholder text detected"
      : `Placeholder text found: "${matches.join('", "')}"`,
  };
}

// ---------------------------------------------------------------------------
// Auto-Fix Functions (mutate sections in place)
// ---------------------------------------------------------------------------

function fixVisualRhythm(
  sections: PageSection[]
): { check: DeterministicCheckResult; fixed?: string } {
  const duplicates: Array<{ index: number; identity: string }> = [];

  const sectionIdentity = (s: PageSection) => s.pattern || s.component_id || "";

  for (let i = 1; i < sections.length; i++) {
    const curr = sectionIdentity(sections[i]);
    const prev = sectionIdentity(sections[i - 1]);
    if (curr && prev && curr === prev) {
      duplicates.push({ index: i, identity: curr });
    }
  }

  if (duplicates.length === 0) {
    return {
      check: { name: "visual-rhythm", passed: true, message: "Good visual rhythm" },
    };
  }

  // Auto-fix: swap the duplicate with the next non-duplicate section
  let fixCount = 0;
  for (const dup of duplicates) {
    const i = dup.index;
    // Find a later section that's different
    for (let j = i + 1; j < sections.length; j++) {
      if (sectionIdentity(sections[j]) !== dup.identity) {
        // Don't swap hero (index 0) or final CTA
        if (i > 0 && j < sections.length) {
          [sections[i], sections[j]] = [sections[j], sections[i]];
          fixCount++;
          break;
        }
      }
    }
  }

  const fixed = fixCount > 0
    ? `Auto-fixed visual rhythm: swapped ${fixCount} section(s) to break consecutive identical components`
    : undefined;

  return {
    check: {
      name: "visual-rhythm",
      passed: fixCount > 0 || duplicates.length === 0,
      message: fixed || `Consecutive identical components detected but could not auto-fix: ${duplicates.map((d) => d.identity).join(", ")}`,
    },
    fixed,
  };
}

function fixConsecutiveBackgrounds(
  sections: PageSection[]
): { check: DeterministicCheckResult; fixed?: string } {
  const ALTERNATING_BGS = ["", "light"];
  let fixCount = 0;

  for (let i = 1; i < sections.length; i++) {
    const currBg = (sections[i].props?.container_background ?? sections[i].props?.background_color ?? "") as string;
    const prevBg = (sections[i - 1].props?.container_background ?? sections[i - 1].props?.background_color ?? "") as string;

    if (currBg && prevBg && currBg === prevBg) {
      // Toggle to the other background
      const newBg = ALTERNATING_BGS.find((bg) => bg !== currBg) ?? "";
      if (sections[i].props?.container_background !== undefined) {
        sections[i].props.container_background = newBg;
      } else if (sections[i].props?.background_color !== undefined) {
        sections[i].props.background_color = newBg;
      }
      fixCount++;
    }
  }

  const fixed = fixCount > 0
    ? `Auto-fixed ${fixCount} consecutive background(s) by alternating colors`
    : undefined;

  return {
    check: {
      name: "consecutive-backgrounds",
      passed: true, // Always passes after fix
      message: fixed || "Good background alternation",
    },
    fixed,
  };
}

function fixConsecutivePatterns(
  sections: PageSection[]
): { check: DeterministicCheckResult; fixed?: string } {
  // Same as visual rhythm but specifically for the pattern field
  // Visual rhythm handles component_id || pattern; this targets pattern-only duplicates
  // that visual rhythm might miss if component_id differs
  const duplicates: number[] = [];

  for (let i = 1; i < sections.length; i++) {
    const currPattern = sections[i].pattern;
    const prevPattern = sections[i - 1].pattern;
    if (currPattern && prevPattern && currPattern === prevPattern) {
      duplicates.push(i);
    }
  }

  if (duplicates.length === 0) {
    return {
      check: { name: "pattern-variety", passed: true, message: "Good pattern variety" },
    };
  }

  // Auto-fix: swap with next section that has a different pattern
  let fixCount = 0;
  for (const i of duplicates) {
    for (let j = i + 1; j < sections.length; j++) {
      if (sections[j].pattern !== sections[i].pattern) {
        if (i > 0 && j < sections.length) {
          [sections[i], sections[j]] = [sections[j], sections[i]];
          fixCount++;
          break;
        }
      }
    }
  }

  const fixed = fixCount > 0
    ? `Auto-fixed ${fixCount} consecutive pattern(s) by reordering sections`
    : undefined;

  return {
    check: {
      name: "pattern-variety",
      passed: fixCount > 0 || duplicates.length === 0,
      message: fixed || `Consecutive identical patterns could not be auto-fixed`,
    },
    fixed,
  };
}
