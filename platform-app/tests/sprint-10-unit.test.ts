import { describe, it, expect } from "vitest";

// =============================================================================
// TASK-200: Industry Questions Configuration
// =============================================================================

describe("TASK-200: Industry Questions Configuration", () => {
  it("getQuestionsForIndustry returns healthcare questions with correct structure", async () => {
    const { getQuestionsForIndustry } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const qs = getQuestionsForIndustry("healthcare");
    expect(qs.length).toBeGreaterThanOrEqual(2);
    expect(qs.length).toBeLessThanOrEqual(4);

    for (const q of qs) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(["text", "select", "multi-select"]).toContain(q.inputType);
      if (q.inputType === "select" || q.inputType === "multi-select") {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(0);
      }
    }

    // Healthcare-specific questions
    expect(qs.some((q) => q.text.toLowerCase().includes("specialt"))).toBe(true);
    expect(qs.some((q) => q.text.toLowerCase().includes("insurance"))).toBe(true);
  });

  it("getQuestionsForIndustry returns legal questions", async () => {
    const { getQuestionsForIndustry } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const qs = getQuestionsForIndustry("legal");
    expect(qs.length).toBeGreaterThanOrEqual(2);
    expect(qs.some((q) => q.text.toLowerCase().includes("practice area"))).toBe(true);
    expect(qs.some((q) => q.text.toLowerCase().includes("consultation"))).toBe(true);
  });

  it("getQuestionsForIndustry returns restaurant questions", async () => {
    const { getQuestionsForIndustry } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const qs = getQuestionsForIndustry("restaurant");
    expect(qs.length).toBeGreaterThanOrEqual(2);
    expect(qs.some((q) => q.text.toLowerCase().includes("cuisine"))).toBe(true);
  });

  it("falls back to _default for unknown industries", async () => {
    const { getQuestionsForIndustry, INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const unknownQs = getQuestionsForIndustry("underwater_basket_weaving");
    expect(unknownQs).toEqual(INDUSTRY_QUESTIONS._default);
    expect(unknownQs.length).toBeGreaterThanOrEqual(2);
  });

  it("covers at least 8 industries plus _default", async () => {
    const { INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const keys = Object.keys(INDUSTRY_QUESTIONS);
    expect(keys.length).toBeGreaterThanOrEqual(9);
    expect(keys).toContain("_default");
    expect(keys).toContain("healthcare");
    expect(keys).toContain("legal");
    expect(keys).toContain("restaurant");
    expect(keys).toContain("real_estate");
    expect(keys).toContain("professional_services");
    expect(keys).toContain("education");
    expect(keys).toContain("ecommerce");
    expect(keys).toContain("nonprofit");
  });

  it("all questions have appropriate input types and placeholders", async () => {
    const { INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    for (const [industry, questions] of Object.entries(INDUSTRY_QUESTIONS)) {
      for (const q of questions) {
        expect(q.id, `${industry}.${q.id}`).toBeTruthy();
        expect(q.text, `${industry}.${q.id}`).toBeTruthy();
        expect(["text", "select", "multi-select"]).toContain(q.inputType);

        if (q.inputType === "text") {
          expect(q.placeholder, `${industry}.${q.id} missing placeholder`).toBeTruthy();
        }
        if (q.inputType === "select" || q.inputType === "multi-select") {
          expect(
            q.options?.length,
            `${industry}.${q.id} missing options`
          ).toBeGreaterThan(1);
        }
      }
    }
  });

  it("each industry has 2-4 questions", async () => {
    const { INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    for (const [industry, questions] of Object.entries(INDUSTRY_QUESTIONS)) {
      expect(
        questions.length,
        `${industry} has ${questions.length} questions`
      ).toBeGreaterThanOrEqual(2);
      expect(
        questions.length,
        `${industry} has ${questions.length} questions`
      ).toBeLessThanOrEqual(4);
    }
  });
});

// =============================================================================
// TASK-202: Tone Samples Configuration
// =============================================================================

describe("TASK-202: Tone Samples Configuration", () => {
  it("exports 4 tone samples", async () => {
    const { TONE_SAMPLES } = await import("../src/lib/onboarding/tone-samples");

    expect(TONE_SAMPLES).toHaveLength(4);

    for (const tone of TONE_SAMPLES) {
      expect(tone.id).toBeTruthy();
      expect(tone.name).toBeTruthy();
      expect(tone.description).toBeTruthy();
      expect(tone.sample.length).toBeGreaterThan(50);
    }
  });

  it("tone IDs are unique", async () => {
    const { TONE_SAMPLES } = await import("../src/lib/onboarding/tone-samples");

    const ids = TONE_SAMPLES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getDifferentiatorPlaceholder returns industry-specific placeholders", async () => {
    const { getDifferentiatorPlaceholder } = await import(
      "../src/lib/onboarding/tone-samples"
    );

    const healthcarePlaceholder = getDifferentiatorPlaceholder("healthcare");
    expect(healthcarePlaceholder).toContain("same-day appointments");

    const legalPlaceholder = getDifferentiatorPlaceholder("legal");
    expect(legalPlaceholder).toContain("trial experience");

    // Unknown industry falls back to _default
    const unknownPlaceholder = getDifferentiatorPlaceholder("xyz");
    expect(unknownPlaceholder).toContain("different from competitors");
  });
});

// =============================================================================
// TASK-203: Enhanced Page Suggestions — Prompt & Defaults
// =============================================================================

describe("TASK-203: Enhanced Page Suggestions", () => {
  it("SUGGEST_PAGES_PROMPT requests description field", async () => {
    const { SUGGEST_PAGES_PROMPT } = await import("../src/lib/ai/prompts");
    expect(SUGGEST_PAGES_PROMPT).toContain('"description"');
    expect(SUGGEST_PAGES_PROMPT).toContain("One sentence explaining");
  });

  it("all default pages include descriptions", async () => {
    const { INDUSTRY_DEFAULT_PAGES } = await import("../src/lib/ai/prompts");

    for (const [industry, pages] of Object.entries(INDUSTRY_DEFAULT_PAGES)) {
      for (const p of pages) {
        expect(p.slug, `${industry} page missing slug`).toBeTruthy();
        expect(p.title, `${industry} page missing title`).toBeTruthy();
        expect(
          p.description,
          `${industry}.${p.slug} missing description`
        ).toBeTruthy();
        expect(
          p.description.length,
          `${industry}.${p.slug} description too short`
        ).toBeGreaterThan(10);
      }
    }
  });

  it("getDefaultPages returns correct industry pages", async () => {
    const { getDefaultPages } = await import("../src/lib/ai/prompts");

    const healthcare = getDefaultPages("healthcare");
    expect(healthcare.length).toBeGreaterThanOrEqual(5);
    expect(healthcare.some((p) => p.slug === "home")).toBe(true);
    expect(healthcare.some((p) => p.slug === "contact")).toBe(true);
    expect(healthcare.every((p) => p.description)).toBe(true);
  });

  it("getDefaultPages falls back to 'other' for unknown industry", async () => {
    const { getDefaultPages, INDUSTRY_DEFAULT_PAGES } = await import(
      "../src/lib/ai/prompts"
    );

    const unknown = getDefaultPages("unicorn_farming");
    expect(unknown).toEqual(INDUSTRY_DEFAULT_PAGES.other);
  });
});

// =============================================================================
// Onboarding Steps Navigation
// =============================================================================

describe("Onboarding Steps: Updated Navigation", () => {
  it("includes follow-up, tone, and review-settings in step list", async () => {
    const { ONBOARDING_STEPS } = await import("../src/lib/onboarding-steps");
    expect(ONBOARDING_STEPS).toHaveLength(11);

    const slugs = ONBOARDING_STEPS.map((s) => s.slug);
    expect(slugs).toContain("follow-up");
    expect(slugs).toContain("tone");
    expect(slugs).toContain("review-settings");
  });

  it("follow-up is step index 8, tone is step index 9, review-settings is step index 10", async () => {
    const { getStepIndex } = await import("../src/lib/onboarding-steps");
    expect(getStepIndex("follow-up")).toBe(8);
    expect(getStepIndex("tone")).toBe(9);
    expect(getStepIndex("review-settings")).toBe(10);
  });

  it("navigation chain: fonts → follow-up → tone → review-settings → null", async () => {
    const { getNextStep, getPrevStep } = await import(
      "../src/lib/onboarding-steps"
    );

    expect(getNextStep("fonts")).toBe("follow-up");
    expect(getNextStep("follow-up")).toBe("tone");
    expect(getNextStep("tone")).toBe("review-settings");
    expect(getNextStep("review-settings")).toBeNull();

    expect(getPrevStep("follow-up")).toBe("fonts");
    expect(getPrevStep("tone")).toBe("follow-up");
    expect(getPrevStep("review-settings")).toBe("tone");
  });
});
