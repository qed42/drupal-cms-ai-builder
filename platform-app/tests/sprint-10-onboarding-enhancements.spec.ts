import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

// =============================================================================
// TASK-200: Industry Questions Configuration (Unit-style checks)
// =============================================================================

test.describe("TASK-200: Industry Questions Configuration", () => {
  test("getQuestionsForIndustry returns healthcare questions", async () => {
    // Direct import test — verify config structure
    const {
      getQuestionsForIndustry,
      INDUSTRY_QUESTIONS,
    } = await import("../src/lib/onboarding/industry-questions");

    const healthcareQs = getQuestionsForIndustry("healthcare");
    expect(healthcareQs.length).toBeGreaterThanOrEqual(2);
    expect(healthcareQs.length).toBeLessThanOrEqual(4);

    // Verify required fields
    for (const q of healthcareQs) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(["text", "select", "multi-select"]).toContain(q.inputType);
      if (q.inputType === "select" || q.inputType === "multi-select") {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(0);
      }
    }

    // Healthcare-specific: should ask about specialties
    expect(healthcareQs.some((q) => q.text.toLowerCase().includes("specialt"))).toBe(true);
    // Healthcare-specific: should ask about insurance
    expect(healthcareQs.some((q) => q.text.toLowerCase().includes("insurance"))).toBe(true);
  });

  test("getQuestionsForIndustry returns legal questions", async () => {
    const { getQuestionsForIndustry } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const legalQs = getQuestionsForIndustry("legal");
    expect(legalQs.length).toBeGreaterThanOrEqual(2);

    // Legal-specific: should ask about practice areas
    expect(legalQs.some((q) => q.text.toLowerCase().includes("practice area"))).toBe(true);
    // Legal-specific: should ask about consultations
    expect(legalQs.some((q) => q.text.toLowerCase().includes("consultation"))).toBe(true);
  });

  test("getQuestionsForIndustry returns restaurant questions", async () => {
    const { getQuestionsForIndustry } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const restaurantQs = getQuestionsForIndustry("restaurant");
    expect(restaurantQs.length).toBeGreaterThanOrEqual(2);

    // Restaurant-specific: should ask about cuisine
    expect(restaurantQs.some((q) => q.text.toLowerCase().includes("cuisine"))).toBe(true);
  });

  test("getQuestionsForIndustry falls back to _default for unknown industries", async () => {
    const { getQuestionsForIndustry, INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const unknownQs = getQuestionsForIndustry("underwater_basket_weaving");
    const defaultQs = INDUSTRY_QUESTIONS._default;

    expect(unknownQs).toEqual(defaultQs);
    expect(unknownQs.length).toBeGreaterThanOrEqual(2);
  });

  test("config covers at least 8 industries plus _default", async () => {
    const { INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    const keys = Object.keys(INDUSTRY_QUESTIONS);
    // 8 industries + _default = 9 entries minimum
    expect(keys.length).toBeGreaterThanOrEqual(9);
    expect(keys).toContain("_default");
    expect(keys).toContain("healthcare");
    expect(keys).toContain("legal");
    expect(keys).toContain("restaurant");
  });

  test("all questions have appropriate input types and placeholders", async () => {
    const { INDUSTRY_QUESTIONS } = await import(
      "../src/lib/onboarding/industry-questions"
    );

    for (const [industry, questions] of Object.entries(INDUSTRY_QUESTIONS)) {
      for (const q of questions) {
        expect(q.id, `${industry}.${q.id} missing id`).toBeTruthy();
        expect(q.text, `${industry}.${q.id} missing text`).toBeTruthy();
        expect(
          ["text", "select", "multi-select"],
          `${industry}.${q.id} invalid inputType: ${q.inputType}`
        ).toContain(q.inputType);

        if (q.inputType === "text") {
          expect(
            q.placeholder,
            `${industry}.${q.id} text question missing placeholder`
          ).toBeTruthy();
        }
        if (q.inputType === "select" || q.inputType === "multi-select") {
          expect(
            q.options?.length,
            `${industry}.${q.id} select/multi-select missing options`
          ).toBeGreaterThan(1);
        }
      }
    }
  });
});

// =============================================================================
// TASK-201: Follow-up Questions Onboarding Step
// =============================================================================

test.describe("TASK-201: Follow-up Questions Step", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Test Clinic",
      idea: "A healthcare clinic providing wellness services",
      audience: "Patients",
      industry: "healthcare",
      fonts: { heading: "Inter", body: "Roboto" },
      colors: { primary: "#6366F1", secondary: "#1E1B4B", accent: "#00F1C6", light: "#E0E7FF" },
    });
  });

  test("renders healthcare follow-up questions", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /Tell us more about your business/i })
    ).toBeVisible();

    // Healthcare questions
    await expect(page.getByText(/specialties/i)).toBeVisible();
    await expect(page.getByText(/insurance/i)).toBeVisible();
  });

  test("text inputs accept user responses", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Fill specialties text input
    const specialtiesInput = page.locator('input[placeholder*="Family Medicine"]');
    await specialtiesInput.fill("Pediatrics, Dermatology");
    await expect(specialtiesInput).toHaveValue("Pediatrics, Dermatology");
  });

  test("select inputs allow single selection", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Click an insurance option
    const option = page.getByRole("button", { name: /Yes — most major plans/i });
    await option.click();

    // Should show selected state (indigo styling)
    await expect(option).toHaveClass(/bg-indigo-500/);
  });

  test("multi-select inputs allow multiple selections", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Click multiple patient type options
    await page.getByRole("button", { name: "Adults" }).click();
    await page.getByRole("button", { name: "Children" }).click();

    // Both should be selected
    await expect(page.getByRole("button", { name: "Adults" })).toHaveClass(/bg-indigo-500/);
    await expect(page.getByRole("button", { name: "Children" })).toHaveClass(/bg-indigo-500/);

    // Clicking again deselects
    await page.getByRole("button", { name: "Adults" }).click();
    await expect(page.getByRole("button", { name: "Adults" })).not.toHaveClass(/bg-indigo-500/);
  });

  test("saves answers and navigates to tone step", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Fill a text input
    const specialtiesInput = page.locator('input[placeholder*="Family Medicine"]');
    await specialtiesInput.fill("Orthopedics");

    // Submit
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/tone", { timeout: 10000 });

    // Verify data was saved
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.followUpAnswers).toBeDefined();
    expect(resumed.data.followUpAnswers.specialties).toBe("Orthopedics");
  });

  test("back button navigates to fonts step", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/fonts", { timeout: 10000 });
  });

  test("renders fallback questions for unknown industry", async ({ page }) => {
    // Re-seed with unknown industry
    await seedOnboardingData(page, {
      _step: "fonts",
      industry: "underwater_basket_weaving",
    });

    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Should show default questions
    await expect(page.getByText(/main product or service/i)).toBeVisible();
  });
});

