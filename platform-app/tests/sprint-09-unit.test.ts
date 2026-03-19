/**
 * Sprint 09 Unit Tests: AI Provider Foundation & Pipeline Infrastructure
 *
 * Tests pure functions, factory routing, Zod schemas, type compatibility,
 * and validation retry logic — all without requiring a running server.
 *
 * Run: npx tsx tests/sprint-09-unit.test.ts
 */

import { z } from "zod";
import assert from "node:assert/strict";

// ============================================================
// Test helpers
// ============================================================

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${msg}`);
      console.log(`  ✗ ${name}`);
      console.log(`    → ${msg}`);
    }
  })();
}

// ============================================================
// TASK-205: OnboardingData Schema Update
// ============================================================

async function testTask205() {
  console.log("\n--- TASK-205: Onboarding Session Schema Update ---");

  // Dynamic import to handle path aliases
  const types = await import("../src/lib/blueprint/types.js");

  await test("OnboardingData interface is exported from types.ts", () => {
    // TypeScript already validates this at compile time; this verifies runtime export
    // The type exists as an interface so we can't directly check it at runtime,
    // but we verify that the module exports correctly
    assert.ok(types !== undefined, "types module should be importable");
  });

  await test("v1 OnboardingData is backward compatible (all v2 fields optional)", () => {
    // Simulate a v1 session — no v2 fields
    const v1Data: import("../src/lib/blueprint/types.js").OnboardingData = {
      name: "Test Site",
      idea: "A test website",
      audience: "everyone",
      industry: "tech",
      tone: "professional",
      pages: [{ slug: "home", title: "Home" }],
    };
    assert.ok(v1Data.name === "Test Site");
    assert.ok(v1Data.followUpAnswers === undefined, "v2 followUpAnswers should be undefined for v1");
    assert.ok(v1Data.differentiators === undefined, "v2 differentiators should be undefined for v1");
    assert.ok(v1Data.referenceUrls === undefined, "v2 referenceUrls should be undefined for v1");
    assert.ok(v1Data.existingCopy === undefined, "v2 existingCopy should be undefined for v1");
  });

  await test("v2 OnboardingData accepts all enrichment fields", () => {
    const v2Data: import("../src/lib/blueprint/types.js").OnboardingData = {
      name: "v2 Site",
      idea: "A modern website",
      audience: "developers",
      followUpAnswers: { "q1": "answer1", "q2": "answer2" },
      differentiators: "We are unique because...",
      referenceUrls: ["https://example.com", "https://competitor.com"],
      existingCopy: "Our existing marketing copy...",
      pages: [
        { slug: "home", title: "Home", description: "Main landing page" },
      ],
    };
    assert.ok(v2Data.followUpAnswers?.q1 === "answer1");
    assert.ok(v2Data.differentiators === "We are unique because...");
    assert.ok(v2Data.referenceUrls?.length === 2);
    assert.ok(v2Data.existingCopy === "Our existing marketing copy...");
    assert.ok(v2Data.pages?.[0].description === "Main landing page");
  });

  await test("OnboardingPageSelection includes optional description field", () => {
    const pageWithDesc: import("../src/lib/blueprint/types.js").OnboardingPageSelection = {
      slug: "about",
      title: "About Us",
      description: "Learn about our team and mission",
    };
    assert.ok(pageWithDesc.description === "Learn about our team and mission");

    const pageWithoutDesc: import("../src/lib/blueprint/types.js").OnboardingPageSelection = {
      slug: "about",
      title: "About Us",
    };
    assert.ok(pageWithoutDesc.description === undefined);
  });
}

// ============================================================
// TASK-210: AI Provider Interface & Factory
// ============================================================

async function testTask210() {
  console.log("\n--- TASK-210: AI Provider Interface & Factory ---");

  const { isRateLimitError, isRetryableError } = await import(
    "../src/lib/ai/provider.js"
  );
  const { resolveModel, getAIProvider, clearProviderCache } = await import(
    "../src/lib/ai/factory.js"
  );

  // --- isRateLimitError ---
  await test("isRateLimitError: detects status 429", () => {
    assert.ok(isRateLimitError({ status: 429 }));
  });

  await test("isRateLimitError: detects rate_limit_exceeded code", () => {
    assert.ok(isRateLimitError({ code: "rate_limit_exceeded" }));
  });

  await test("isRateLimitError: rejects status 200", () => {
    assert.ok(!isRateLimitError({ status: 200 }));
  });

  await test("isRateLimitError: rejects null", () => {
    assert.ok(!isRateLimitError(null));
  });

  await test("isRateLimitError: rejects undefined", () => {
    assert.ok(!isRateLimitError(undefined));
  });

  await test("isRateLimitError: rejects string", () => {
    assert.ok(!isRateLimitError("error"));
  });

  // --- isRetryableError ---
  await test("isRetryableError: 429 is retryable", () => {
    assert.ok(isRetryableError({ status: 429 }));
  });

  await test("isRetryableError: 500 is retryable", () => {
    assert.ok(isRetryableError({ status: 500 }));
  });

  await test("isRetryableError: 503 is retryable", () => {
    assert.ok(isRetryableError({ status: 503 }));
  });

  await test("isRetryableError: ETIMEDOUT is retryable", () => {
    assert.ok(isRetryableError({ code: "ETIMEDOUT" }));
  });

  await test("isRetryableError: ECONNRESET is retryable", () => {
    assert.ok(isRetryableError({ code: "ECONNRESET" }));
  });

  await test("isRetryableError: 400 is NOT retryable", () => {
    assert.ok(!isRetryableError({ status: 400 }));
  });

  await test("isRetryableError: 401 is NOT retryable", () => {
    assert.ok(!isRetryableError({ status: 401 }));
  });

  await test("isRetryableError: 404 is NOT retryable", () => {
    assert.ok(!isRetryableError({ status: 404 }));
  });

  // --- resolveModel ---
  await test("resolveModel: returns undefined when no env vars set", () => {
    delete process.env.AI_MODEL;
    delete process.env.AI_MODEL_RESEARCH;
    const result = resolveModel();
    assert.equal(result, undefined);
  });

  await test("resolveModel: returns AI_MODEL when set", () => {
    process.env.AI_MODEL = "gpt-4o";
    const result = resolveModel();
    assert.equal(result, "gpt-4o");
    delete process.env.AI_MODEL;
  });

  await test("resolveModel: per-phase override takes priority over AI_MODEL", () => {
    process.env.AI_MODEL = "gpt-4o-mini";
    process.env.AI_MODEL_RESEARCH = "gpt-4o";
    const result = resolveModel("research");
    assert.equal(result, "gpt-4o");
    delete process.env.AI_MODEL;
    delete process.env.AI_MODEL_RESEARCH;
  });

  await test("resolveModel: falls back to AI_MODEL when phase env not set", () => {
    process.env.AI_MODEL = "gpt-4o-mini";
    const result = resolveModel("plan");
    assert.equal(result, "gpt-4o-mini");
    delete process.env.AI_MODEL;
  });

  await test("resolveModel: AI_MODEL_PLAN override works", () => {
    process.env.AI_MODEL_PLAN = "claude-sonnet-4-20250514";
    const result = resolveModel("plan");
    assert.equal(result, "claude-sonnet-4-20250514");
    delete process.env.AI_MODEL_PLAN;
  });

  await test("resolveModel: AI_MODEL_GENERATE override works", () => {
    process.env.AI_MODEL_GENERATE = "gpt-4o-mini";
    const result = resolveModel("generate");
    assert.equal(result, "gpt-4o-mini");
    delete process.env.AI_MODEL_GENERATE;
  });

  // --- getAIProvider factory ---
  await test("getAIProvider: defaults to openai when AI_PROVIDER not set", async () => {
    clearProviderCache();
    delete process.env.AI_PROVIDER;
    const provider = await getAIProvider();
    assert.equal(provider.name, "openai");
  });

  await test("getAIProvider: returns openai when AI_PROVIDER=openai", async () => {
    clearProviderCache();
    process.env.AI_PROVIDER = "openai";
    const provider = await getAIProvider();
    assert.equal(provider.name, "openai");
  });

  await test("getAIProvider: returns anthropic when AI_PROVIDER=anthropic", async () => {
    clearProviderCache();
    process.env.AI_PROVIDER = "anthropic";
    const provider = await getAIProvider();
    assert.equal(provider.name, "anthropic");
  });

  await test("getAIProvider: case-insensitive (OPENAI → openai)", async () => {
    clearProviderCache();
    process.env.AI_PROVIDER = "OPENAI";
    const provider = await getAIProvider();
    assert.equal(provider.name, "openai");
  });

  await test("getAIProvider: throws on unknown provider", async () => {
    clearProviderCache();
    process.env.AI_PROVIDER = "google";
    await assert.rejects(
      () => getAIProvider(),
      /Unknown AI_PROVIDER "google"/
    );
  });

  await test("getAIProvider: caches provider instances", async () => {
    clearProviderCache();
    process.env.AI_PROVIDER = "openai";
    const p1 = await getAIProvider();
    const p2 = await getAIProvider();
    assert.ok(p1 === p2, "Should return the same cached instance");
  });

  // Clean up
  delete process.env.AI_PROVIDER;
  clearProviderCache();
}

// ============================================================
// TASK-211 & TASK-212: Provider Interface Compliance
// ============================================================

async function testTask211_212() {
  console.log("\n--- TASK-211/212: Provider Interface Compliance ---");

  const { OpenAIProvider } = await import("../src/lib/ai/providers/openai.js");
  const { AnthropicProvider } = await import(
    "../src/lib/ai/providers/anthropic.js"
  );

  await test("OpenAIProvider has name='openai'", () => {
    const provider = new OpenAIProvider();
    assert.equal(provider.name, "openai");
  });

  await test("OpenAIProvider has generateJSON method", () => {
    const provider = new OpenAIProvider();
    assert.equal(typeof provider.generateJSON, "function");
  });

  await test("OpenAIProvider has generateText method", () => {
    const provider = new OpenAIProvider();
    assert.equal(typeof provider.generateText, "function");
  });

  await test("AnthropicProvider has name='anthropic'", () => {
    const provider = new AnthropicProvider();
    assert.equal(provider.name, "anthropic");
  });

  await test("AnthropicProvider has generateJSON method", () => {
    const provider = new AnthropicProvider();
    assert.equal(typeof provider.generateJSON, "function");
  });

  await test("AnthropicProvider has generateText method", () => {
    const provider = new AnthropicProvider();
    assert.equal(typeof provider.generateText, "function");
  });
}

// ============================================================
// TASK-213: Structured Output Validation with Zod
// ============================================================

async function testTask213() {
  console.log("\n--- TASK-213: Structured Output Validation (Zod) ---");

  const { generateValidatedJSON } = await import(
    "../src/lib/ai/validation.js"
  );

  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  await test("generateValidatedJSON: returns valid data on first try", async () => {
    const mockProvider = {
      name: "mock",
      generateJSON: async () => ({ name: "Alice", age: 30 }),
      generateText: async () => "text",
    } as any;
    const result = await generateValidatedJSON(
      mockProvider,
      "test prompt",
      testSchema
    );
    assert.deepEqual(result, { name: "Alice", age: 30 });
  });

  await test("generateValidatedJSON: retries on validation error and succeeds", async () => {
    let callCount = 0;
    const mockProvider = {
      name: "mock",
      generateJSON: async () => {
        callCount++;
        if (callCount === 1) {
          // First call: throw a Zod-like validation error
          const error = new Error("Validation failed");
          (error as any).issues = [
            { path: ["age"], message: "Expected number, received string" },
          ];
          throw error;
        }
        // Second call: return valid data
        return { name: "Bob", age: 25 };
      },
      generateText: async () => "text",
    } as any;

    const result = await generateValidatedJSON(
      mockProvider,
      "test prompt",
      testSchema
    );
    assert.deepEqual(result, { name: "Bob", age: 25 });
    assert.equal(callCount, 2, "Should have retried once");
  });

  await test("generateValidatedJSON: throws after max retries exhausted", async () => {
    let callCount = 0;
    const zodError = () => {
      callCount++;
      const error = new Error("Validation failed");
      (error as any).issues = [
        { path: ["name"], message: "Required" },
      ];
      throw error;
    };

    const mockProvider = {
      name: "mock",
      generateJSON: zodError,
      generateText: async () => "text",
    } as any;

    await assert.rejects(
      () =>
        generateValidatedJSON(mockProvider, "test prompt", testSchema, {
          maxValidationRetries: 2,
        }),
      /Validation failed after 3 attempts/
    );
    assert.equal(callCount, 3, "Should attempt 1 + 2 retries = 3 total");
  });

  await test("generateValidatedJSON: non-Zod errors throw immediately without retry", async () => {
    let callCount = 0;
    const mockProvider = {
      name: "mock",
      generateJSON: async () => {
        callCount++;
        throw new Error("Network error");
      },
      generateText: async () => "text",
    } as any;

    await assert.rejects(
      () => generateValidatedJSON(mockProvider, "test prompt", testSchema),
      /Network error/
    );
    assert.equal(callCount, 1, "Should NOT retry on non-Zod errors");
  });

  await test("generateValidatedJSON: respects custom maxValidationRetries", async () => {
    let callCount = 0;
    const mockProvider = {
      name: "mock",
      generateJSON: async () => {
        callCount++;
        const error = new Error("Validation failed");
        (error as any).issues = [{ path: [], message: "Invalid" }];
        throw error;
      },
      generateText: async () => "text",
    } as any;

    await assert.rejects(
      () =>
        generateValidatedJSON(mockProvider, "test prompt", testSchema, {
          maxValidationRetries: 1,
        }),
      /Validation failed after 2 attempts/
    );
    assert.equal(callCount, 2, "Should attempt 1 + 1 retry = 2 total");
  });
}

// ============================================================
// TASK-213: Pipeline Zod Schemas
// ============================================================

async function testTask213Schemas() {
  console.log("\n--- TASK-213: Pipeline Zod Schemas ---");

  const {
    ResearchBriefSchema,
    ContentPlanSchema,
    BlueprintOutputSchema,
    PageLayoutSchema,
  } = await import("../src/lib/pipeline/schemas.js");

  // --- ResearchBriefSchema ---
  await test("ResearchBriefSchema: accepts valid research brief", () => {
    const validBrief = {
      industry: "healthcare",
      targetAudience: {
        primary: "patients",
        demographics: ["adults 25-65"],
        painPoints: ["long wait times"],
      },
      competitors: [
        {
          name: "HealthCo",
          strengths: ["brand recognition"],
          weaknesses: ["outdated website"],
        },
      ],
      keyMessages: ["Quality care, close to home"],
      toneGuidance: {
        primary: "warm and professional",
        avoid: ["clinical jargon"],
        examples: ["We're here for you"],
      },
      seoKeywords: ["healthcare clinic", "family doctor"],
    };
    const result = ResearchBriefSchema.parse(validBrief);
    assert.equal(result.industry, "healthcare");
  });

  await test("ResearchBriefSchema: complianceNotes is optional", () => {
    const brief = {
      industry: "tech",
      targetAudience: {
        primary: "developers",
        demographics: [],
        painPoints: [],
      },
      competitors: [],
      keyMessages: [],
      toneGuidance: { primary: "casual", avoid: [], examples: [] },
      seoKeywords: [],
    };
    const result = ResearchBriefSchema.parse(brief);
    assert.equal(result.complianceNotes, undefined);
  });

  await test("ResearchBriefSchema: rejects missing required fields", () => {
    assert.throws(() => {
      ResearchBriefSchema.parse({ industry: "tech" });
    });
  });

  // --- ContentPlanSchema ---
  await test("ContentPlanSchema: accepts valid content plan", () => {
    const validPlan = {
      siteName: "My Site",
      tagline: "The best site",
      pages: [
        {
          slug: "home",
          title: "Home",
          purpose: "Landing page",
          targetKeywords: ["home"],
          sections: [
            {
              heading: "Welcome",
              type: "hero",
              contentBrief: "Main hero section",
            },
          ],
        },
      ],
      globalContent: {
        services: [{ title: "Consulting", briefDescription: "We consult" }],
      },
    };
    const result = ContentPlanSchema.parse(validPlan);
    assert.equal(result.siteName, "My Site");
    assert.equal(result.pages.length, 1);
  });

  await test("ContentPlanSchema: teamMembers and testimonials are optional", () => {
    const plan = {
      siteName: "Test",
      tagline: "Testing",
      pages: [],
      globalContent: {
        services: [],
      },
    };
    const result = ContentPlanSchema.parse(plan);
    assert.equal(result.globalContent.teamMembers, undefined);
    assert.equal(result.globalContent.testimonials, undefined);
  });

  // --- PageLayoutSchema ---
  await test("PageLayoutSchema: accepts valid page layout", () => {
    const layout = {
      slug: "about",
      title: "About Us",
      seo: {
        meta_title: "About | My Site",
        meta_description: "Learn about us",
      },
      sections: [
        { component_id: "space_ds:space-hero-banner-style-01", props: { title: "About" } },
      ],
    };
    const result = PageLayoutSchema.parse(layout);
    assert.equal(result.slug, "about");
    assert.equal(result.sections.length, 1);
  });

  await test("PageLayoutSchema: rejects missing seo", () => {
    assert.throws(() => {
      PageLayoutSchema.parse({ slug: "test", title: "Test", sections: [] });
    });
  });

  // --- BlueprintOutputSchema ---
  await test("BlueprintOutputSchema: accepts valid complete blueprint", () => {
    const blueprint = {
      site: {
        name: "Test Site",
        tagline: "A test",
        industry: "tech",
        audience: "everyone",
        compliance_flags: [],
        tone: "professional",
      },
      brand: {
        colors: { primary: "#000" },
        fonts: { heading: "Inter", body: "Inter" },
      },
      pages: [
        {
          slug: "home",
          title: "Home",
          seo: { meta_title: "Home", meta_description: "Home page" },
          sections: [],
        },
      ],
      content: {},
      forms: {
        contact: {
          fields: [
            { name: "email", type: "email" as const, label: "Email", required: true },
          ],
        },
      },
    };
    const result = BlueprintOutputSchema.parse(blueprint);
    assert.equal(result.site.name, "Test Site");
  });

  await test("BlueprintOutputSchema: rejects invalid form field type", () => {
    const blueprint = {
      site: {
        name: "Test",
        tagline: "",
        industry: "",
        audience: "",
        compliance_flags: [],
        tone: "",
      },
      brand: { colors: {}, fonts: { heading: "", body: "" } },
      pages: [],
      content: {},
      forms: {
        contact: {
          fields: [
            { name: "x", type: "invalid_type", label: "X", required: false },
          ],
        },
      },
    };
    assert.throws(() => {
      BlueprintOutputSchema.parse(blueprint);
    });
  });
}

// ============================================================
// TASK-214: Prisma Schema Structural Validation
// ============================================================

async function testTask214() {
  console.log("\n--- TASK-214: Pipeline Data Models (Prisma Schema) ---");

  const fs = await import("node:fs");
  const path = await import("node:path");

  const schemaPath = path.resolve(
    new URL(".", import.meta.url).pathname,
    "../prisma/schema.prisma"
  );
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await test("Prisma schema contains ResearchBrief model", () => {
    assert.ok(schema.includes("model ResearchBrief {"));
  });

  await test("Prisma schema contains ContentPlan model", () => {
    assert.ok(schema.includes("model ContentPlan {"));
  });

  await test("Prisma schema contains BlueprintVersion model", () => {
    assert.ok(schema.includes("model BlueprintVersion {"));
  });

  await test("ResearchBrief has [siteId, version] unique constraint", () => {
    // Check that within ResearchBrief block there's @@unique([siteId, version])
    const rbMatch = schema.match(/model ResearchBrief \{[\s\S]*?^\}/m);
    assert.ok(rbMatch, "ResearchBrief model found");
    assert.ok(
      rbMatch![0].includes("@@unique([siteId, version])"),
      "ResearchBrief should have @@unique([siteId, version])"
    );
  });

  await test("ContentPlan has [siteId, version] unique constraint", () => {
    const cpMatch = schema.match(/model ContentPlan \{[\s\S]*?^\}/m);
    assert.ok(cpMatch, "ContentPlan model found");
    assert.ok(
      cpMatch![0].includes("@@unique([siteId, version])"),
      "ContentPlan should have @@unique([siteId, version])"
    );
  });

  await test("BlueprintVersion has [blueprintId, version] unique constraint", () => {
    const bvMatch = schema.match(/model BlueprintVersion \{[\s\S]*?^\}/m);
    assert.ok(bvMatch, "BlueprintVersion model found");
    assert.ok(
      bvMatch![0].includes("@@unique([blueprintId, version])"),
      "BlueprintVersion should have @@unique([blueprintId, version])"
    );
  });

  await test("Site model has pipelinePhase field", () => {
    const siteMatch = schema.match(/model Site \{[\s\S]*?^\}/m);
    assert.ok(siteMatch);
    assert.ok(siteMatch![0].includes("pipelinePhase"));
  });

  await test("Site model has pipelineError field", () => {
    const siteMatch = schema.match(/model Site \{[\s\S]*?^\}/m);
    assert.ok(siteMatch);
    assert.ok(siteMatch![0].includes("pipelineError"));
  });

  await test("Blueprint model has originalPayload field", () => {
    const bpMatch = schema.match(/model Blueprint \{[\s\S]*?^\}/m);
    assert.ok(bpMatch);
    assert.ok(bpMatch![0].includes("originalPayload"));
  });

  await test("Site has researchBriefs relation", () => {
    const siteMatch = schema.match(/model Site \{[\s\S]*?^\}/m);
    assert.ok(siteMatch);
    assert.ok(siteMatch![0].includes("researchBriefs"));
  });

  await test("Site has contentPlans relation", () => {
    const siteMatch = schema.match(/model Site \{[\s\S]*?^\}/m);
    assert.ok(siteMatch);
    assert.ok(siteMatch![0].includes("contentPlans"));
  });

  await test("Blueprint has versions relation", () => {
    const bpMatch = schema.match(/model Blueprint \{[\s\S]*?^\}/m);
    assert.ok(bpMatch);
    assert.ok(bpMatch![0].includes("versions"));
  });

  await test("ContentPlan has researchBriefId FK", () => {
    const cpMatch = schema.match(/model ContentPlan \{[\s\S]*?^\}/m);
    assert.ok(cpMatch);
    assert.ok(cpMatch![0].includes("researchBriefId"));
  });

  await test("ResearchBrief maps to research_briefs table", () => {
    const rbMatch = schema.match(/model ResearchBrief \{[\s\S]*?^\}/m);
    assert.ok(rbMatch);
    assert.ok(rbMatch![0].includes('@@map("research_briefs")'));
  });

  await test("ContentPlan maps to content_plans table", () => {
    const cpMatch = schema.match(/model ContentPlan \{[\s\S]*?^\}/m);
    assert.ok(cpMatch);
    assert.ok(cpMatch![0].includes('@@map("content_plans")'));
  });

  await test("BlueprintVersion maps to blueprint_versions table", () => {
    const bvMatch = schema.match(/model BlueprintVersion \{[\s\S]*?^\}/m);
    assert.ok(bvMatch);
    assert.ok(bvMatch![0].includes('@@map("blueprint_versions")'));
  });
}

// ============================================================
// .env.example validation
// ============================================================

async function testEnvExample() {
  console.log("\n--- ENV: .env.example Configuration ---");

  const fs = await import("node:fs");
  const path = await import("node:path");

  const envPath = path.resolve(new URL(".", import.meta.url).pathname, "../.env.example");
  const env = fs.readFileSync(envPath, "utf-8");

  await test(".env.example contains AI_PROVIDER", () => {
    assert.ok(env.includes("AI_PROVIDER"));
  });

  await test(".env.example contains AI_MODEL", () => {
    assert.ok(env.includes("AI_MODEL="));
  });

  await test(".env.example contains AI_MODEL_RESEARCH", () => {
    assert.ok(env.includes("AI_MODEL_RESEARCH"));
  });

  await test(".env.example contains AI_MODEL_PLAN", () => {
    assert.ok(env.includes("AI_MODEL_PLAN"));
  });

  await test(".env.example contains AI_MODEL_GENERATE", () => {
    assert.ok(env.includes("AI_MODEL_GENERATE"));
  });

  await test(".env.example contains ANTHROPIC_API_KEY", () => {
    assert.ok(env.includes("ANTHROPIC_API_KEY"));
  });

  await test(".env.example defaults AI_PROVIDER to openai", () => {
    assert.ok(env.includes("AI_PROVIDER=openai"));
  });
}

// ============================================================
// Run all tests
// ============================================================

async function main() {
  console.log("Sprint 09 Unit Tests");
  console.log("====================");

  await testTask205();
  await testTask210();
  await testTask211_212();
  await testTask213();
  await testTask213Schemas();
  await testTask214();
  await testEnvExample();

  console.log("\n====================");
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  ✗ ${f}`));
    process.exit(1);
  }

  console.log("\n✓ All tests passed!");
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
