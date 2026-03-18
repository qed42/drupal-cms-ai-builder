import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("TASK-102: Onboarding Wizard Framework", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // registerAndLogin lands us on /onboarding/start already
  });

  test("start page shows welcome message and Start Building button", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /shape your big idea/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Start Building/i })
    ).toBeVisible();
  });

  test("progress dots are visible on start screen", async ({ page }) => {
    // Check that the ProgressDots component renders (4 step indicators)
    const dots = page.locator('[class*="rounded-full"][class*="h-2"]');
    await expect(dots.first()).toBeVisible({ timeout: 5000 });
    const count = await dots.count();
    expect(count).toBe(8);
  });

  test("clicking Start Building navigates to name step", async ({ page }) => {
    await page.getByRole("button", { name: /Start Building/i }).click();
    await page.waitForURL("**/onboarding/name", { timeout: 10000 });
    await expect(page).toHaveURL(/\/onboarding\/name/);
  });

  test("back navigation works without data loss", async ({ page }) => {
    await page.getByRole("button", { name: /Start Building/i }).click();
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
    await page.getByRole("button", { name: /Start Building/i }).click();
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
    await page.getByRole("button", { name: /Start Building/i }).click();
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
