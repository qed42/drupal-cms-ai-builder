import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

const BASE = "http://localhost:3000";

test.describe("TASK-116: Auto-Login JWT Flow", () => {
  test("create-login-token API requires authentication", async () => {
    // Call the API without being logged in — should 401
    const r = await fetch(`${BASE}/api/auth/create-login-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: "fake-id" }),
    });

    expect(r.status).toBe(401);
    const body = await r.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("create-login-token API requires siteId", async ({ page }) => {
    await registerAndLogin(page);

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/auth/create-login-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("required");
  });

  test("create-login-token API rejects non-existent site", async ({
    page,
  }) => {
    await registerAndLogin(page);

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/auth/create-login-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: "non-existent-id-12345" }),
      });
      return { status: r.status, body: await r.json() };
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("not found");
  });

  test("create-login-token API rejects site without drupalUrl", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // Get the user's site (created during registration)
    const siteId = await page.evaluate(async () => {
      const r = await fetch("/api/provision/status");
      const data = await r.json();
      return data.siteId;
    });

    if (!siteId) {
      test.skip(true, "No site found — registration flow may have changed");
      return;
    }

    const res = await page.evaluate(async (id: string) => {
      const r = await fetch("/api/auth/create-login-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: id }),
      });
      return { status: r.status, body: await r.json() };
    }, siteId);

    // Site exists but has no drupalUrl yet (onboarding status)
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("not yet provisioned");
  });
});
