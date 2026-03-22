/**
 * Tests for Page Design Rules — classification, formatting, and data integrity.
 * Updated for design system adapter model.
 */
import { describe, it, expect } from "vitest";
import {
  classifyPageType,
  getRule,
  formatRulesForPlan,
  formatRulesForGeneration,
  PAGE_DESIGN_RULES,
  COMPOSITION_PATTERNS,
} from "../src/lib/ai/page-design-rules";
import { getDefaultAdapter } from "../src/lib/design-systems/setup";

// Build component ID whitelist from the active adapter's manifest
const adapter = getDefaultAdapter();
const VALID_COMPONENT_IDS = new Set(adapter.getManifest().map((c) => c.id));

// ============================================================================
// classifyPageType
// ============================================================================
describe("classifyPageType", () => {
  it("classifies home pages", () => {
    expect(classifyPageType("home", "Home")).toBe("home");
    expect(classifyPageType("", "Welcome")).toBe("home");
    expect(classifyPageType("homepage", "Homepage")).toBe("home");
  });

  it("classifies about pages", () => {
    expect(classifyPageType("about", "About Us")).toBe("about");
    expect(classifyPageType("about-us", "About Our Team")).toBe("about");
    expect(classifyPageType("our-story", "Our Story")).toBe("about");
    expect(classifyPageType("who-we-are", "Who We Are")).toBe("about");
  });

  it("classifies service pages", () => {
    expect(classifyPageType("services", "Our Services")).toBe("services");
    expect(classifyPageType("what-we-do", "What We Do")).toBe("services");
    expect(classifyPageType("solutions", "Solutions")).toBe("services");
    expect(classifyPageType("offerings", "Our Offerings")).toBe("services");
    expect(classifyPageType("practice-areas", "Practice Areas")).toBe("services");
  });

  it("classifies contact pages", () => {
    expect(classifyPageType("contact", "Contact Us")).toBe("contact");
    expect(classifyPageType("contact-us", "Get In Touch")).toBe("contact");
    expect(classifyPageType("get-in-touch", "Reach Us")).toBe("contact");
  });

  it("classifies portfolio pages", () => {
    expect(classifyPageType("portfolio", "Our Portfolio")).toBe("portfolio");
    expect(classifyPageType("gallery", "Gallery")).toBe("portfolio");
    expect(classifyPageType("our-work", "Our Work")).toBe("portfolio");
    expect(classifyPageType("projects", "Projects")).toBe("portfolio");
    expect(classifyPageType("case-studies", "Case Studies")).toBe("portfolio");
  });

  it("classifies FAQ pages", () => {
    expect(classifyPageType("faq", "FAQ")).toBe("faq");
    expect(classifyPageType("frequently-asked-questions", "Common Questions")).toBe("faq");
  });

  it("classifies team pages", () => {
    expect(classifyPageType("team", "Our Team")).toBe("team");
    expect(classifyPageType("our-team", "Team")).toBe("team");
    expect(classifyPageType("leadership", "Leadership")).toBe("team");
  });

  it("returns generic for unknown pages", () => {
    expect(classifyPageType("blog", "Latest News")).toBe("generic");
    expect(classifyPageType("menu", "Our Menu")).toBe("generic");
    expect(classifyPageType("custom-page", "Custom Page")).toBe("generic");
  });

  it("matches by title when slug is custom", () => {
    expect(classifyPageType("custom-slug", "About Our Company")).toBe("about");
    expect(classifyPageType("info", "Get in Touch")).toBe("contact");
  });

  it("no longer classifies pricing pages (removed in v2)", () => {
    // pricing slug/title should fall through to generic
    expect(classifyPageType("pricing", "Pricing")).toBe("generic");
    expect(classifyPageType("plans", "Our Plans")).toBe("generic");
  });
});

// ============================================================================
// COMPOSITION_PATTERNS integrity
// ============================================================================
describe("COMPOSITION_PATTERNS", () => {
  it("all patterns have childRoles defined", () => {
    for (const [name, pattern] of Object.entries(COMPOSITION_PATTERNS)) {
      expect(pattern.childRoles.length, `Pattern "${name}" must have childRoles`).toBeGreaterThan(0);
    }
  });

  it("includes all expected patterns", () => {
    const names = Object.keys(COMPOSITION_PATTERNS);
    expect(names).toContain("text-image-split-50-50");
    expect(names).toContain("features-grid-3col");
    expect(names).toContain("stats-row");
    expect(names).toContain("testimonials-carousel");
    expect(names).toContain("team-grid-4col");
    expect(names).toContain("card-grid-3col");
    expect(names).toContain("contact-info");
    expect(names).toContain("faq-accordion");
    expect(names).toContain("logo-showcase");
    expect(names).toContain("full-width-text");
  });
});

