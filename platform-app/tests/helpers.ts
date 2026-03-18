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

  // Wait for redirect — dashboard-first flow sends to /dashboard,
  // but new users may redirect to /onboarding.
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  await page.waitForLoadState("domcontentloaded");

  return e;
}

export async function navigateToStep(
  page: Page,
  step: "name" | "idea" | "audience" | "pages" | "design" | "brand" | "fonts"
) {
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
    "A healthcare clinic providing wellness and medical services to patients"
  );
  await page.getByRole("button", { name: /Your Audience/i }).click();
  await page.waitForURL("**/onboarding/audience", { timeout: 10000 });
  if (step === "audience") return;

  // Fill audience and go to pages
  await page.fill(
    'input[placeholder="Describe your ideal audience..."]',
    "Patients and healthcare professionals"
  );
  await page.getByRole("button", { name: /Plan the Structure/i }).click();
  await page.waitForURL("**/onboarding/pages", { timeout: 15000 });
  // Wait for AI analysis to complete (spinner disappears, chips appear)
  await page.waitForSelector('text="Shape the Experience"', { timeout: 30000 });
  if (step === "pages") return;

  // Click through pages screen
  await page.getByRole("button", { name: /Shape the Experience/i }).click();
  await page.waitForURL("**/onboarding/design", { timeout: 10000 });
  if (step === "design") return;

  // Click through design screen (AI is default selected)
  await page.getByRole("button", { name: /Shape the Experience/i }).click();
  await page.waitForURL("**/onboarding/brand", { timeout: 10000 });
  if (step === "brand") return;

  // Click through brand screen (no upload required)
  await page.getByRole("button", { name: /Pick Your Fonts/i }).click();
  await page.waitForURL("**/onboarding/fonts", { timeout: 10000 });
}

/**
 * Seed onboarding data via API so we can jump directly to a screen
 * without walking through prior steps in every test.
 */
export async function seedOnboardingData(
  page: Page,
  data: Record<string, unknown>
) {
  const step = (data._step as string) || "audience";
  const payload = { ...data };
  delete payload._step;

  await page.evaluate(
    async ({ step, data }) => {
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data }),
      });
    },
    { step, data: payload }
  );
}
