import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

test.describe("TASK-122: Generation Progress UI", () => {
  test("progress page renders with loading state", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    // Should show the building message
    await expect(
      page.getByRole("heading", { name: /Building your site blueprint/i })
    ).toBeVisible();

    // Should show the helper text
    await expect(
      page.getByText(/Our AI is crafting your perfect website/i)
    ).toBeVisible();

    // Should show a spinner (animated element)
    await expect(page.locator(".animate-spin")).toBeVisible();
  });

  test("progress page shows step labels", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Analyzing your vision...")).toBeVisible();
    await expect(page.getByText("Designing page layouts...")).toBeVisible();
    await expect(page.getByText("Writing content...")).toBeVisible();
    await expect(page.getByText("Setting up forms...")).toBeVisible();
    await expect(page.getByText("Blueprint complete!")).toBeVisible();
  });

  test("progress page shows percentage", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    // Should display a percentage
    await expect(page.getByText(/\d+% complete/)).toBeVisible();
  });

  test("fonts page 'Visualize my site' triggers generation and redirects to progress", async ({
    page,
  }) => {
    test.setTimeout(60000);

    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "brand",
      name: "Test Site",
      idea: "A test project for QA",
      audience: "Testers",
      industry: "other",
      design_source: "ai",
      colors: { primary: "#6366F1", secondary: "#1E1B4B" },
      pages: [{ slug: "home", title: "Home" }],
      fonts: { heading: "Inter", body: "Inter" },
    });

    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the page to fully load
    await expect(
      page.getByRole("button", { name: /Visualize my site/i })
    ).toBeVisible();

    // Click "Visualize my site"
    await page.getByRole("button", { name: /Visualize my site/i }).click();

    // Should redirect to progress page
    await page.waitForURL("**/onboarding/progress", { timeout: 30000 });

    // Progress page should be showing
    await expect(
      page.getByRole("heading", { name: /Building your site blueprint/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("progress page shows success state when generation completes", async ({
    page,
  }) => {
    test.setTimeout(120000);

    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Progress Test",
      idea: "Testing progress UI",
      audience: "QA team",
      industry: "other",
      pages: [
        { slug: "home", title: "Home" },
        { slug: "contact", title: "Contact" },
      ],
      colors: { primary: "#6366F1" },
      fonts: { heading: "Inter", body: "Inter" },
    });

    // Trigger generation via API
    await page.evaluate(async () => {
      await fetch("/api/provision/generate-blueprint", { method: "POST" });
    });

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    // Wait for completion — the page polls every 3s
    await expect(
      page.getByRole("heading", { name: /Your blueprint is ready/i })
    ).toBeVisible({ timeout: 120000 });

    // "Continue to Dashboard" button should appear
    await expect(
      page.getByRole("button", { name: /Continue to Dashboard/i })
    ).toBeVisible();

    // Progress should show 100%
    await expect(page.getByText("100% complete")).toBeVisible();
  });

  test("'Continue to Dashboard' navigates to dashboard", async ({ page }) => {
    test.setTimeout(120000);

    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Dashboard Nav Test",
      idea: "Testing dashboard navigation",
      audience: "QA",
      industry: "other",
      pages: [{ slug: "home", title: "Home" }],
      colors: { primary: "#6366F1" },
      fonts: { heading: "Inter", body: "Inter" },
    });

    await page.evaluate(async () => {
      await fetch("/api/provision/generate-blueprint", { method: "POST" });
    });

    await page.goto("/onboarding/progress");

    // Wait for completion
    await expect(
      page.getByRole("button", { name: /Continue to Dashboard/i })
    ).toBeVisible({ timeout: 120000 });

    // Click to dashboard
    await page.getByRole("button", { name: /Continue to Dashboard/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
  });
});
