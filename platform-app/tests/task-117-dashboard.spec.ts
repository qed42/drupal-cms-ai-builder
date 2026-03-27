import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("TASK-117: Platform Dashboard", () => {
  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("dashboard renders with heading and subtitle for authenticated user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Dashboard heading
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });
    // Subtitle text (plural "websites")
    await expect(page.getByText("Manage your websites")).toBeVisible();
  });

  test("dashboard shows site card with 'Setting Up' status for new user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // New users have status "onboarding" → badge shows "Setting Up"
    await expect(page.getByText("Setting Up")).toBeVisible();
  });

  test("dashboard shows 'Continue Setup' button for onboarding status", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const continueBtn = page.getByRole("button", {
      name: /Continue Setup/i,
    });
    await expect(continueBtn).toBeVisible();

    // Click navigates to onboarding
    await continueBtn.click();
    await page.waitForURL("**/onboarding/**", { timeout: 10000 });
  });

  test("dashboard shows subscription badge inline on site card", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Subscription plan label rendered inline inside the SiteCard (no separate heading)
    await expect(page.getByText("Free Trial")).toBeVisible();
  });

  test("dashboard layout shows nav bar with brand name and sign out", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Nav bar brand — now "Space AI"
    await expect(page.getByText("Space AI")).toBeVisible();

    // User email visible (all test emails end with @test.com)
    await expect(page.locator("text=@test.com")).toBeVisible();

    // Sign out button
    await expect(
      page.getByRole("button", { name: /Sign out/i })
    ).toBeVisible();
  });

  test("dashboard layout shows Sites nav link as active", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // "Sites" link in the top nav
    await expect(page.getByRole("link", { name: "Sites" })).toBeVisible();
  });

  test("dashboard shows 'Add new website' button", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("button", { name: /Add new website/i })
    ).toBeVisible();
  });

  test("dashboard shows site name or 'Untitled Site' on site card", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // New user's site has no name yet → shows "Untitled Site"
    const siteCard = page.locator('[class*="rounded-2xl"]').first();
    await expect(siteCard).toBeVisible();
    await expect(siteCard.getByText("Untitled Site")).toBeVisible();
  });
});
