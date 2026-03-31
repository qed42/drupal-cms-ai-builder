import { describe, it, expect, beforeEach } from "vitest";
import { resolveDesignRules } from "../resolver";
import { clearRuleCache } from "../loader";

describe("resolveDesignRules", () => {
  beforeEach(() => {
    clearRuleCache();
  });

  it("resolves global rules for unknown industry", () => {
    const result = resolveDesignRules("Unknown Industry", "general");
    expect(result._meta.layers).toContain("global");
    expect(result.composition.requiredSections).toContain("hero");
    expect(result.composition.requiredSections).toContain("cta");
  });

  it("merges healthcare industry rules with global", () => {
    const result = resolveDesignRules("Healthcare", "general");
    expect(result._meta.layers).toContain("global");
    expect(result._meta.layers).toContain("industry-healthcare");
    // Global sections + healthcare sections
    expect(result.composition.requiredSections).toContain("hero");
    expect(result.composition.requiredSections).toContain("services");
    expect(result.composition.requiredSections).toContain("testimonials");
    // Healthcare-specific
    expect(result.composition.avoidSections).toContain("pricing");
    expect(result.content.toneOverrides).toContain("empathetic");
    expect(result.compliance.requiredDisclosures?.length).toBeGreaterThan(0);
  });

  it("merges persona rules on top of industry", () => {
    const result = resolveDesignRules("Healthcare", "small-business");
    expect(result._meta.layers).toContain("persona-small-business");
    // Small business persona adds contact section
    expect(result.composition.requiredSections).toContain("contact");
    // Healthcare industry tone still present
    expect(result.content.toneOverrides).toContain("empathetic");
    // Small business persona adds friendly tone
    expect(result.content.toneOverrides).toContain("friendly");
  });

  it("deduplicates array entries across layers", () => {
    const result = resolveDesignRules("Healthcare", "small-business");
    // Both global and persona may add similar sections - no duplicates
    const sections = result.composition.requiredSections || [];
    const unique = [...new Set(sections)];
    expect(sections.length).toBe(unique.length);
  });

  it("records provenance in _meta", () => {
    const result = resolveDesignRules("Restaurant", "small-business");
    expect(result._meta.persona).toBe("small-business");
    expect(result._meta.resolvedAt).toBeTruthy();
    expect(result._meta.layers.length).toBeGreaterThanOrEqual(1);
  });

  it("handles missing industry file gracefully", () => {
    const result = resolveDesignRules("Quantum Computing", "general");
    // Should still get global rules
    expect(result._meta.layers).toContain("global");
    expect(result.composition.requiredSections).toContain("hero");
  });

  it("scalars from later layers overwrite earlier ones", () => {
    const result = resolveDesignRules("Healthcare", "enterprise");
    // Enterprise persona maxSectionsPerPage (10) overwrites global (8)
    expect(result.composition.maxSectionsPerPage).toBe(10);
  });

  it("resolves global design tokens", () => {
    const result = resolveDesignRules("Unknown Industry", "general");
    expect(result.tokens.container).toBe("max-w-6xl mx-auto px-6 lg:px-8");
    expect(result.tokens.typography?.h1).toContain("text-4xl");
    expect(result.tokens.button?.primary).toContain("bg-[var(--color-primary)]");
    expect(result.tokens.card).toContain("rounded-xl");
  });

  it("merges industry token overrides with global tokens", () => {
    const result = resolveDesignRules("Healthcare", "general");
    // Healthcare overrides card style
    expect(result.tokens.card).toContain("rounded-2xl");
    // But keeps global container
    expect(result.tokens.container).toBe("max-w-6xl mx-auto px-6 lg:px-8");
  });

  it("deep-merges nested token objects (button, typography)", () => {
    const result = resolveDesignRules("Healthcare", "general");
    // Healthcare overrides primary button but secondary comes from global
    expect(result.tokens.button?.primary).toContain("rounded-full");
    expect(result.tokens.button?.secondary).toContain("border-2");
  });

  it("portfolio tokens override global typography and card", () => {
    const result = resolveDesignRules("Portfolio", "general");
    expect(result.tokens.typography?.h1).toContain("text-5xl");
    expect(result.tokens.card).toContain("rounded-none");
    // Global body typography still present (not overridden)
    expect(result.tokens.typography?.body).toContain("text-base");
  });
});
