import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail, registerViaAPI } from "./helpers";

test.describe("TASK-124: Dashboard-First UX Flow", () => {
  test("authenticated user accessing /login is redirected to /dashboard", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // Now try to visit /login while already logged in
    await page.goto("/login");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("authenticated user accessing /register is redirected to /dashboard", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/register");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("unauthenticated user accessing /dashboard is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user accessing /onboarding is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/onboarding/start");
    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("dashboard shows 'Add new website' button", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("button", { name: /Add new website/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("'Add new website' creates a new site and redirects to onboarding", async ({
    page,
  }) => {
    test.setTimeout(30000);
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const addBtn = page.getByRole("button", { name: /Add new website/i });
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Should redirect to onboarding start
    await page.waitForURL("**/onboarding/**", { timeout: 15000 });
  });
});