// =============================================================================
// TASK-202: Tone Selection & Differentiators Step
// =============================================================================

test.describe("TASK-202: Tone Selection & Differentiators", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "follow-up",
      name: "Test Clinic",
      idea: "A healthcare clinic",
      industry: "healthcare",
      followUpAnswers: { specialties: "Pediatrics" },
    });
  });

  test("renders 4 tone sample cards with preview text", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /Set your brand voice/i })
    ).toBeVisible();

    // 4 tone options
    await expect(page.getByText("Professional")).toBeVisible();
    await expect(page.getByText("Warm & Friendly")).toBeVisible();
    await expect(page.getByText("Bold & Confident")).toBeVisible();
    await expect(page.getByText("Casual")).toBeVisible();

    // Each has sample preview text
    await expect(page.getByText(/proven methodologies/i)).toBeVisible();
    await expect(page.getByText(/trusted partner/i)).toBeVisible();
    await expect(page.getByText(/don't do average/i)).toBeVisible();
    await expect(page.getByText(/no jargon, no fuss/i)).toBeVisible();
  });

  test("tone selection works as radio-style (single selection)", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Select Professional
    await page.getByText("Professional").click();
    const professionalCard = page.locator("button").filter({ hasText: "Professional" }).first();
    await expect(professionalCard).toHaveClass(/border-indigo-500/);

    // Select Casual — Professional should deselect
    await page.getByText("Casual").click();
    const casualCard = page.locator("button").filter({ hasText: "Casual" }).first();
    await expect(casualCard).toHaveClass(/border-indigo-500/);
  });

  test("submit is disabled until a tone is selected", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Submit should be disabled initially
    const submitBtn = page.getByRole("button", { name: /Visualize my site/i });
    await expect(submitBtn).toBeDisabled();

    // Select a tone
    await page.getByText("Professional").click();
    await expect(submitBtn).toBeEnabled();
  });

  test("differentiators input has industry-specific placeholder", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Healthcare placeholder
    const diffInput = page.locator('input[placeholder*="same-day appointments"]');
    await expect(diffInput).toBeVisible();
  });

  test("advanced section is collapsible", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Advanced section collapsed by default
    await expect(page.getByText("Reference websites")).not.toBeVisible();

    // Expand
    await page.getByText("Advanced options").click();
    await expect(page.getByText("Reference websites")).toBeVisible();
    await expect(page.getByText("Existing copy")).toBeVisible();

    // Collapse
    await page.getByText("Advanced options").click();
    await expect(page.getByText("Reference websites")).not.toBeVisible();
  });

  test("reference URLs: can add up to 3 and remove", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Expand advanced
    await page.getByText("Advanced options").click();

    // 1 URL field by default
    const urlInputs = page.locator('input[type="url"]');
    await expect(urlInputs).toHaveCount(1);

    // Add second URL
    await page.getByText("+ Add another URL").click();
    await expect(urlInputs).toHaveCount(2);

    // Add third URL
    await page.getByText("+ Add another URL").click();
    await expect(urlInputs).toHaveCount(3);

    // "Add another" should disappear at 3
    await expect(page.getByText("+ Add another URL")).not.toBeVisible();
  });

  test("existing copy textarea enforces 2,000 char limit", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    await page.getByText("Advanced options").click();

    const textarea = page.locator(
      'textarea[placeholder*="Paste existing website copy"]'
    );
    await textarea.fill("x".repeat(2100));

    // Should be truncated to 2000
    const value = await textarea.inputValue();
    expect(value.length).toBe(2000);

    // Counter should show 2,000/2,000
    await expect(page.getByText("2,000/2,000")).toBeVisible();
  });

  test("saves all data and triggers generation on submit", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Select tone
    await page.getByText("Bold & Confident").click();

    // Fill differentiators
    const diffInput = page.locator(
      'input[placeholder*="same-day appointments"]'
    );
    await diffInput.fill("Best pediatric care in the region");

    // Submit — this triggers generation
    await page.getByRole("button", { name: /Visualize my site/i }).click();

    // Should navigate to progress page (or handle generation error gracefully)
    // Note: Generation may fail in test env without AI provider, but data should be saved
    await page.waitForTimeout(2000);

    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.tone).toBe("bold");
    expect(resumed.data.differentiators).toBe(
      "Best pediatric care in the region"
    );
    expect(resumed.data.onboarding_complete).toBe(true);
  });

  test("back button navigates to follow-up step", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/follow-up", { timeout: 10000 });
  });
});

