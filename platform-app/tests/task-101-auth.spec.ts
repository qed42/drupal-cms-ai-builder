import { test, expect } from "@playwright/test";
import { uniqueEmail, registerViaAPI, registerAndLogin } from "./helpers";

test.describe("TASK-101: Authentication System", () => {
  test.describe("Registration", () => {
    test("user can register with email + password via UI", async ({ page }) => {
      const email = uniqueEmail("reg");

      await page.goto("/register");
      await expect(
        page.getByRole("heading", { name: "Create your account" })
      ).toBeVisible();

      await page.fill("#name", "QA Tester");
      await page.fill("#email", email);
      await page.fill("#password", "password123");
      await page.getByRole("button", { name: "Get Started" }).click();

      await page.waitForURL("**/onboarding/start", { timeout: 15000 });
      await expect(page).toHaveURL(/\/onboarding\/start/);
    });

    test("duplicate email shows error", async ({ page }) => {
      const email = uniqueEmail("dup");
      await registerViaAPI(email);

      await page.goto("/register");
      await page.fill("#name", "Second User");
      await page.fill("#email", email);
      await page.fill("#password", "password123");
      await page.getByRole("button", { name: "Get Started" }).click();

      await expect(
        page.getByText("An account with this email already exists")
      ).toBeVisible({ timeout: 10000 });
    });

    test("registration creates user + site + subscription records via API", async () => {
      const email = uniqueEmail("api");
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "API Test",
          email,
          password: "password123",
        }),
      });

      expect(res.ok).toBeTruthy();
      const body = await res.json();
      expect(body.id).toBeTruthy();
      expect(body.email).toBe(email);
    });
  });

  test.describe("Login", () => {
    test("user can log in with credentials", async ({ page }) => {
      const email = uniqueEmail("login");
      await registerViaAPI(email);

      await page.goto("/login");
      await expect(
        page.getByRole("heading", { name: "Welcome back" })
      ).toBeVisible();

      await page.fill("#email", email);
      await page.fill("#password", "password123");
      await page.getByRole("button", { name: "Sign In" }).click();

      await page.waitForURL("**/onboarding/start", { timeout: 15000 });
      await expect(page).toHaveURL(/\/onboarding\/start/);
    });

    test("invalid credentials show error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#email", "wrong@test.com");
      await page.fill("#password", "wrongpassword");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(
        page.getByText("Invalid email or password")
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Route Protection", () => {
    test("onboarding route redirects unauthenticated users to login", async ({
      page,
    }) => {
      await page.goto("/onboarding/start");
      await page.waitForURL("**/login**", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });

    test("dashboard route redirects to login", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForURL("**/login**", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Session Persistence", () => {
    test("session persists across page navigation", async ({ page }) => {
      await registerAndLogin(page);
      // registerAndLogin lands on onboarding/start

      // Navigate to name step
      await page.getByRole("button", { name: /Start Building/i }).click();
      await page.waitForURL("**/onboarding/name", { timeout: 10000 });

      // Still on onboarding (not redirected to login)
      await expect(page).toHaveURL(/\/onboarding\/name/);
      await expect(
        page.getByRole("heading", { name: "What are we calling this?" })
      ).toBeVisible();
    });
  });
});
