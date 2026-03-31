import { describe, it, expect } from "vitest";
import { compileRulesToPromptFragment } from "../prompt-compiler";
import type { DesignRuleSet } from "../types";

function makeRuleset(overrides: Partial<DesignRuleSet> = {}): DesignRuleSet {
  return {
    composition: {},
    content: {},
    visual: {},
    compliance: {},
    _meta: { layers: ["global"], persona: "general", resolvedAt: "2026-03-31T00:00:00Z" },
    ...overrides,
  };
}

describe("compileRulesToPromptFragment", () => {
  it("returns empty string for empty ruleset", () => {
    const result = compileRulesToPromptFragment(makeRuleset());
    expect(result).toBe("");
  });

  it("includes composition section when rules present", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        composition: { requiredSections: ["hero", "cta"], avoidSections: ["pricing"] },
      })
    );
    expect(result).toContain("### Composition Constraints");
    expect(result).toContain("hero, cta");
    expect(result).toContain("pricing");
  });

  it("includes content guidelines", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        content: { toneOverrides: ["empathetic"], ctaGuidance: "Use soft CTAs" },
      })
    );
    expect(result).toContain("### Content Guidelines");
    expect(result).toContain("empathetic");
    expect(result).toContain("Use soft CTAs");
  });

  it("includes compliance with MUST FOLLOW label", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        compliance: { requiredDisclosures: ["HIPAA notice"] },
      })
    );
    expect(result).toContain("### Compliance (MUST FOLLOW)");
    expect(result).toContain("HIPAA notice");
  });

  it("includes layer trace in header", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        _meta: { layers: ["global", "industry-healthcare"], persona: "general", resolvedAt: "" },
        composition: { requiredSections: ["hero"] },
      })
    );
    expect(result).toContain("Auto-resolved: global → industry-healthcare");
  });

  it("only includes non-empty categories", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        visual: { heroStyle: "Full-bleed photography" },
      })
    );
    expect(result).toContain("### Visual Direction");
    expect(result).not.toContain("### Composition");
    expect(result).not.toContain("### Content");
    expect(result).not.toContain("### Compliance");
  });
});
