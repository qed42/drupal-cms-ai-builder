import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail, seedOnboardingData } from "./helpers";

const BASE = "http://localhost:3000";

test.describe("TASK-104: AI Industry Inference & Page Suggestion", () => {
  test.describe("API: /api/ai/analyze", () => {
    test("returns 401 for unauthenticated requests", async ({ request }) => {
      const res = await request.post(`${BASE}/api/ai/analyze`, {
        data: { idea: "A medical clinic", audience: "patients" },
      });
      expect(res.status()).toBe(401);
    });

    test("returns 400 when idea is missing", async ({ page }) => {
      await registerAndLogin(page);
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audience: "patients" }),
        });
        return { status: r.status, body: await r.json() };
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("idea is required");
    });

    test("healthcare description returns healthcare industry with hipaa flag (fallback)", async ({
      page,
    }) => {
      await registerAndLogin(page);
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: "A medical clinic providing health and wellness services to patients",
            audience: "Patients seeking medical care",
          }),
        });
        return r.json();
      });
      expect(res.industry).toBe("healthcare");
      expect(res.compliance_flags).toContain("hipaa");
      expect(res.keywords).toBeDefined();
      expect(Array.isArray(res.keywords)).toBe(true);
      expect(res.tone).toBeDefined();
    });

    test("legal description returns legal industry with attorney_advertising flag (fallback)", async ({
      page,
    }) => {
      await registerAndLogin(page);
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: "A law firm specializing in litigation and attorney services",
            audience: "People needing legal help",
          }),
        });
        return r.json();
      });
      expect(res.industry).toBe("legal");
      expect(res.compliance_flags).toContain("attorney_advertising");
    });

    test("results saved to onboarding session", async ({ page }) => {
      await registerAndLogin(page);
      // Call analyze
      await page.evaluate(async () => {
        await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: "A restaurant serving food and dining experiences",
            audience: "Foodies",
          }),
        });
      });
      // Verify saved via resume
      const resumed = await page.evaluate(async () => {
        const r = await fetch("/api/onboarding/resume");
        return r.json();
      });
      expect(resumed.data.industry).toBe("restaurant");
    });
  });

  test.describe("API: /api/ai/suggest-pages", () => {
    test("returns 401 for unauthenticated requests", async ({ request }) => {
      const res = await request.post(`${BASE}/api/ai/suggest-pages`, {
        data: { industry: "healthcare", idea: "A clinic", audience: "patients" },
      });
      expect(res.status()).toBe(401);
    });

    test("returns 400 when industry or idea missing", async ({ page }) => {
      await registerAndLogin(page);
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/ai/suggest-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audience: "patients" }),
        });
        return { status: r.status, body: await r.json() };
      });
      expect(res.status).toBe(400);
    });

    test("returns 5-8 pages for healthcare industry (fallback defaults)", async ({
      page,
    }) => {
      await registerAndLogin(page);
      const res = await page.evaluate(async () => {
        const r = await fetch("/api/ai/suggest-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: "healthcare",
            idea: "A medical clinic",
            audience: "patients",
          }),
        });
        return r.json();
      });
      expect(res.pages).toBeDefined();
      expect(res.pages.length).toBeGreaterThanOrEqual(3);
      expect(res.pages.length).toBeLessThanOrEqual(8);
      // Each page should have slug, title, required
      for (const p of res.pages) {
        expect(p.slug).toBeDefined();
        expect(p.title).toBeDefined();
        expect(typeof p.required).toBe("boolean");
      }
    });

    test("suggested pages saved to onboarding session", async ({ page }) => {
      await registerAndLogin(page);
      await page.evaluate(async () => {
        await fetch("/api/ai/suggest-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry: "legal",
            idea: "A law firm",
            audience: "clients",
          }),
        });
      });
      const resumed = await page.evaluate(async () => {
        const r = await fetch("/api/onboarding/resume");
        return r.json();
      });
      expect(resumed.data.suggested_pages).toBeDefined();
      expect(resumed.data.suggested_pages.length).toBeGreaterThanOrEqual(3);
    });
  });
});
