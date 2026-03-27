import { test, expect } from "@playwright/test";
import { registerAndLogin, navigateToStep } from "./helpers";

test.describe("TASK-103: Wizard Screens 1–3", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // registerAndLogin lands on /dashboard or /onboarding
  });

  test.describe("Screen 1: Project Name", () => {
    test("displays correct title, subtitle, placeholder, and button label", async ({
      page,
    }) => {
      await navigateToStep(page, "name");

      await expect(
        page.getByRole("heading", { name: "What's your business called?" })
      ).toBeVisible();
      await expect(
        page.getByText(
          "This becomes your site title and appears in search results."
        )
      ).toBeVisible();

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

      // Empty — disabled
      await expect(button).toBeDisabled();

      // 1 char — disabled (minimum is 2)
      await page.fill('input[placeholder="Name of the Project"]', "A");
      await expect(button).toBeDisabled();

      // 2 chars — enabled
      await page.fill('input[placeholder="Name of the Project"]', "AB");
      await expect(button).toBeEnabled();
    });

    test("captures and saves project name", async ({ page }) => {
      await navigateToStep(page, "name");

      await page.fill(
        'input[placeholder="Name of the Project"]',
        "My Website"
      );
      await page.getByRole("button", { name: /Continue/i }).click();
      await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

      // Go back and verify data persisted
      await page.goto("/onboarding/name");
      await page.waitForLoadState("networkidle");
      const input = page.locator('input[placeholder="Name of the Project"]');
      await expect(input).toHaveValue("My Website", { timeout: 5000 });
    });
  });

  test.describe("Screen 2: Business Idea", () => {
    test("displays correct title, subtitle, placeholder, and button label", async ({
      page,
    }) => {
      await navigateToStep(page, "idea");

      await expect(
        page.getByRole("heading", { name: "Tell us about your business" })
      ).toBeVisible();
      await expect(
        page.getByText(
          "Describe what you do, who you serve, and what makes you different."
        )
      ).toBeVisible();

      const textarea = page.locator(
        'textarea[placeholder="Describe your project or business..."]'
      );
      await expect(textarea).toBeVisible();

      await expect(
        page.getByRole("button", { name: /Your Audience/i })
      ).toBeVisible();
    });

    test("Next button is disabled when idea is under 20 characters", async ({
      page,
    }) => {
      await navigateToStep(page, "idea");
      const button = page.getByRole("button", { name: /Your Audience/i });

      // Empty — disabled
      await expect(button).toBeDisabled();

      // Short text (under 20 chars) — disabled
      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "A great idea"
      );
      await expect(button).toBeDisabled();

      // 20+ chars — enabled
      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "A healthcare clinic providing wellness services"
      );
      await expect(button).toBeEnabled();
    });

    test("shows character count", async ({ page }) => {
      await navigateToStep(page, "idea");

      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "Hello world"
      );
      await expect(page.getByText("11 characters")).toBeVisible();
    });

    test("shows short-input guidance when under 20 characters", async ({
      page,
    }) => {
      await navigateToStep(page, "idea");

      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "Short idea"
      );
      await expect(
        page.getByText("Give Archie more detail for a better site")
      ).toBeVisible();
    });

    test("captures and saves project description", async ({ page }) => {
      await navigateToStep(page, "idea");

      const description =
        "An innovative healthcare platform offering telemedicine services";
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
        page.getByRole("heading", { name: "Who are your customers?" })
      ).toBeVisible();
      await expect(
        page.getByText(
          "Help Archie understand who'll visit your site"
        )
      ).toBeVisible();

      const input = page.locator(
        'input[placeholder="Describe your ideal audience..."]'
      );
      await expect(input).toBeVisible();

      await expect(
        page.getByRole("button", { name: /Site Structure/i })
      ).toBeVisible();
    });

    test("Next button is disabled when audience is under 10 characters", async ({
      page,
    }) => {
      await navigateToStep(page, "audience");
      const button = page.getByRole("button", { name: /Site Structure/i });

      // Empty — disabled
      await expect(button).toBeDisabled();

      // Short text (under 10 chars) — disabled
      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        "Devs"
      );
      await expect(button).toBeDisabled();

      // 10+ chars — enabled
      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        "Developers and engineers"
      );
      await expect(button).toBeEnabled();
    });

    test("shows character count", async ({ page }) => {
      await navigateToStep(page, "audience");

      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        "Business owners"
      );
      await expect(page.getByText("15 characters")).toBeVisible();
    });

    test("captures and saves target audience", async ({ page }) => {
      await navigateToStep(page, "audience");

      const audience = "Small business owners aged 25-45 in the healthcare industry";
      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        audience
      );
      await page.getByRole("button", { name: /Site Structure/i }).click();
      await page.waitForURL("**/onboarding/pages", { timeout: 15000 });

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
      // Start page — click "Let's Go"
      await page.goto("/onboarding/start");
      await page.getByRole("button", { name: /Let.s Go/i }).click();
      await page.waitForURL("**/onboarding/theme", { timeout: 10000 });

      // Theme page — default selection, click Continue
      await page.getByRole("button", { name: /Continue/i }).click();
      await page.waitForURL("**/onboarding/name", { timeout: 10000 });

      // Name page
      await page.fill(
        'input[placeholder="Name of the Project"]',
        "E2E Project"
      );
      await page.getByRole("button", { name: /Continue/i }).click();
      await page.waitForURL("**/onboarding/idea", { timeout: 10000 });

      // Idea page (need 20+ chars)
      await page.fill(
        'textarea[placeholder="Describe your project or business..."]',
        "A complete end-to-end test for our healthcare platform"
      );
      await page.getByRole("button", { name: /Your Audience/i }).click();
      await page.waitForURL("**/onboarding/audience", { timeout: 10000 });

      // Audience page (need 10+ chars)
      await page.fill(
        'input[placeholder="Describe your ideal audience..."]',
        "Developers and QA engineers"
      );
      await page.getByRole("button", { name: /Site Structure/i }).click();
      await page.waitForURL("**/onboarding/pages", { timeout: 15000 });
    });
  });
});
