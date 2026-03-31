import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDesignRules } from "../index";
import { clearRuleCache } from "../loader";

describe("getDesignRules", () => {
  beforeEach(() => {
    clearRuleCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when feature flag is off", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "false");
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Healthcare",
    });
    expect(result).toBeNull();
  });

  it("returns null when feature flag is not set", () => {
    delete process.env.ENABLE_DESIGN_RULES;
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Healthcare",
    });
    expect(result).toBeNull();
  });

  it("returns null for design_system mode", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "true");
    const result = getDesignRules({
      generationMode: "design_system",
      industry: "Healthcare",
    });
    expect(result).toBeNull();
  });

  it("returns null when industry is empty", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "true");
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "",
    });
    expect(result).toBeNull();
  });

  it("returns fragment and ruleset when enabled for code_components", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "true");
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Healthcare",
      audience: "patients",
      tone: "professional",
    });
    expect(result).not.toBeNull();
    expect(result!.fragment).toContain("DESIGN RULES");
    expect(result!.ruleset._meta.layers).toContain("global");
    expect(result!.ruleset._meta.layers).toContain("industry-healthcare");
  });

  it("returns rules for unknown industry (global only)", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "true");
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Quantum Computing",
    });
    expect(result).not.toBeNull();
    expect(result!.ruleset._meta.layers).toEqual(["global"]);
  });
});
