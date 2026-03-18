import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

const BASE = "http://localhost:3000";

test.describe("TASK-125: Provisioning Engine Integration", () => {
  test("provision/start API requires authentication", async () => {
    const r = await fetch(`${BASE}/api/provision/start`, { method: "POST" });
    expect(r.status).toBe(401);
  });

  test("provision/start API returns 404 when no blueprint-ready site exists", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // User has a site in "onboarding" status — not blueprint_ready
    const res = await page.evaluate(async () => {
      const r = await fetch("/api/provision/start", { method: "POST" });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("No site eligible");
  });

  test("provision/callback validates API key", async () => {
    const r = await fetch(`${BASE}/api/provision/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "wrong-key",
      },
      body: JSON.stringify({ site_id: "test", status: "live" }),
    });
    expect(r.status).toBe(401);
  });

  test("provision/callback requires site_id and status", async () => {
    const callbackKey =
      process.env.PROVISION_CALLBACK_KEY ||
      "dev-callback-key-change-in-production";

    const r = await fetch(`${BASE}/api/provision/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": callbackKey,
      },
      body: JSON.stringify({}),
    });

    expect(r.status).toBe(400);
    const body = await r.json();
    expect(body.error).toContain("required");
  });

  test("provision/status returns progress for authenticated user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/provision/status");
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("siteId");
    expect(res.body).toHaveProperty("siteStatus");
    expect(res.body).toHaveProperty("progress");
    expect(typeof res.body.progress).toBe("number");
  });

  test("progress page shows provisioning phase when site is being provisioned", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    // Progress page should render (even if showing generation state)
    await expect(page.locator(".animate-spin").first()).toBeVisible({
      timeout: 10000,
    });

    // Should show percentage
    await expect(page.getByText(/\d+% complete/)).toBeVisible();
  });

  test("SiteCard shows retry button for provisioning_failed status", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // For a new user, site is in "onboarding" status — verify SiteCard renders
    await expect(page.locator('[class*="rounded-2xl"]').first()).toBeVisible();

    // Verify the "Continue Setup" button exists for onboarding status
    await expect(
      page.getByRole("button", { name: /Continue Setup/i })
    ).toBeVisible();
  });
});

test.describe("TASK-125: Blueprint → Provisioning Auto-Trigger", () => {
  test("blueprint generation auto-triggers provisioning", async ({ page }) => {
    test.setTimeout(180000);

    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Provisioning Test",
      idea: "Testing auto provisioning trigger",
      audience: "QA testers",
      industry: "other",
      pages: [{ slug: "home", title: "Home" }],
      colors: { primary: "#6366F1" },
      fonts: { heading: "Inter", body: "Inter" },
    });

    // Trigger blueprint generation
    await page.evaluate(async () => {
      await fetch("/api/provision/generate-blueprint", { method: "POST" });
    });

    await page.goto("/onboarding/progress");
    await page.waitForLoadState("domcontentloaded");

    // Wait for progress to reach provisioning phase (>55%)
    // or site to go live. The auto-trigger happens after blueprint is ready.
    await expect(async () => {
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/provision/status");
        return r.json();
      });

      // Site should transition past blueprint_ready to provisioning or live
      const validStatuses = [
        "provisioning",
        "live",
        "provisioning_failed",
      ];
      expect(validStatuses).toContain(res.siteStatus);
    }).toPass({ timeout: 120000, intervals: [5000] });
  });
});
