import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

test.describe("TASK-105: Wizard Screen 4 — Page Map", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("displays correct title, subtitle, and button label", async ({ page }) => {
    // Seed data so we skip AI analysis
    await seedOnboardingData(page, {
      _step: "audience",
      name: "Test",
      idea: "A healthcare clinic",
      audience: "Patients",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "services", title: "Services", required: true },
        { slug: "contact", title: "Contact", required: true },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /Let's map your site/i })
    ).toBeVisible();
    await expect(
      page.getByText("Based on what you've shared")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Shape the Experience/i })
    ).toBeVisible();
  });

  test("renders AI-suggested pages as removable chips", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "services", title: "Services", required: true },
        { slug: "providers", title: "Our Providers", required: false },
        { slug: "contact", title: "Contact", required: true },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    // Should see all 5 page chips
    await expect(page.getByText("Home")).toBeVisible();
    await expect(page.getByText("About Us")).toBeVisible();
    await expect(page.getByText("Services")).toBeVisible();
    await expect(page.getByText("Our Providers")).toBeVisible();
    await expect(page.getByText("Contact")).toBeVisible();

    // Remove buttons should be visible (5 > MIN_PAGES of 3)
    const removeButtons = page.getByLabel(/Remove/);
    await expect(removeButtons.first()).toBeVisible();
  });

  test("user can remove pages down to minimum 3", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "services", title: "Services", required: true },
        { slug: "extras", title: "Extras", required: false },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    // Should see 4 pages initially
    await expect(page.getByText("4 of 12 pages")).toBeVisible();

    // Remove "Extras"
    await page.getByLabel("Remove Extras").click();

    // Now 3 pages — remove buttons should be gone (at minimum)
    await expect(page.getByText("3 of 12 pages")).toBeVisible();
    await expect(page.getByLabel(/Remove/)).toHaveCount(0);
  });

  test("user can add custom pages via 'Add page +' input", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "contact", title: "Contact", required: true },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    // Click "+ Add page" button
    await page.getByRole("button", { name: /Add page/i }).click();

    // Fill in custom page name and click Add
    await page.fill('input[placeholder="Page name..."]', "Blog");
    await page.getByRole("button", { name: "Add" }).click();

    // Verify new page appears
    await expect(page.getByText("Blog")).toBeVisible();
    await expect(page.getByText("4 of 12 pages")).toBeVisible();
  });

  test("navigates to design screen on submit", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "contact", title: "Contact", required: true },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /Shape the Experience/i }).click();
    await page.waitForURL("**/onboarding/design", { timeout: 10000 });
  });

  test("has Back button navigating to audience step", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "contact", title: "Contact", required: true },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/audience", { timeout: 10000 });
  });

  test("page count indicator updates correctly", async ({ page }) => {
    await seedOnboardingData(page, {
      _step: "audience",
      suggested_pages: [
        { slug: "home", title: "Home", required: true },
        { slug: "about", title: "About Us", required: true },
        { slug: "services", title: "Services", required: true },
        { slug: "contact", title: "Contact", required: true },
        { slug: "blog", title: "Blog", required: false },
      ],
    });

    await page.goto("/onboarding/pages");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("5 of 12 pages")).toBeVisible();
  });
});
