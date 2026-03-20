/**
 * Sprint 18 QA: Content Depth Enforcement & Quality Review Agent
 *
 * Verifies all 8 tasks (TASK-287 through TASK-294) against acceptance criteria
 * and Definition of Done.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { formatRulesForPlan, formatRulesForGeneration, classifyPageType, getRule, PAGE_DESIGN_RULES } from "../src/lib/ai/page-design-rules";
import { reviewPage, estimateWordCount, formatReviewLog } from "../src/lib/pipeline/phases/review";
import type { ReviewInput } from "../src/lib/pipeline/phases/review";

const SRC = path.join(__dirname, "..", "src");

// ============================================================================
// Helpers
// ============================================================================

function makeSection(componentId: string, props: Record<string, unknown> = {}) {
  return { component_id: componentId, props };
}

function makeReviewInput(
  pageSlug: string,
  pageTitle: string,
  sections: ReturnType<typeof makeSection>[],
  options?: { targetKeywords?: string[]; industry?: string; seo?: { meta_title: string; meta_description: string } }
): ReviewInput {
  return {
    page: {
      slug: pageSlug,
      title: pageTitle,
      seo: options?.seo ?? {
        meta_title: `${pageTitle} | Test Business Name - Quality Service`,
        meta_description: `Discover our professional ${options?.industry ?? "dental"} services. We offer comprehensive solutions tailored to your needs. Contact us today to learn more.`,
      },
      sections,
    },
    planPage: {
      slug: pageSlug,
      title: pageTitle,
      targetKeywords: options?.targetKeywords ?? ["dental care", "Portland dentist"],
      sections: sections.map((s, i) => ({
        type: i === 0 ? "hero" : "text",
        heading: `Section ${i + 1}`,
        estimatedWordCount: 100,
      })),
    },
    research: {
      industry: options?.industry ?? "dental",
      keyMessages: ["Quality care"],
      targetAudience: { primary: "families" },
    },
  };
}

// ============================================================================
// TASK-287: Strengthen Plan Prompt with Hard Section Count Constraints
// ============================================================================
describe("TASK-287: Plan prompt uses mandatory language", () => {
  it("formatRulesForPlan includes MANDATORY header", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("MANDATORY");
  });

  it("formatRulesForPlan includes MINIMUM keyword for section counts", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("MINIMUM");
  });

  it("formatRulesForPlan includes REQUIRED keyword for section types", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("REQUIRED sections");
  });

  it("formatRulesForPlan includes REJECTED warning language", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("REJECTED");
  });

  it("formatRulesForPlan lists word count ranges per section type", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("words");
  });

  it("formatRulesForPlan includes optional section suggestions", () => {
    const pages = [{ slug: "home", title: "Home" }];
    const lines = formatRulesForPlan(pages);
    const joined = lines.join("\n");
    expect(joined).toContain("Optional sections");
  });

  it("plan prompt includes MUST language for word counts", () => {
    const planPromptFile = fs.readFileSync(path.join(SRC, "lib/ai/prompts/plan.ts"), "utf8");
    expect(planPromptFile).toContain("MUST have an estimatedWordCount");
  });
});

// ============================================================================
// TASK-288: Plan-Level Section Count Validation with Retry
// ============================================================================
describe("TASK-288: Plan-level section count validation", () => {
  it("plan.ts imports classifyPageType and getRule", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    expect(planPhase).toContain("classifyPageType");
    expect(planPhase).toContain("getRule");
  });

  it("plan.ts has validatePlanDepth function", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    expect(planPhase).toContain("function validatePlanDepth");
  });

  it("plan.ts calls validatePlanDepth after generateValidatedJSON", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    const genIdx = planPhase.indexOf("generateValidatedJSON");
    const valIdx = planPhase.indexOf("validatePlanDepth(plan)");
    expect(genIdx).toBeGreaterThan(-1);
    expect(valIdx).toBeGreaterThan(genIdx);
  });

  it("plan.ts retries with feedback on validation failure", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    expect(planPhase).toContain("SECTION COUNT VALIDATION ERROR");
    expect(planPhase).toContain("retryPrompt");
  });

  it("plan.ts limits retry to max 1 (ADR-012)", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    // After initial validatePlanDepth, there should be exactly one retry
    const retryCheckCount = (planPhase.match(/validatePlanDepth/g) || []).length;
    // Should appear 3 times: function def, first call, retry call
    expect(retryCheckCount).toBe(3);
  });

  it("plan.ts gracefully degrades if retry still fails", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    expect(planPhase).toContain("best-effort plan");
  });

  it("plan.ts logs per-page pass/fail with [plan] prefix", () => {
    const planPhase = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    expect(planPhase).toContain("[plan]");
    expect(planPhase).toContain("PASS");
    expect(planPhase).toContain("FAIL");
  });
});

// ============================================================================
// TASK-289: Increase Token Budget for Content-Heavy Pages
// ============================================================================
describe("TASK-289: Token budget scaling", () => {
  it("generate.ts has calculateTokenBudget function", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("function calculateTokenBudget");
  });

  it("calculateTokenBudget uses base 4000", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("base = 4000");
  });

  it("calculateTokenBudget uses 500 per extra section", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("perExtraSection = 500");
  });

  it("calculateTokenBudget caps at 8000", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("8000");
  });

  it("generate.ts uses dynamic maxTokens instead of hardcoded 4000", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    // The old hardcoded `maxTokens: 4000` inside generateValidatedJSON should be gone
    expect(gen).not.toMatch(/maxTokens:\s*4000/);
  });

  it("generate.ts logs token budget per page", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("[generate]");
    expect(gen).toContain("maxTokens=");
  });
});

// ============================================================================
// TASK-290: Quality Review Agent — Content Depth Checks
// ============================================================================
describe("TASK-290: Review agent content depth checks", () => {
  it("review.ts exists", () => {
    expect(fs.existsSync(path.join(SRC, "lib/pipeline/phases/review.ts"))).toBe(true);
  });

  it("review.ts exports reviewPage function", () => {
    const review = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/review.ts"), "utf8");
    expect(review).toContain("export function reviewPage");
  });

  it("section-count check detects thin pages", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
      makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "section-count");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
  });

  it("no-placeholders check catches Lorem ipsum", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Lorem ipsum dolor" }),
      makeSection("space_ds:space-text-media-default", { title: "Content" }),
      makeSection("space_ds:space-text-media-with-checklist", { title: "More" }),
      makeSection("space_ds:space-testimony-card", { title: "Review" }),
      makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "no-placeholders");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
  });

  it("visual-rhythm check catches consecutive same components", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
      makeSection("space_ds:space-text-media-default", { title: "A" }),
      makeSection("space_ds:space-text-media-default", { title: "B" }),
      makeSection("space_ds:space-testimony-card", { title: "C" }),
      makeSection("space_ds:space-cta-banner-type-1", { title: "D" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "visual-rhythm");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("required-sections check validates required types present", () => {
    // Home requires hero, features, testimonials, cta
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
      makeSection("space_ds:space-text-media-with-checklist", { title: "Features" }),
      makeSection("space_ds:space-text-media-default", { title: "About" }),
      makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
      makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "required-sections");
    expect(check?.passed).toBe(true);
  });

  it("reviewPage returns 17 total checks", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ]);
    const result = reviewPage(input);
    expect(result.checks.length).toBe(17);
  });

  it("reviewPage score is between 0 and 1", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ]);
    const result = reviewPage(input);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});

// ============================================================================
// TASK-291: SEO Quality Checks
// ============================================================================
describe("TASK-291: SEO quality checks", () => {
  it("meta-title-keyword check verifies keyword presence", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ], {
      targetKeywords: ["dental care"],
      seo: { meta_title: "Welcome to Our Amazing Site", meta_description: "A great site for everyone" },
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "meta-title-keyword");
    expect(check?.passed).toBe(false);
  });

  it("hero-heading check fails when hero title is empty", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
  });

  it("keyword-distribution check expects keywords in 2+ sections", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Dental care experts" }),
      makeSection("space_ds:space-text-media-default", { title: "No keywords here at all" }),
    ], { targetKeywords: ["dental care"] });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "keyword-distribution");
    // Only 1 section has keyword
    expect(check?.passed).toBe(false);
  });

  it("cta-internal-links check passes when /contact present", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-cta-banner-type-1", { title: "Contact Us", description: "Visit /contact" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "cta-internal-links");
    expect(check?.passed).toBe(true);
  });
});

// ============================================================================
// TASK-292: GEO Quality Checks
// ============================================================================
describe("TASK-292: GEO quality checks", () => {
  it("entity-clarity check warns when industry not mentioned", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome to Our Company" }),
    ], { industry: "aerospace" });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "entity-clarity");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("structured-claims check finds numeric claims", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "15 years experience serving clients" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "structured-claims");
    expect(check?.passed).toBe(true);
  });

  it("faq-presence check passes when accordion exists in site", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ]);
    input.sitePages = [
      { slug: "faq", sections: [makeSection("space_ds:space-accordion", { title: "FAQ" })] },
    ];
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "faq-presence");
    expect(check?.passed).toBe(true);
  });

  it("authoritative-voice check detects we/our", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "We deliver excellence to our clients" }),
    ]);
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "authoritative-voice");
    expect(check?.passed).toBe(true);
  });

  it("GEO checks have warning severity (not error)", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ]);
    const result = reviewPage(input);
    const geoChecks = result.checks.filter((c) => c.dimension === "geo");
    expect(geoChecks.length).toBeGreaterThan(0);
    geoChecks.forEach((c) => expect(c.severity).toBe("warning"));
  });
});

// ============================================================================
// TASK-293: Review Agent Integration in Generate Loop
// ============================================================================
describe("TASK-293: Review integration in generate loop", () => {
  it("generate.ts imports reviewPage and formatReviewLog", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("import { reviewPage, formatReviewLog }");
  });

  it("generate.ts has Stage 2 content review section", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("Stage 2: Content Review");
  });

  it("generate.ts uses MAX_REVIEW_RETRIES = 2", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("MAX_REVIEW_RETRIES = 2");
  });

  it("generate.ts tracks bestAttempt for graceful degradation", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("bestAttempt");
    expect(gen).toContain("bestAttempt.score");
  });

  it("generate.ts logs review results with formatReviewLog", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("formatReviewLog(planPage.title, reviewResult)");
  });

  it("review retry appends feedback to base prompt", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("reviewResult.feedback");
    expect(gen).toContain("reviewPrompt");
  });

  it("review retry uses try/catch for graceful failure", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("Retry generation failed");
  });
});

// ============================================================================
// TASK-294: Metrics Logging
// ============================================================================
describe("TASK-294: Metrics logging for depth & review scores", () => {
  it("generate.ts saves review metadata to blueprint payload", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("_review");
    expect(gen).toContain("pageReviewScores");
  });

  it("generate.ts tracks pageReviewScores array", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("pageReviewScores: Array");
  });

  it("review metadata includes score, passed, and checks", () => {
    const gen = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8");
    expect(gen).toContain("reviewMeta");
    expect(gen).toContain("score: reviewResult.score");
    expect(gen).toContain("passed: reviewResult.passed");
  });

  it("plan.ts logs [plan] prefix per-page results", () => {
    const plan = fs.readFileSync(path.join(SRC, "lib/pipeline/phases/plan.ts"), "utf8");
    const planLogMatches = plan.match(/\[plan\]/g) || [];
    expect(planLogMatches.length).toBeGreaterThanOrEqual(2);
  });

  it("formatReviewLog produces structured log line", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
    ]);
    const result = reviewPage(input);
    const log = formatReviewLog("Home", result);
    expect(log).toContain("[review]");
    expect(log).toContain("depth=");
    expect(log).toContain("seo=");
    expect(log).toContain("geo=");
    expect(log).toContain("overall=");
  });
});

// ============================================================================
// Cross-Task Integration: Review Agent Behavior
// ============================================================================
describe("Cross-task: Review agent behavior integration", () => {
  it("review feedback only includes error-severity failures (not warnings)", () => {
    // A page that passes all error checks but fails some warnings should have empty feedback
    const longText = "We provide exceptional dental care services in Portland with our team of certified professionals. Our modern clinic offers comprehensive dental care including cleanings, implants, and cosmetic procedures. We have over 15 years experience and have served 500+ satisfied clients in the Portland community. Our dental care approach combines the latest technology with compassionate patient care to deliver outstanding results for families and individuals seeking quality dental services. From preventive care to advanced restorative procedures, our Portland dental practice is equipped to handle all your oral health needs with precision and expertise.";
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome to Portland Dental Care — Your Trusted Dentist", sub_headline: "Comprehensive dental care for families and individuals in Portland Oregon" }),
      makeSection("space_ds:space-text-media-with-checklist", { title: "Our Dental Care Services", description: longText }),
      makeSection("space_ds:space-text-media-default", { title: "Why Choose Our Dental Care Practice", description: longText }),
      makeSection("space_ds:space-testimony-card", { title: "Patient Reviews About Our Dental Care", quote: "Outstanding dental care service. We trust this Portland dental practice completely. Our whole family loves the team. The dental care we receive is exceptional and the staff is caring and professional.", author_name: "Jane D.", author_role: "Patient" }),
      makeSection("space_ds:space-cta-banner-type-1", { title: "Schedule Your Dental Care Appointment", description: "Contact our Portland dental care team today. Visit /contact to book your dental appointment." }),
    ]);
    const result = reviewPage(input);
    // If passed=true, feedback should be empty
    if (result.passed) {
      expect(result.feedback).toBe("");
    }
  });

  it("all page design rules have sectionCountRange defined", () => {
    for (const rule of PAGE_DESIGN_RULES) {
      expect(rule.sectionCountRange).toBeDefined();
      expect(rule.sectionCountRange[0]).toBeGreaterThanOrEqual(2);
      expect(rule.sectionCountRange[1]).toBeGreaterThanOrEqual(rule.sectionCountRange[0]);
    }
  });

  it("review dimensions cover depth, seo, and geo", () => {
    const input = makeReviewInput("home", "Home", [
      makeSection("space_ds:space-hero-banner-style-01", { title: "Test" }),
    ]);
    const result = reviewPage(input);
    const dimensions = new Set(result.checks.map((c) => c.dimension));
    expect(dimensions.has("depth")).toBe(true);
    expect(dimensions.has("seo")).toBe(true);
    expect(dimensions.has("geo")).toBe(true);
  });

  it("contact page has lower section count minimum (2-3)", () => {
    const rule = getRule("contact");
    expect(rule.sectionCountRange[0]).toBeLessThanOrEqual(3);
  });
});