// ============================================================================
// Rules data integrity
// ============================================================================
describe("PAGE_DESIGN_RULES data integrity", () => {
  it("every rule has at least one required hero section", () => {
    for (const rule of PAGE_DESIGN_RULES) {
      const hasHero = rule.sections.some(
        (s) => s.type === "hero" && s.required
      );
      expect(hasHero, `${rule.pageType} must have a required hero`).toBe(true);
    }
  });

  it("every rule has valid sectionCountRange", () => {
    for (const rule of PAGE_DESIGN_RULES) {
      expect(rule.sectionCountRange[0]).toBeGreaterThan(0);
      expect(rule.sectionCountRange[1]).toBeGreaterThanOrEqual(
        rule.sectionCountRange[0]
      );
    }
  });

  it("heroRule.preferredStyles are non-empty for all rules", () => {
    for (const rule of PAGE_DESIGN_RULES) {
      expect(
        rule.heroRule.preferredStyles.length,
        `${rule.pageType} must have preferred hero styles`
      ).toBeGreaterThan(0);
    }
  });

  it("all hero style IDs reference valid adapter hero components", () => {
    const validHeroes = new Set(adapter.resolveRole("hero"));
    for (const rule of PAGE_DESIGN_RULES) {
      for (const style of rule.heroRule.preferredStyles) {
        expect(validHeroes.has(style), `${rule.pageType} hero style "${style}" is not a valid hero component`).toBe(true);
      }
    }
  });

  it("all component IDs in preferredPatterns and avoidComponents are valid adapter components or composition pattern names", () => {
    const patternNames = new Set(Object.keys(COMPOSITION_PATTERNS));
    for (const rule of PAGE_DESIGN_RULES) {
      for (const section of rule.sections) {
        for (const pattern of section.preferredPatterns) {
          const isComponentId = pattern.includes(":");
          const isPatternName = patternNames.has(pattern);
          expect(
            isComponentId || isPatternName,
            `${rule.pageType}.${section.type} pattern "${pattern}" is neither a component ID nor a composition pattern`
          ).toBe(true);
          if (isComponentId) {
            expect(VALID_COMPONENT_IDS.has(pattern), `${rule.pageType}.${section.type} pattern "${pattern}" is not in adapter manifest`).toBe(true);
          }
        }
      }
      for (const avoid of rule.avoidComponents) {
        expect(VALID_COMPONENT_IDS.has(avoid), `${rule.pageType} avoidComponent "${avoid}" is not in adapter manifest`).toBe(true);
      }
    }
  });

  it("does NOT include pricing page type", () => {
    const types = PAGE_DESIGN_RULES.map((r) => r.pageType);
    expect(types).not.toContain("pricing");
  });

  it("includes a generic fallback rule", () => {
    const generic = PAGE_DESIGN_RULES.find((r) => r.pageType === "generic");
    expect(generic).toBeDefined();
  });

  it("covers all 9 page types (pricing removed)", () => {
    const types = PAGE_DESIGN_RULES.map((r) => r.pageType);
    expect(types).toContain("home");
    expect(types).toContain("about");
    expect(types).toContain("services");
    expect(types).toContain("contact");
    expect(types).toContain("portfolio");
    expect(types).toContain("faq");
    expect(types).toContain("team");
    expect(types).toContain("landing");
    expect(types).toContain("generic");
  });

  it("has no references to deleted v1 components", () => {
    const deletedPatterns = [
      "text-media", "hero-banner-style-01", "hero-banner-style-03",
      "hero-banner-style-04", "hero-banner-style-05", "hero-banner-style-06",
      "hero-banner-style-07", "hero-banner-style-08", "hero-banner-style-09",
      "hero-banner-style-10", "hero-banner-style-11",
      "team-section", "pricing-card", "pricing-featured",
      "people-card", "cta-banner-type-2", "cta-banner-type-3",
      "accordion-with-image", "space-features", "logo-grid",
      "icon-card", "quicklink-card",
    ];
    const serialized = JSON.stringify(PAGE_DESIGN_RULES);
    for (const pattern of deletedPatterns) {
      expect(serialized).not.toContain(pattern);
    }
  });
});

