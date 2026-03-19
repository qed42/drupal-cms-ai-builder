import { describe, it, expect } from "vitest";

// =============================================================================
// TASK-215: Research Phase — Prompt Builder
// =============================================================================

describe("TASK-215: Research Prompt Builder", () => {
  it("builds prompt with all onboarding data fields", async () => {
    const { buildResearchPrompt } = await import(
      "../src/lib/ai/prompts/research"
    );

    const prompt = buildResearchPrompt({
      name: "Green Valley Dental",
      idea: "Family dental practice with cosmetic services",
      audience: "Families in suburban areas",
      industry: "healthcare",
      tone: "professional_warm",
      differentiators: "Same-day crowns, sedation dentistry",
      followUpAnswers: {
        "What specialties do you offer?": "General, cosmetic, pediatric",
        "Do you accept insurance?": "Yes, most major plans",
      },
      pages: [
        { slug: "home", title: "Home", description: "Main landing page" },
        { slug: "services", title: "Services" },
      ],
      referenceUrls: ["https://example-dental.com"],
      existingCopy: "Your smile is our priority.",
      compliance_flags: ["hipaa"],
    });

    // Core business info
    expect(prompt).toContain("Green Valley Dental");
    expect(prompt).toContain("Family dental practice");
    expect(prompt).toContain("healthcare");
    expect(prompt).toContain("professional_warm");

    // v2 enrichment fields
    expect(prompt).toContain("Same-day crowns");
    expect(prompt).toContain("General, cosmetic, pediatric");
    expect(prompt).toContain("https://example-dental.com");
    expect(prompt).toContain("Your smile is our priority");
    expect(prompt).toContain("hipaa");

    // Pages
    expect(prompt).toContain("/home");
    expect(prompt).toContain("/services");

    // JSON schema instructions
    expect(prompt).toContain("targetAudience");
    expect(prompt).toContain("seoKeywords");
    expect(prompt).toContain("complianceNotes");
  });

  it("includes pre-analyzed keywords in prompt (BUG-311 fix)", async () => {
    const { buildResearchPrompt } = await import(
      "../src/lib/ai/prompts/research"
    );

    const prompt = buildResearchPrompt({
      name: "Test",
      idea: "Test biz",
      keywords: ["dental care", "family dentist", "cosmetic dentistry"],
    });

    expect(prompt).toContain("Pre-analyzed Keywords");
    expect(prompt).toContain("dental care");
    expect(prompt).toContain("family dentist");
  });

  it("handles minimal onboarding data gracefully", async () => {
    const { buildResearchPrompt } = await import(
      "../src/lib/ai/prompts/research"
    );

    const prompt = buildResearchPrompt({
      name: "My Site",
      idea: "A test business",
    });

    expect(prompt).toContain("My Site");
    expect(prompt).toContain("A test business");
    // Should NOT contain optional sections when data is missing
    expect(prompt).not.toContain("## Reference Websites");
    expect(prompt).not.toContain("## Existing Brand Copy");
    expect(prompt).not.toContain("## Industry-Specific Details");
  });
});

// =============================================================================
// TASK-216: Plan Phase — Prompt Builder
// =============================================================================

