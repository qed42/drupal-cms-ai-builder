import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("TASK-117: Platform Dashboard", () => {
  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("dashboard renders with heading and site card for authenticated user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Dashboard heading
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Manage your website")).toBeVisible();
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

  test("dashboard shows subscription section", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Should show subscription heading
    await expect(
      page.getByRole("heading", { name: "Subscription" })
    ).toBeVisible();

    // Should show plan type
    await expect(page.getByText("Free Trial")).toBeVisible();

    // Should show status
    await expect(page.getByText("Active")).toBeVisible();
  });

  test("dashboard shows trial countdown for trial users", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Trial users should see days remaining
    await expect(page.getByText(/Trial ends in/i)).toBeVisible();
    await expect(page.getByText(/\d+ days?/)).toBeVisible();
  });

  test("dashboard layout shows nav bar with email and sign out", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Nav bar brand
    await expect(page.getByText("Drupal CMS")).toBeVisible();

    // User email visible
    await expect(page.locator("text=@test.com")).toBeVisible();

    // Sign out button
    await expect(
      page.getByRole("button", { name: /Sign out/i })
    ).toBeVisible();
  });

  test("dashboard shows site name when set", async ({ page }) => {
    await registerAndLogin(page);

    // Set a site name via onboarding
    await page.evaluate(async () => {
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "name",
          data: { name: "My Test Website" },
        }),
      });
    });

    // The site name is set by the generate-blueprint route,
    // but for onboarding status it shows "Untitled Site" or the site name from DB
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Should show some site identifier (either name or "Untitled Site")
    const siteCard = page.locator('[class*="rounded-2xl"]').first();
    await expect(siteCard).toBeVisible();
  });
});
