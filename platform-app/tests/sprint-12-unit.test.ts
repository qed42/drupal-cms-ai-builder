import { describe, it, expect } from "vitest";

// =============================================================================
// TASK-217: Per-Page Content Generation — Prompt Builder
// =============================================================================

describe("TASK-217: Page Generation Prompt Builder", () => {
  it("builds per-page prompt with research brief and plan context", async () => {
    const { buildPageGenerationPrompt } = await import(
      "../src/lib/ai/prompts/page-generation"
    );

    const prompt = buildPageGenerationPrompt(
      {
        slug: "services",
        title: "Our Services",
        purpose: "Showcase dental services offered",
        targetKeywords: ["dental services", "cosmetic dentistry"],
        sections: [
          {
            heading: "Welcome to Our Services",
            type: "hero",
            contentBrief: "Hero banner introducing the services page",
            componentSuggestion: "",
            estimatedWordCount: 40,
          },
          {
            heading: "What We Offer",
            type: "features",
            contentBrief: "Detailed descriptions of dental services",
            estimatedWordCount: 250,
            componentSuggestion: "space-text-media-default",
          },
        ],
      },
      {
        name: "Green Valley Dental",
        industry: "healthcare",
        differentiators: "Same-day crowns",
      },
      {
        industry: "healthcare",
        targetAudience: {
          primary: "Suburban families",
          demographics: ["ages 25-55"],
          painPoints: ["fear of dentist"],
        },
        competitors: [],
        keyMessages: ["Gentle care", "Modern technology"],
        toneGuidance: {
          primary: "Warm and professional",
          avoid: ["clinical jargon"],
          examples: ["We make visits comfortable."],
        },
        seoKeywords: ["family dentist"],
        complianceNotes: ["HIPAA"],
      },
      {
        siteName: "Green Valley Dental",
        tagline: "Your family's smile starts here",
        pages: [],
        globalContent: {
          services: [
            { title: "General Dentistry", briefDescription: "Cleanings and checkups" },
            { title: "Cosmetic Dentistry", briefDescription: "Whitening and veneers" },
        ],
        teamMembers: [],
        testimonials: [
          ],
        },
      }
    );

    // Site context
    expect(prompt).toContain("Green Valley Dental");
    expect(prompt).toContain("healthcare");
    expect(prompt).toContain("Warm and professional");
    expect(prompt).toContain("Same-day crowns");

    // Page-specific
    expect(prompt).toContain("Our Services");
    expect(prompt).toContain("/services");
    expect(prompt).toContain("dental services");
    expect(prompt).toContain("cosmetic dentistry");

    // Section details with word counts
    expect(prompt).toContain("Welcome to Our Services");
    expect(prompt).toContain("~40 words");
    expect(prompt).toContain("~250 words");

    // Component mapping instructions
    expect(prompt).toContain("space_ds:space-hero-banner-style-01");
    expect(prompt).toContain("component_id");

    // Global content context
    expect(prompt).toContain("General Dentistry");
    expect(prompt).toContain("Cosmetic Dentistry");

    // Quality guidelines
    expect(prompt).toContain("not lorem ipsum");
    expect(prompt).toContain("CTAs must be specific");
  });

  it("handles page with no estimatedWordCount gracefully", async () => {
    const { buildPageGenerationPrompt } = await import(
      "../src/lib/ai/prompts/page-generation"
    );

    const prompt = buildPageGenerationPrompt(
      {
        slug: "contact",
        title: "Contact",
        purpose: "Contact page",
        targetKeywords: ["contact"],
        sections: [
          {
            heading: "Get in Touch",
            type: "hero",
            contentBrief: "Contact hero",
            estimatedWordCount: 40,
            componentSuggestion: "",
          },
        ],
      },
      { name: "Test" },
      {
        industry: "other",
        targetAudience: { primary: "General", demographics: [], painPoints: [] },
        competitors: [],
        keyMessages: ["Quality"],
        toneGuidance: { primary: "Friendly", avoid: [], examples: [] },
         seoKeywords: ["test"],
        complianceNotes: [],
      },
      {
        siteName: "Test",
        tagline: "Test tagline",
        pages: [],
        globalContent: { services: [], teamMembers: [], testimonials: [] },
      }
    );

    expect(prompt).toContain("Get in Touch");
    expect(prompt).not.toContain("~undefined words");
  });
});

