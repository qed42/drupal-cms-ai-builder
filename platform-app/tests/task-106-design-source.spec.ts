import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

test.describe("TASK-106: Wizard Screen 5 — Design Source Selection", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "pages",
      name: "Test",
      idea: "A test project",
      pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About", required: true },
        { slug: "contact", title: "Contact", required: true },
      ],
    });
  });

  test("displays correct title, subtitle, and button", async ({ page }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /How should it feel/i })
    ).toBeVisible();
    await expect(
      page.getByText("Upload a design reference or let Archie style it based on your brand")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue/i })
    ).toBeVisible();
  });

  test("two design option cards are rendered", async ({ page }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Provide Figma details")).toBeVisible();
    await expect(page.getByText("Let Space AI choose")).toBeVisible();
  });

  test("'Let Space AI choose' is default selected", async ({ page }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    // AI card is a <label>; when selected it shows a checkmark SVG
    const aiCard = page.locator("label", { hasText: "Let Space AI choose" });
    await expect(aiCard.locator("svg path[d*='5 13l4 4L19 7']")).toBeVisible();
  });

  test("'Provide Figma details' shows 'Coming soon' badge and is non-selectable", async ({
    page,
  }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Coming soon")).toBeVisible();

    // Figma card is a <label> with disabled styling
    const figmaCard = page.locator("label", { hasText: "Provide Figma details" });
    await expect(figmaCard).toHaveClass(/opacity-50/);
    await expect(figmaCard).toHaveClass(/cursor-not-allowed/);
  });

  test("saves design_source and navigates to brand screen", async ({ page }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/brand", { timeout: 10000 });

    // Verify data saved via resume API
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.design_source).toBe("ai");
  });

  test("has Back button navigating to pages step", async ({ page }) => {
    await page.goto("/onboarding/design");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/pages", { timeout: 10000 });
  });
});
