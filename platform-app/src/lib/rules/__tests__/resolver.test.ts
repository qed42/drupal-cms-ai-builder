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
});
