import { describe, it, expect } from "vitest";
import { compileRulesToPromptFragment } from "../prompt-compiler";
import type { DesignRuleSet } from "../types";

function makeRuleset(overrides: Partial<DesignRuleSet> = {}): DesignRuleSet {
  return {
    composition: {},
    content: {},
    visual: {},
    tokens: {},
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

  it("includes design tokens section with MUST USE label", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        tokens: {
          container: "max-w-6xl mx-auto px-6 lg:px-8",
          card: "rounded-xl border p-6 shadow-sm",
        },
      })
    );
    expect(result).toContain("### Design Tokens (MUST USE");
    expect(result).toContain("`max-w-6xl mx-auto px-6 lg:px-8`");
    expect(result).toContain("`rounded-xl border p-6 shadow-sm`");
  });

  it("includes typography sub-tokens", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        tokens: {
          typography: {
            h1: "text-5xl font-bold",
            h2: "text-3xl font-bold",
            body: "text-base leading-relaxed",
          },
        },
      })
    );
    expect(result).toContain("**Typography scale**");
    expect(result).toContain("h1: `text-5xl font-bold`");
    expect(result).toContain("h2: `text-3xl font-bold`");
    expect(result).toContain("body: `text-base leading-relaxed`");
  });

  it("includes button sub-tokens", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        tokens: {
          button: {
            primary: "px-6 py-3 rounded-lg bg-blue-600 text-white",
            secondary: "px-6 py-3 rounded-lg border-2",
          },
        },
      })
    );
    expect(result).toContain("**Buttons**");
    expect(result).toContain("primary: `px-6 py-3 rounded-lg bg-blue-600 text-white`");
    expect(result).toContain("secondary: `px-6 py-3 rounded-lg border-2`");
  });

  it("includes background alternation as plain text", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        tokens: {
          backgroundAlternation: "white → gray-50 → white → brand",
        },
      })
    );
    expect(result).toContain("**Background alternation**: white → gray-50 → white → brand");
  });

  it("omits tokens section when no tokens defined", () => {
    const result = compileRulesToPromptFragment(
      makeRuleset({
        tokens: {},
        composition: { requiredSections: ["hero"] },
      })
    );
    expect(result).not.toContain("Design Tokens");
  });
});
