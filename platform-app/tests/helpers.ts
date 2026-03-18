import { type Page } from "@playwright/test";

const BASE = "http://localhost:3000";

export function uniqueEmail(prefix = "qa") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
}

export async function registerViaAPI(
  email: string,
  password = "password123",
  name = "QA Tester"
) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function registerAndLogin(page: Page, email?: string, password = "password123") {
  const e = email ?? uniqueEmail();

  // Register via API
  await registerViaAPI(e, password);

  // Login via UI
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.fill("#email", e);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for redirect to onboarding
  await page.waitForURL("**/onboarding/**", { timeout: 15000 });
  await page.waitForLoadState("domcontentloaded");

  return e;
}

export async function navigateToStep(page: Page, step: "name" | "idea" | "audience") {
  // Click Start Building on start page
  await page.getByRole("button", { name: /Start Building/i }).click();
  await page.waitForURL("**/onboarding/name", { timeout: 10000 });
  if (step === "name") return;

  // Fill name and go to idea
  await page.fill('input[placeholder="Name of the Project"]', "Test Project");
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.waitForURL("**/onboarding/idea", { timeout: 10000 });
  if (step === "idea") return;

  // Fill idea and go to audience
  await page.fill(
    'textarea[placeholder="Describe your project or business..."]',
    "A test project idea"
  );
  await page.getByRole("button", { name: /Your Audience/i }).click();
  await page.waitForURL("**/onboarding/audience", { timeout: 10000 });
}