// =============================================================================
// TASK-203: Enhanced Page Suggestions API
// =============================================================================

test.describe("TASK-203: Enhanced Page Suggestions", () => {
  test("default pages include descriptions", async () => {
    const { getDefaultPages } = await import("../src/lib/ai/prompts");

    const healthcarePages = getDefaultPages("healthcare");

    for (const p of healthcarePages) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(10);
    }
  });

  test("pages step UI shows descriptions", async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "audience",
      name: "Test",
      idea: "A dental clinic",
      audience: "Patients",
      suggested_pages: [
        {
          slug: "home",
          title: "Home",
          description: "Welcome page with practice overview and patient trust signals",
          required: true,
        },
        {
          slug: "services",
          title: "Services",
          description: "Detailed descriptions of dental procedures with patient benefits",
          required: true,
        },
        {
          slug: "about",
          title: "About Us",
          description: "Practice history and team introduction",
          required: true,
        },
        {
          slug: "contact",
          title: "Contact",
          description: "Location, hours, and appointment request form",
          required: true,
        },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    // Descriptions should be visible
    await expect(
      page.getByText("Welcome page with practice overview")
    ).toBeVisible();
    await expect(
      page.getByText("Detailed descriptions of dental procedures")
    ).toBeVisible();
  });

  test("suggest-pages prompt requests descriptions", async () => {
    const { SUGGEST_PAGES_PROMPT } = await import("../src/lib/ai/prompts");
    expect(SUGGEST_PAGES_PROMPT).toContain('"description"');
    expect(SUGGEST_PAGES_PROMPT).toContain("One sentence explaining");
  });
});

// =============================================================================
// TASK-204: Custom Page Addition UI
// =============================================================================

