import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("TASK-102: Onboarding Wizard Framework", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // After login, user lands on /dashboard. Navigate to onboarding start.
    await page.goto("/onboarding/start");
    await page.waitForLoadState("domcontentloaded");
  });

  test("start page shows welcome message and Let's Go button", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /let.s build your website/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Let.s Go/i })
    ).toBeVisible();
  });

  test("progress stepper shows section labels on start screen", async ({
    page,
  }) => {
    // ProgressStepper renders 4 section labels: Your Business, Site Structure, Brand & Style, Review & Build
    // Use exact match to avoid strict-mode violation (desktop span vs mobile p with extra text)
    await expect(page.getByText("Your Business", { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Site Structure", { exact: true })).toBeVisible();
    await expect(page.getByText("Brand & Style", { exact: true })).toBeVisible();
    await expect(page.getByText("Review & Build", { exact: true })).toBeVisible();
  });

  test("clicking Let's Go navigates to theme step", async ({ page }) => {
    await page.getByRole("button", { name: /Let.s Go/i }).click();
    await page.waitForURL("**/onboarding/theme", { timeout: 10000 });
    await expect(page).toHaveURL(/\/onboarding\/theme/);
  });

  test("theme step shows design foundation heading and continues to name", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Let.s Go/i }).click();
    await page.waitForURL("**/onboarding/theme", { timeout: 10000 });

    await expect(
      page.getByRole("heading", { name: /pick a design foundation/i })
    ).toBeVisible();

    // Space DS is selected by default — click Continue to go to name
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });
    await expect(page).toHaveURL(/\/onboarding\/name/);
  });

  test("back navigation works without data loss", async ({ page }) => {
    // Navigate: start → theme → name
    await page.getByRole("button", { name: /Let.s Go/i }).click();
    await page.waitForURL("**/onboarding/theme", { timeout: 10000 });
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });

    const projectName = "My Test Project";
    await page.fill('input[placeholder="Name of the Project"]', projectName);
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

    // Go back to name
    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });

    // Data should be restored
    const input = page.locator('input[placeholder="Name of the Project"]');
    await expect(input).toHaveValue(projectName);
  });

  test("data saves to DB on each step forward", async ({ page }) => {
    // Navigate: start → theme → name
    await page.getByRole("button", { name: /Let.s Go/i }).click();
    await page.waitForURL("**/onboarding/theme", { timeout: 10000 });
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });

    await page.fill('input[placeholder="Name of the Project"]', "Save Test");
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

    // Verify via resume API using browser context cookies
    const response = await page.evaluate(async () => {
      const res = await fetch("/api/onboarding/resume");
      return res.json();
    });
    expect(response.data.name).toBe("Save Test");
  });

  test("refreshing page restores data", async ({ page }) => {
    // Navigate: start → theme → name
    await page.getByRole("button", { name: /Let.s Go/i }).click();
    await page.waitForURL("**/onboarding/theme", { timeout: 10000 });
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });

    const projectName = "Refresh Test";
    await page.fill('input[placeholder="Name of the Project"]', projectName);
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

    // Reload and go back to name page
    await page.goto("/onboarding/name");
    await page.waitForLoadState("networkidle");

    const input = page.locator('input[placeholder="Name of the Project"]');
    await expect(input).toHaveValue(projectName, { timeout: 5000 });
  });
});
