import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

test.describe("TASK-108: Wizard Screen 7 — Font Selection", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "brand",
      name: "Test",
      idea: "A test project",
      design_source: "ai",
      colors: {
        primary: "#6366F1",
        secondary: "#1E1B4B",
        accent: "#00F1C6",
        light: "#E0E7FF",
      },
    });
  });

  test("displays correct title, subtitle, and button", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /Select a font/i })
    ).toBeVisible();
    await expect(
      page.getByText("Select a primary and a secondary font")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Visualize my site/i })
    ).toBeVisible();
  });

  test("renders 4 font preview tiles", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // 4 tiles each showing "Aa"
    const tiles = page.locator("text=Aa");
    await expect(tiles).toHaveCount(4);
  });

  test("font dropdowns show available Google Fonts", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // Should have Heading and Body font labels
    await expect(page.getByText("Heading Font")).toBeVisible();
    await expect(page.getByText("Body Font")).toBeVisible();

    // Check dropdowns have all 8 fonts
    const headingSelect = page.locator("select").first();
    const options = headingSelect.locator("option");
    await expect(options).toHaveCount(8);

    // Verify specific fonts present
    await expect(options.filter({ hasText: "Nunito Sans" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Montserrat" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Playfair Display" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Inter" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Roboto" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Lato" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Poppins" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Raleway" })).toHaveCount(1);
  });

  test("selecting a font updates preview tiles in real-time", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // Get initial font family on first tile
    const firstTile = page.locator("text=Aa").first();
    const initialFont = await firstTile.evaluate((el) => el.style.fontFamily);

    // Change heading font to Playfair Display
    const headingSelect = page.locator("select").first();
    await headingSelect.selectOption("Playfair Display");

    // Preview tile font should change
    const updatedFont = await firstTile.evaluate((el) => el.style.fontFamily);
    expect(updatedFont).not.toBe(initialFont);
    expect(updatedFont).toContain("Playfair Display");
  });

  test("custom font upload zone is present", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Add font files locally")).toBeVisible();
  });

  test("'Visualize my site' saves font data and marks onboarding complete", async ({
    page,
  }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // Select specific fonts
    const headingSelect = page.locator("select").first();
    const bodySelect = page.locator("select").nth(1);
    await headingSelect.selectOption("Montserrat");
    await bodySelect.selectOption("Lato");

    await page.getByRole("button", { name: /Visualize my site/i }).click();
    await page.waitForURL("**/onboarding/start", { timeout: 10000 });

    // Verify saved data
    const resumed = await page.evaluate(async () => {
      const r = await fetch("/api/onboarding/resume");
      return r.json();
    });
    expect(resumed.data.fonts.heading).toBe("Montserrat");
    expect(resumed.data.fonts.body).toBe("Lato");
    expect(resumed.data.onboarding_complete).toBe(true);
  });

  test("has Back button navigating to brand step", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/brand", { timeout: 10000 });
  });

  test("preview tiles use brand colors from onboarding data", async ({ page }) => {
    await page.goto("/onboarding/fonts");
    await page.waitForLoadState("domcontentloaded");

    // The first tile should use the primary color as background
    const tiles = page.locator('[class*="aspect-square"]');
    const firstTileBg = await tiles.first().evaluate((el) => el.style.backgroundColor);

    // Should contain the primary color (converted from hex to rgb)
    // #6366F1 = rgb(99, 102, 241)
    expect(firstTileBg).toContain("99");
  });
});