// ============================================================================
// getRule
// ============================================================================
describe("getRule", () => {
  it("returns the correct rule for each page type", () => {
    expect(getRule("home").pageType).toBe("home");
    expect(getRule("contact").pageType).toBe("contact");
    expect(getRule("generic").pageType).toBe("generic");
  });

  it("falls back to generic for unknown types", () => {
    // @ts-expect-error — testing fallback for invalid types
    const rule = getRule("nonexistent");
    expect(rule.pageType).toBe("generic");
  });
});

// ============================================================================
// formatRulesForPlan
// ============================================================================
describe("formatRulesForPlan", () => {
  it("produces guidance for each page", () => {
    const pages = [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About Us" },
      { slug: "contact", title: "Contact" },
    ];
    const lines = formatRulesForPlan(pages);

    const joined = lines.join("\n");
    expect(lines.length).toBeGreaterThanOrEqual(4);
    expect(joined).toContain("MANDATORY");
    expect(joined).toContain("[home]");
    expect(joined).toContain("[about]");
    expect(joined).toContain("[contact]");
  });

  it("includes section count ranges as hard constraints", () => {
    const lines = formatRulesForPlan([{ slug: "home", title: "Home" }]);
    const joined = lines.join("\n");
    expect(joined).toContain("MINIMUM 7 sections");
    expect(joined).toContain("REQUIRED sections");
  });

  it("includes required sections with word counts", () => {
    const lines = formatRulesForPlan([{ slug: "contact", title: "Contact" }]);
    const joined = lines.join("\n");
    expect(joined).toContain("hero");
    expect(joined).toContain("contact");
    expect(joined).toContain("words");
  });

  it("includes design system model in output", () => {
    const lines = formatRulesForPlan([{ slug: "home", title: "Home" }]);
    const joined = lines.join("\n");
    expect(joined).toContain("Compositional Model");
  });
});

// ============================================================================
// formatRulesForGeneration
// ============================================================================
describe("formatRulesForGeneration", () => {
  it("includes page composition rules section", () => {
    const lines = formatRulesForGeneration("home", "Home");
    const joined = lines.join("\n");
    expect(joined).toContain("## Page Composition Rules");
    expect(joined).toContain("home page");
  });

  it("includes hero style selection with v2 heroes", () => {
    const lines = formatRulesForGeneration("home", "Home");
    const joined = lines.join("\n");
    expect(joined).toContain("## Hero Style Selection");
    expect(joined).toContain("space-hero-banner-style-02");
    expect(joined).toContain("space-hero-banner-with-media");
  });

  it("includes composition patterns reference", () => {
    const lines = formatRulesForGeneration("home", "Home");
    const joined = lines.join("\n");
    expect(joined).toContain("## Composition Patterns Reference");
    expect(joined).toContain("features-grid-3col");
  });

  it("includes section composition rules", () => {
    const lines = formatRulesForGeneration("home", "Home");
    const joined = lines.join("\n");
    expect(joined).toContain("## Section Composition Rules");
  });

  it("includes visual rhythm guidance", () => {
    const lines = formatRulesForGeneration("about", "About Us");
    const joined = lines.join("\n");
    expect(joined).toContain("## Visual Rhythm");
    expect(joined).toContain("Pattern:");
  });

  it("includes avoid list for contact pages", () => {
    const lines = formatRulesForGeneration("contact", "Contact");
    const joined = lines.join("\n");
    expect(joined).toContain("AVOID");
  });

  it("includes section type mapping", () => {
    const lines = formatRulesForGeneration("services", "Services");
    const joined = lines.join("\n");
    expect(joined).toContain("Section Type Mapping");
    expect(joined).toContain("hero ->");
    expect(joined).toContain("cta ->");
  });

  it("falls back to generic for unknown pages", () => {
    const lines = formatRulesForGeneration("blog", "Blog Posts");
    const joined = lines.join("\n");
    expect(joined).toContain("generic page");
  });
});