// =============================================================================
// TASK-217: Generate Phase Structure
// =============================================================================

describe("TASK-217: Generate Phase Module", () => {
  it("generate phase module exists with expected exports", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../src/lib/pipeline/phases/generate.ts");
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("runGeneratePhase");
    expect(content).toContain("GeneratePhaseResult");
    expect(content).toContain("GenerateProgressCallback");
    expect(content).toContain("buildComponentTree");
    expect(content).toContain("BlueprintBundle");
  });
});

// =============================================================================
// TASK-218b: Extended Orchestrator
// =============================================================================

describe("TASK-218b: Extended Orchestrator", () => {
  it("orchestrator includes generate phase", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../src/lib/pipeline/orchestrator.ts");
    const content = fs.readFileSync(filePath, "utf-8");

    // Phase types include generate
    expect(content).toContain('"generate"');
    expect(content).toContain('"generate_complete"');
    expect(content).toContain('"generate_failed"');

    // Calls generate phase
    expect(content).toContain("runGeneratePhase");

    // Transitions to review status
    expect(content).toContain('"review"');

    // Accepts blueprintId parameter
    expect(content).toContain("blueprintId: string");
  });

  it("generate-blueprint route uses full pipeline without v1 fallback", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../src/app/api/provision/generate-blueprint/route.ts"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    // Uses runPipeline directly
    expect(content).toContain("runPipeline(site.id, blueprint.id");

    // Does NOT have v1 fallback wrapper
    expect(content).not.toContain("runV2Pipeline");

    // Still has v1 toggle
    expect(content).toContain("USE_V2_PIPELINE");
    expect(content).toContain("generateBlueprint");

    // Resets pipeline state on re-generation
    expect(content).toContain("pipelinePhase: null");
    expect(content).toContain("pipelineError: null");
  });
});

// =============================================================================
// TASK-219a update: Status API handles generate phase
// =============================================================================

describe("TASK-219a update: Status API Generate Phase", () => {
  it("status route handles per-page generate progress", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../src/app/api/provision/status/route.ts"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain("buildGeneratePhaseStatus");
    expect(content).toContain('generate:');
    expect(content).toContain("generate_complete");
    expect(content).toContain("generate_failed");
    expect(content).toContain("All pages generated");
  });
});

// =============================================================================
// TASK-220: Pipeline Progress UI Component
// =============================================================================

describe("TASK-220: Pipeline Progress UI", () => {
  it("PipelineProgress component exists with expected structure", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../src/components/onboarding/PipelineProgress.tsx"
    );
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, "utf-8");

    // Phase keys present in the component
    expect(content).toContain("research");
    expect(content).toContain("plan");
    expect(content).toContain("generate");

    // Status indicators
    expect(content).toContain("complete");
    expect(content).toContain("in_progress");
    expect(content).toContain("failed");
    expect(content).toContain("pending");

    // Accessibility
    expect(content).toContain("aria-live");
    expect(content).toContain("sr-only");

    // Expandable summaries
    expect(content).toContain("expanded");
    expect(content).toContain("Details");

    // Duration formatting
    expect(content).toContain("formatDuration");
  });

  it("progress page uses PipelineProgress component", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      __dirname,
      "../src/app/onboarding/progress/page.tsx"
    );
    const content = fs.readFileSync(filePath, "utf-8");

    // Uses new component
    expect(content).toContain("PipelineProgress");
    expect(content).not.toContain("GenerationProgress");

    // Polls every 2 seconds
    expect(content).toContain("2000");

    // Handles pipeline data
    expect(content).toContain("pipeline");
    expect(content).toContain("setPipeline");

    // Handles review status
    expect(content).toContain('"review"');
  });
});