describe("TASK-216: Plan Prompt Builder", () => {
  it("builds plan prompt from research brief and onboarding data", async () => {
    const { buildPlanPrompt } = await import("../src/lib/ai/prompts/plan");

    const prompt = buildPlanPrompt(
      {
        name: "Green Valley Dental",
        industry: "healthcare",
        differentiators: "Same-day crowns",
        pages: [
          { slug: "home", title: "Home" },
          { slug: "services", title: "Services" },
          { slug: "contact", title: "Contact" },
        ],
      },
      {
        industry: "healthcare",
        targetAudience: {
          primary: "Suburban families",
          demographics: ["ages 25-55"],
          painPoints: ["fear of dentist", "high costs"],
        },
        competitors: [
          {
            name: "SmileCare",
            strengths: ["modern office"],
            weaknesses: ["long wait times"],
          },
        ],
        keyMessages: [
          "Gentle, patient-centered care",
          "State-of-the-art technology",
        ],
        toneGuidance: {
          primary: "Warm and professional",
          avoid: ["clinical jargon"],
          examples: ["We make dental visits comfortable."],
        },
        seoKeywords: ["family dentist", "cosmetic dentistry"],
        complianceNotes: ["HIPAA patient data handling"],
      }
    );

    // Uses research brief data
    expect(prompt).toContain("Suburban families");
    expect(prompt).toContain("fear of dentist");
    expect(prompt).toContain("Warm and professional");
    expect(prompt).toContain("family dentist");
    expect(prompt).toContain("HIPAA patient data handling");

    // Uses onboarding data
    expect(prompt).toContain("Green Valley Dental");
    expect(prompt).toContain("Same-day crowns");

    // Pages to plan
    expect(prompt).toContain("/home");
    expect(prompt).toContain("/services");
    expect(prompt).toContain("/contact");

    // JSON schema instructions
    expect(prompt).toContain("siteName");
    expect(prompt).toContain("tagline");
    expect(prompt).toContain("targetKeywords");
    expect(prompt).toContain("contentBrief");
    expect(prompt).toContain("globalContent");
  });

  it("provides default pages when none specified", async () => {
    const { buildPlanPrompt } = await import("../src/lib/ai/prompts/plan");

    const prompt = buildPlanPrompt(
      { name: "Test" },
      {
        industry: "other",
        targetAudience: {
          primary: "General",
          demographics: [],
          painPoints: [],
        },
        competitors: [],
        keyMessages: ["Quality service"],
        toneGuidance: { primary: "Friendly", avoid: [], examples: [] },
        seoKeywords: ["test"],
        complianceNotes: [],
      }
    );

    // Should fall back to default pages
    expect(prompt).toContain("/home");
    expect(prompt).toContain("About Us");
    expect(prompt).toContain("/contact");
  });
});

// =============================================================================
// TASK-215/216: Pipeline Schemas
// =============================================================================

describe("Pipeline Schemas", () => {
  it("ResearchBriefSchema validates a valid brief", async () => {
    const { ResearchBriefSchema } = await import(
      "../src/lib/pipeline/schemas"
    );

    const valid = {
      industry: "healthcare",
      targetAudience: {
        primary: "Families",
        demographics: ["ages 25-55"],
        painPoints: ["cost", "fear"],
      },
      competitors: [
        {
          name: "Rival",
          strengths: ["brand recognition"],
          weaknesses: ["limited hours"],
        },
      ],
      keyMessages: ["We care about your health"],
      toneGuidance: {
        primary: "Warm",
        avoid: ["jargon"],
        examples: ["We're here for you."],
      },
      seoKeywords: ["dentist", "dental care"],
      complianceNotes: ["HIPAA"],
    };

    expect(() => ResearchBriefSchema.parse(valid)).not.toThrow();
  });

  it("ResearchBriefSchema rejects invalid brief", async () => {
    const { ResearchBriefSchema } = await import(
      "../src/lib/pipeline/schemas"
    );

    expect(() => ResearchBriefSchema.parse({ industry: 123 })).toThrow();
  });

  it("ContentPlanSchema validates a valid plan", async () => {
    const { ContentPlanSchema } = await import("../src/lib/pipeline/schemas");

    const valid = {
      siteName: "Test Site",
      tagline: "Your trusted partner",
      pages: [
        {
          slug: "home",
          title: "Home",
          purpose: "Main landing page",
          targetKeywords: ["test", "business"],
          sections: [
            {
              heading: "Welcome",
              type: "hero",
              contentBrief: "Hero banner with tagline",
              estimatedWordCount: 50,
              componentSuggestion: "space-hero-banner-style-01",
            },
          ],
        },
      ],
      globalContent: {
        services: [
          { title: "Service A", briefDescription: "Description of A" },
        ],
        teamMembers: [],
        testimonials: [],
      },
    };

    expect(() => ContentPlanSchema.parse(valid)).not.toThrow();
  });

  it("ContentPlanSchema requires teamMembers and testimonials as arrays", async () => {
    const { ContentPlanSchema } = await import("../src/lib/pipeline/schemas");

    const minimal = {
      siteName: "Test",
      tagline: "Tagline",
      pages: [],
      globalContent: {
        services: [],
        teamMembers: [],
        testimonials: [],
      },
    };

    expect(() => ContentPlanSchema.parse(minimal)).not.toThrow();
  });

  it("ContentPlanPageSchema accepts estimatedWordCount per section (BUG-310 fix)", async () => {
    const { ContentPlanPageSchema } = await import("../src/lib/pipeline/schemas");

    const page = {
      slug: "home",
      title: "Home",
      purpose: "Landing page",
      targetKeywords: ["test"],
      sections: [
        {
          heading: "Hero",
          type: "hero",
          contentBrief: "Main hero banner",
          estimatedWordCount: 50,
          componentSuggestion: "",
        },
        {
          heading: "Services",
          type: "features",
          contentBrief: "Service cards",
          estimatedWordCount: 200,
          componentSuggestion: "space-text-media",
        },
        {
          heading: "CTA",
          type: "cta",
          contentBrief: "Call to action",
          estimatedWordCount: 30,
          componentSuggestion: "",
        },
      ],
    };

    const parsed = ContentPlanPageSchema.parse(page);
    expect(parsed.sections[0].estimatedWordCount).toBe(50);
    expect(parsed.sections[1].estimatedWordCount).toBe(200);
    expect(parsed.sections[2].estimatedWordCount).toBe(30);
  });

  it("plan prompt includes estimatedWordCount instruction (BUG-310 fix)", async () => {
    const { buildPlanPrompt } = await import("../src/lib/ai/prompts/plan");

    const prompt = buildPlanPrompt(
      { name: "Test" },
      {
        industry: "other",
        targetAudience: { primary: "General", demographics: [], painPoints: [] },
        competitors: [],
        keyMessages: ["Quality"],
        toneGuidance: { primary: "Friendly", avoid: [], examples: [] },
        seoKeywords: ["test"],
        complianceNotes: [],
      }
    );

    expect(prompt).toContain("estimatedWordCount");
    expect(prompt).toContain("hero: 30-50");
  });
});

