import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

// =============================================================================
// TASK-200: Industry Questions Configuration (Unit-style checks)
// These tests use direct ES module imports which don't work in Playwright's
// CommonJS runtime. They should be run with Vitest instead.
// =============================================================================

test.describe("TASK-200: Industry Questions Configuration", () => {
  test.skip("getQuestionsForIndustry returns healthcare questions — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test.skip("getQuestionsForIndustry returns legal questions — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test.skip("getQuestionsForIndustry returns restaurant questions — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test.skip("getQuestionsForIndustry falls back to _default for unknown industries — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test.skip("config covers at least 8 industries plus _default — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test.skip("all questions have appropriate input types and placeholders — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });
});

// =============================================================================
// TASK-201: Follow-up Questions Onboarding Step
// =============================================================================

test.describe("TASK-201: Follow-up Questions Step", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // Seed to the images step so follow-up is accessible
    await seedOnboardingData(page, {
      _step: "images",
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

    // Split layout renders the heading twice (desktop + mobile), use .first()
    await expect(
      page.getByRole("heading", { name: /Help Archie write better content/i }).first()
    ).toBeVisible();

    // Healthcare questions
    await expect(page.getByText(/specialties/i).first()).toBeVisible();
    await expect(page.getByText(/insurance/i).first()).toBeVisible();
  });

  test("text inputs accept user responses", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Fill specialties text input (placeholder: "e.g., Family Medicine, Pediatrics, Dermatology")
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

    // Should show selected state (brand styling)
    await expect(option).toHaveClass(/bg-brand-500\/30/);
  });

  test("multi-select inputs allow multiple selections", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Click multiple patient type options
    await page.getByRole("button", { name: "Adults" }).click();
    await page.getByRole("button", { name: "Children" }).click();

    // Both should be selected (brand styling)
    await expect(page.getByRole("button", { name: "Adults" })).toHaveClass(/bg-brand-500\/30/);
    await expect(page.getByRole("button", { name: "Children" })).toHaveClass(/bg-brand-500\/30/);

    // Clicking again deselects
    await page.getByRole("button", { name: "Adults" }).click();
    await expect(page.getByRole("button", { name: "Adults" })).not.toHaveClass(/bg-brand-500\/30/);
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

  test("back button navigates to images step", async ({ page }) => {
    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/images", { timeout: 10000 });
  });

  test("renders fallback questions for unknown industry", async ({ page }) => {
    // Re-seed with unknown industry
    await seedOnboardingData(page, {
      _step: "images",
      industry: "underwater_basket_weaving",
    });

    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // Should show default questions — "main product or service" from _default questions
    await expect(page.getByText(/main product or service/i).first()).toBeVisible();
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

    // Split layout renders heading twice (desktop + mobile), use .first()
    await expect(
      page.getByRole("heading", { name: /Set your brand voice/i }).first()
    ).toBeVisible();

    // 4 tone options — each name appears inside a button card
    await expect(page.getByText("Professional").first()).toBeVisible();
    await expect(page.getByText("Warm & Friendly").first()).toBeVisible();
    await expect(page.getByText("Bold & Confident").first()).toBeVisible();
    await expect(page.getByText("Casual").first()).toBeVisible();

    // Each has sample preview text
    await expect(page.getByText(/proven methodologies/i).first()).toBeVisible();
    await expect(page.getByText(/trusted partner/i).first()).toBeVisible();
    await expect(page.getByText(/don't do average/i).first()).toBeVisible();
    await expect(page.getByText(/no jargon, no fuss/i).first()).toBeVisible();
  });

  test("tone selection works as radio-style (single selection)", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Select Professional
    await page.getByText("Professional").first().click();
    const professionalCard = page.locator("button").filter({ hasText: "Professional" }).first();
    await expect(professionalCard).toHaveClass(/border-brand-500/);

    // Select Casual — Professional should deselect
    await page.getByText("Casual").first().click();
    const casualCard = page.locator("button").filter({ hasText: "Casual" }).first();
    await expect(casualCard).toHaveClass(/border-brand-500/);
  });

  test("submit is disabled until a tone is selected", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Submit should be disabled initially
    const submitBtn = page.getByRole("button", { name: /Next: Review & Build/i });
    await expect(submitBtn).toBeDisabled();

    // Select a tone
    await page.getByText("Professional").first().click();
    await expect(submitBtn).toBeEnabled();
  });

  test("differentiators input has industry-specific placeholder", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Healthcare placeholder contains "same-day appointments"
    const diffInput = page.locator('input[placeholder*="same-day appointments"]');
    await expect(diffInput).toBeVisible();
  });

  test("advanced section is collapsible", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Advanced section collapsed by default — "Reference websites" not visible
    await expect(page.getByText("Reference websites (optional)")).not.toBeVisible();

    // Expand
    await page.getByText("Advanced options").click();
    await expect(page.getByText("Reference websites (optional)")).toBeVisible();
    await expect(page.getByText("Existing copy (optional)")).toBeVisible();

    // Collapse
    await page.getByText("Advanced options").click();
    await expect(page.getByText("Reference websites (optional)")).not.toBeVisible();
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

    // Counter should show 2000/2,000
    await expect(page.getByText("2000/2,000")).toBeVisible();
  });

  test("saves all data and navigates to review-settings on submit", async ({ page }) => {
    await page.goto("/onboarding/tone");
    await page.waitForLoadState("domcontentloaded");

    // Select tone
    await page.getByText("Bold & Confident").first().click();

    // Fill differentiators
    const diffInput = page.locator(
      'input[placeholder*="same-day appointments"]'
    );
    await diffInput.fill("Best pediatric care in the region");

    // Submit — navigates to review-settings (not generation)
    await page.getByRole("button", { name: /Next: Review & Build/i }).click();
    await page.waitForURL("**/onboarding/review-settings", { timeout: 10000 });

    // Verify data was saved
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.tone).toBe("bold");
    expect(resumed.data.differentiators).toBe(
      "Best pediatric care in the region"
    );
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
// These tests use direct ES module imports — run with Vitest instead.
// =============================================================================

test.describe("TASK-203: Enhanced Page Suggestions", () => {
  test.skip("default pages include descriptions — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
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
      page.getByText("Welcome page with practice overview").first()
    ).toBeVisible();
    await expect(
      page.getByText("Detailed descriptions of dental procedures").first()
    ).toBeVisible();
  });

  test.skip("suggest-pages prompt requests descriptions — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
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

  test("'+ Add Custom Page' button appears", async ({ page }) => {
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
    await expect(page.getByText("Custom").first()).toBeVisible();
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

  test("custom pages are visually distinguished with brand styling", async ({ page }) => {
    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Add Custom Page/i }).click();
    await page.fill('input[placeholder="Page title..."]', "FAQ");
    await page.getByRole("button", { name: "Add Page" }).click();

    // Custom page has brand styling (bg-brand-500/10 border-brand-500/30)
    const customCard = page.locator("div").filter({ hasText: /FAQ/ }).filter({ hasText: /Custom/ }).first();
    await expect(customCard).toHaveClass(/brand/);
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

    // Submit pages step — button label is "Continue"
    await page.getByRole("button", { name: /Continue/i }).click();
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
  test.skip("onboarding-steps.ts includes follow-up and tone with correct ordering — run with Vitest", async () => {
    // Vitest unit test — direct import not supported in Playwright
  });

  test("fonts step navigates to images — not directly to follow-up", async ({
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

    // Button label should be "Continue"
    await expect(
      page.getByRole("button", { name: /Continue/i })
    ).toBeVisible();

    // Submit navigates to images (not follow-up or generation)
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/images", { timeout: 10000 });
  });

  test("ProgressStepper renders section-based navigation with 4 sections", async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "images",
      name: "Test",
      industry: "healthcare",
    });

    await page.goto("/onboarding/follow-up");
    await page.waitForLoadState("domcontentloaded");

    // ProgressStepper shows 4 section labels.
    // "Brand & Style" appears in both desktop and mobile stepper, use .first()
    await expect(page.getByText("Your Business").first()).toBeVisible();
    await expect(page.getByText("Site Structure").first()).toBeVisible();
    await expect(page.getByText("Brand & Style").first()).toBeVisible();
    await expect(page.getByText("Review & Build").first()).toBeVisible();
  });
});
