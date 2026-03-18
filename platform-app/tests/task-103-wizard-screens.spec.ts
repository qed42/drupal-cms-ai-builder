import { test, expect } from "@playwright/test";
import { registerAndLogin, navigateToStep } from "./helpers";

test.describe("TASK-103: Wizard Screens 1–3", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // registerAndLogin lands on /onboarding/start
  });

  test.describe("Screen 1: Project Name", () => {
    test("displays correct title, subtitle, placeholder, and button label", async ({
      page,
    }) => {
      await navigateToStep(page, "name");

      await expect(
        page.getByRole("heading", { name: "What are we calling this?" })
      ).toBeVisible();
      await expect(page.getByText("Give your project a name")).toBeVisible();

      const input = page.locator('input[placeholder="Name of the Project"]');
      await expect(input).toBeVisible();

      await expect(
        page.getByRole("button", { name: /Continue/i })
      ).toBeVisible();
    });

    test("Continue button is disabled when name is too short", async ({
      page,
    }) => {
      await navigateToStep(page, "name");
      const button = page.getByRole("button", { name: /Continue/i });

      // Empty - disabled
      await expect(button).toBeDisabled();

      // 1 char - disabled
      await page.fill('input[placeholder="Name of the Project"]', "A");
      await expect(button).toBeDisabled();

      // 2 chars - enabled
      await page.fill('input[placeholder="Name of the Project"]', "AB");
      await expect(button).toBeEnabled();
    });

    test("captures and saves project name", async ({ page }) => {
      await navigateToStep(page, "name");

      await page.fill('input[placeholder="Name of the Project"]', "My Website");
      await page.getByRole("button", { name: /Continue/i }).click();
      await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

      // Go back and verify data persisted
      await page.goto("/onboarding/name");
      await page.waitForLoadState("networkidle");
      const input = page.locator('input[placeholder="Name of the Project"]');
      await expect(input).toHaveValue("My Website", { timeout: 5000 });
    });
  });

  test.describe("Screen 2: Big Idea", () => {
    test("displays correct title, subtitle, placeholder, and button label", async ({
      page,
    }) => {
      await navigateToStep(page, "idea");

      await expect(
        page.getByRole("heading", { name: /big idea/i })
      ).toBeVisible();
      await expect(
        page.getByText("In a few lines, tell us what this is all about")
      ).toBeVisible();

      const textarea = page.locator(
        'textarea[placeholder="Describe your project or business..."]'
      );
      await expect(textarea).toBeVisible();

      await expect(
        page.getByRole("button", { name: /Your Audience/i })
      ).toBeVisible();
    });

    test("Your Audience button is disabled when idea is empty", async ({
      page,
    }) => {
      await navigateToStep(page, "idea");
      const button = page.getByRole("button", { name: /Your Audience/i });

      await expect(button).toBeDisabled();

      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "A great idea"
      );
      await expect(button).toBeEnabled();
    });

    test("captures and saves project description", async ({ page }) => {
      await navigateToStep(page, "idea");

      const description = "An innovative platform";
      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        description
      );
      await page.getByRole("button", { name: /Your Audience/i }).click();
      await page.waitForURL("**/onboarding/audience", { timeout: 10000 });

      // Go back and verify
      await page.goto("/onboarding/idea");
      await page.waitForLoadState("networkidle");
      const textarea = page.locator(
        'textarea[placeholder="Describe your project or business..."]'
      );
      await expect(textarea).toHaveValue(description, { timeout: 5000 });
    });

    test("has Back button that navigates to name step", async ({ page }) => {
      await navigateToStep(page, "idea");
      await page.getByRole("button", { name: "Back" }).click();
      await page.waitForURL("**/onboarding/name", { timeout: 10000 });
    });
  });

  test.describe("Screen 3: Audience", () => {
    test("displays correct title, subtitle, placeholder, and button label", async ({
      page,
    }) => {
      await navigateToStep(page, "audience");

      await expect(
        page.getByRole("heading", { name: "Who is this for?" })
      ).toBeVisible();
      await expect(
        page.getByText("Describe your ideal audience")
      ).toBeVisible();

      const input = page.locator(
        'input[placeholder="Describe your ideal audience..."]'
      );
      await expect(input).toBeVisible();

      await expect(
        page.getByRole("button", { name: /Plan the Structure/i })
      ).toBeVisible();
    });

    test("audience field is optional — button enabled when empty", async ({
      page,
    }) => {
      await navigateToStep(page, "audience");
      const button = page.getByRole("button", {
        name: /Plan the Structure/i,
      });
      await expect(button).toBeEnabled();
    });

    test("captures and saves target audience", async ({ page }) => {
      await navigateToStep(page, "audience");

      const audience = "Small business owners aged 25-45";
      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        audience
      );
      await page.getByRole("button", { name: /Plan the Structure/i }).click();
      await page.waitForURL("**/onboarding/start", { timeout: 10000 });

      // Navigate back to audience and verify
      await page.goto("/onboarding/audience");
      await page.waitForLoadState("networkidle");
      const input = page.locator(
        'input[placeholder="Describe your ideal audience..."]'
      );
      await expect(input).toHaveValue(audience, { timeout: 5000 });
    });

    test("has Back button that navigates to idea step", async ({ page }) => {
      await navigateToStep(page, "audience");
      await page.getByRole("button", { name: "Back" }).click();
      await page.waitForURL("**/onboarding/idea", { timeout: 10000 });
    });
  });

  test.describe("Full Wizard Flow", () => {
    test("user can complete all 3 screens end-to-end", async ({ page }) => {
      await page.getByRole("button", { name: /Start Building/i }).click();
      await page.waitForURL("**/onboarding/name", { timeout: 10000 });

      await page.fill('input[placeholder="Name of the Project"]', "E2E Project");
      await page.getByRole("button", { name: /Continue/i }).click();
      await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "A complete end-to-end test"
      );
      await page.getByRole("button", { name: /Your Audience/i }).click();
      await page.waitForURL("**/onboarding/audience", { timeout: 10000 });

      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        "Developers"
      );
      await page.getByRole("button", { name: /Plan the Structure/i }).click();
      await page.waitForURL("**/onboarding/start", { timeout: 10000 });
    });
  });
});