// =============================================================================
// TASK-218a: Pipeline Orchestrator — file structure
// =============================================================================

describe("TASK-218a: Pipeline Orchestrator", () => {
  it("orchestrator module file exists and is importable structure", async () => {
    // The orchestrator imports @/lib/prisma which requires Next.js path resolution.
    // We verify the file exists and the research/plan phases it depends on are correct.
    const fs = await import("fs");
    const path = await import("path");
    const orchestratorPath = path.resolve(
      __dirname,
      "../src/lib/pipeline/orchestrator.ts"
    );
    expect(fs.existsSync(orchestratorPath)).toBe(true);

    const content = fs.readFileSync(orchestratorPath, "utf-8");
    expect(content).toContain("runPipeline");
    expect(content).toContain("runResearchPhase");
    expect(content).toContain("runPlanPhase");
    expect(content).toContain("pipelinePhase");
    expect(content).toContain("pipelineError");
  });
});

// =============================================================================
// TASK-219a: Status API — structure verification
// =============================================================================

describe("TASK-219a: Pipeline Status API", () => {
  it("status route includes pipeline phase handling", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const statusPath = path.resolve(
      __dirname,
      "../src/app/api/provision/status/route.ts"
    );
    expect(fs.existsSync(statusPath)).toBe(true);

    const content = fs.readFileSync(statusPath, "utf-8");
    expect(content).toContain("PIPELINE_PHASE_PROGRESS");
    expect(content).toContain("buildPipelineStatus");
    expect(content).toContain("researchBrief");
    expect(content).toContain("contentPlan");
    expect(content).toContain("summarizeResearchBrief");
    expect(content).toContain("summarizeContentPlan");
    expect(content).toContain('"pending"');
  });

  it("generate-blueprint route includes v2 pipeline integration", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const routePath = path.resolve(
      __dirname,
      "../src/app/api/provision/generate-blueprint/route.ts"
    );
    expect(fs.existsSync(routePath)).toBe(true);

    const content = fs.readFileSync(routePath, "utf-8");
    expect(content).toContain("USE_V2_PIPELINE");
    expect(content).toContain("runPipeline");
    expect(content).toContain("CONTENT_PIPELINE_V2");
  });
});
