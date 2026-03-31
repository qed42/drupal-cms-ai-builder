/**
 * Integration test: design rules → prompt fragment → code component prompt.
 *
 * Verifies the full path from onboarding data through rules resolution
 * to prompt injection with design tokens.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDesignRules } from "../index";
import { clearRuleCache } from "../loader";
import { buildCodeComponentPrompt } from "@/lib/ai/prompts/code-component-generation";
import type { SectionDesignBrief } from "@/lib/code-components/types";

const baseBrief: SectionDesignBrief = {
  heading: "Welcome to Our Practice",
  contentBrief: "Healthcare hero with a calming message",
  sectionType: "hero",
  position: 0,
  totalSections: 5,
  brandTokens: {
    colors: { primary: "#1e40af" },
    fonts: { heading: "Inter", body: "Inter" },
  },
  toneGuidance: "empathetic",
  animationLevel: "subtle",
  visualStyle: "minimal",
};

describe("Design Rules → Prompt Integration", () => {
  beforeEach(() => {
    clearRuleCache();
    vi.stubEnv("ENABLE_DESIGN_RULES", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("healthcare tokens appear in the compiled prompt", () => {
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Healthcare",
      audience: "patients",
      tone: "empathetic",
    });

    expect(result).not.toBeNull();
    const { fragment } = result!;

    // Healthcare overrides should be present
    expect(fragment).toContain("rounded-2xl");
    expect(fragment).toContain("rounded-full");
    // Global tokens should be present
    expect(fragment).toContain("max-w-6xl mx-auto px-6 lg:px-8");
    expect(fragment).toContain("Design Tokens (MUST USE");

    // Now inject into the prompt
    const prompt = buildCodeComponentPrompt(baseBrief, undefined, fragment);
    expect(prompt).toContain("DESIGN RULES");
    expect(prompt).toContain("rounded-2xl");
    // Should appear before GENERATE NOW
    expect(prompt.indexOf("DESIGN RULES")).toBeLessThan(prompt.indexOf("GENERATE NOW"));
  });

  it("portfolio tokens override global typography in prompt", () => {
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Portfolio",
      audience: "clients",
      tone: "confident",
    });

    expect(result).not.toBeNull();
    const { fragment } = result!;

    // Portfolio overrides
    expect(fragment).toContain("rounded-none");
    expect(fragment).toContain("text-5xl");
    // Global tokens still present where not overridden
    expect(fragment).toContain("max-w-6xl mx-auto px-6 lg:px-8");
  });

  it("returns null when feature flag is disabled", () => {
    vi.stubEnv("ENABLE_DESIGN_RULES", "false");

    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Healthcare",
    });

    expect(result).toBeNull();
  });

  it("returns null for design_system mode", () => {
    const result = getDesignRules({
      generationMode: "design_system",
      industry: "Healthcare",
    });

    expect(result).toBeNull();
  });

  it("global tokens present for unknown industries", () => {
    const result = getDesignRules({
      generationMode: "code_components",
      industry: "Quantum Computing",
    });

    expect(result).not.toBeNull();
    const { fragment } = result!;
    expect(fragment).toContain("max-w-6xl mx-auto px-6 lg:px-8");
    expect(fragment).toContain("Background alternation");
  });
});