test.describe("TASK-204: Custom Page Addition", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "audience",
      name: "Test",
      idea: "A dental clinic",
      audience: "Patients",
      suggested_pages: [
        { slug: "home", title: "Home", description: "Welcome page", required: true },
        { slug: "services", title: "Services", description: "Service listings", required: true },
        { slug: "about", title: "About Us", description: "Practice info", required: true },
        { slug: "contact", title: "Contact", description: "Contact info", required: true },
      ],
    });
  });

  test("'Add Custom Page' button appears", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("button", { name: /Add Custom Page/i })
    ).toBeVisible();
  });

  test("custom page form has title and description inputs", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();

    await expect(page.locator('input[placeholder="Page title..."]')).toBeVisible();
    await expect(
      page.locator('textarea[placeholder*="Brief description"]')
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Page" })
    ).toBeVisible();
  });

  test("can add a custom page with title and description", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();
    await page.fill('input[placeholder="Page title..."]', "Insurance Info");
    await page.fill(
      'textarea[placeholder*="Brief description"]',
      "Information about accepted insurance plans"
    );
    await page.getByRole("button", { name: "Add Page" }).click();

    // Custom page appears with "Custom" badge
    await expect(page.getByText("Insurance Info")).toBeVisible();
    await expect(page.getByText("Custom")).toBeVisible();
    await expect(page.getByText("5 of 12 pages")).toBeVisible();
    await expect(page.getByText("(1 custom)")).toBeVisible();
  });

  test("enforces max 3 custom pages limit", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    // Add 3 custom pages
    for (let i = 1; i <= 3; i++) {
      await page.getByRole("button", { name: /Add Custom Page/i }).click();
      await page.fill('input[placeholder="Page title..."]', `Custom ${i}`);
      await page.getByRole("button", { name: "Add Page" }).click();
      await expect(page.getByText(`Custom ${i}`)).toBeVisible();
    }

    // Should show limit message instead of add button
    await expect(page.getByText(/Maximum 3 custom pages reached/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Add Custom Page/i })
    ).not.toBeVisible();
  });

  test("custom pages are visually distinguished", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();
    await page.fill('input[placeholder="Page title..."]', "FAQ");
    await page.getByRole("button", { name: "Add Page" }).click();

    // Custom page has purple styling
    const customCard = page.locator("div").filter({ hasText: "FAQCustom" }).first();
    await expect(customCard).toHaveClass(/purple/);
  });

  test("custom pages are saved to session", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();
    await page.fill('input[placeholder="Page title..."]', "Blog");
    await page.fill(
      'textarea[placeholder*="Brief description"]',
      "Health tips and practice news"
    );
    await page.getByRole("button", { name: "Add Page" }).click();

    // Submit pages step
    await page.getByRole("button", { name: /Shape the Experience/i }).click();
    await page.waitForURL("**/onboarding/design", { timeout: 10000 });

    // Verify saved
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    const blogPage = resumed.data.pages?.find(
      (p: { slug: string }) => p.slug === "blog"
    );
    expect(blogPage).toBeDefined();
    expect(blogPage.custom).toBe(true);
    expect(blogPage.description).toBe("Health tips and practice news");
  });

  test("cancel button closes the custom page form", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();
    await expect(page.locator('input[placeholder="Page title..."]')).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator('input[placeholder="Page title..."]')).not.toBeVisible();
  });
});

// =============================================================================
// Onboarding Flow: Updated Step Navigation
// =============================================================================

test.describe("Updated Onboarding Flow", () => {
  test("onboarding-steps.ts includes follow-up and tone", async () => {
    const { ONBOARDING_STEPS, getStepIndex, getNextStep, getPrevStep } =
      await import("../src/lib/onboarding-steps");

    expect(ONBOARDING_STEPS).toHaveLength(10);
    expect(getStepIndex("follow-up")).toBe(8);
    expect(getStepIndex("tone")).toBe(9);

    expect(getNextStep("fonts")).toBe("follow-up");
    expect(getNextStep("follow-up")).toBe("tone");
    expect(getNextStep("tone")).toBeNull(); // last step

    expect(getPrevStep("follow-up")).toBe("fonts");
    expect(getPrevStep("tone")).toBe("follow-up");
  });

  test("fonts step no longer triggers generation — navigates to follow-up", async ({
    page,
  }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "brand",
      name: "Test",
      idea: "A test project",
      design_source: "ai",
      colors: { primary: "#6366F1", secondary: "#1E1B4B", accent: "#00F1C6", light: "#E0E7FF" },
    });

    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // Button label should be "Continue", not "Visualize my site"
    await expect(
      page.getByRole("button", { name: /Continue/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Visualize my site/i })
    ).not.toBeVisible();

    // Submit navigates to follow-up
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/follow-up", { timeout: 10000 });

    // Verify onboarding_complete is NOT set (it's set by the tone step now)
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.onboarding_complete).toBeUndefined();
  });

  test("ProgressDots shows 10 dots", async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Test",
      industry: "healthcare",
    });

    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // ProgressDots renders one dot per step
    const dots = page.locator(".rounded-full.h-2");
    await expect(dots).toHaveCount(10);
  });
});
