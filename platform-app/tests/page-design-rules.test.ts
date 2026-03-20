/**
 * Tests for Page Design Rules — classification, formatting, and data integrity.
 */
import { describe, it, expect } from "vitest";
import {
  classifyPageType,
  getRule,
  formatRulesForPlan,
  formatRulesForGeneration,
  PAGE_DESIGN_RULES,
} from "../src/lib/ai/page-design-rules";

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

  it("classifies pricing pages", () => {
    expect(classifyPageType("pricing", "Pricing")).toBe("pricing");
    expect(classifyPageType("plans", "Our Plans")).toBe("pricing");
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
    expect(classifyPageType("rates", "Pricing Plans")).toBe("pricing");
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

  it("all component IDs follow the space_ds: namespace pattern", () => {
    for (const rule of PAGE_DESIGN_RULES) {
      for (const section of rule.sections) {
        for (const comp of section.preferredComponents) {
          expect(comp).toMatch(/^space_ds:space-/);
        }
      }
      for (const style of rule.heroRule.preferredStyles) {
        expect(style).toMatch(/^space_ds:space-hero-banner-style-\d+$/);
      }
      for (const avoid of rule.avoidComponents) {
        expect(avoid).toMatch(/^space_ds:space-/);
      }
    }
  });

  it("includes a generic fallback rule", () => {
    const generic = PAGE_DESIGN_RULES.find((r) => r.pageType === "generic");
    expect(generic).toBeDefined();
  });

  it("covers all 10 page types", () => {
    const types = PAGE_DESIGN_RULES.map((r) => r.pageType);
    expect(types).toContain("home");
    expect(types).toContain("about");
    expect(types).toContain("services");
    expect(types).toContain("contact");
    expect(types).toContain("portfolio");
    expect(types).toContain("pricing");
    expect(types).toContain("faq");
    expect(types).toContain("team");
    expect(types).toContain("landing");
    expect(types).toContain("generic");
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
    expect(joined).toContain("MINIMUM 5 sections");
    expect(joined).toContain("REQUIRED sections");
  });

  it("includes required sections with word counts", () => {
    const lines = formatRulesForPlan([{ slug: "contact", title: "Contact" }]);
    const joined = lines.join("\n");
    expect(joined).toContain("hero");
    expect(joined).toContain("text");
    expect(joined).toContain("words");
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

  it("includes hero style selection", () => {
    const lines = formatRulesForGeneration("home", "Home");
    const joined = lines.join("\n");
    expect(joined).toContain("## Hero Style Selection");
    expect(joined).toContain("space-hero-banner-style-01");
    expect(joined).toContain("space-hero-banner-style-05");
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
    expect(joined).toContain("space-accordion");
  });

  it("includes component mapping", () => {
    const lines = formatRulesForGeneration("services", "Services");
    const joined = lines.join("\n");
    expect(joined).toContain("Component ID mapping");
    expect(joined).toContain("hero →");
    expect(joined).toContain("cta →");
  });

  it("falls back to generic for unknown pages", () => {
    const lines = formatRulesForGeneration("blog", "Blog Posts");
    const joined = lines.join("\n");
    expect(joined).toContain("generic page");
  });
});
