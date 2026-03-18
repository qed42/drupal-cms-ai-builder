import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";

test.describe("TASK-109: Blueprint Generation API", () => {
  test("POST /api/provision/generate-blueprint requires authentication", async ({
    page,
  }) => {
    // Navigate to app first so relative URLs work in page.evaluate
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/provision/generate-blueprint", {
        method: "POST",
      });
      return { status: r.status };
    });
    expect(res.status).toBe(401);
  });

  test("GET /api/provision/status requires authentication", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/provision/status");
      return { status: r.status };
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/provision/generate-blueprint triggers generation and returns blueprintId", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // Seed onboarding data for a complete wizard flow
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Sunrise Medical Clinic",
      idea: "A healthcare clinic providing wellness and medical services",
      audience: "Patients and healthcare professionals",
      industry: "healthcare",
      tone: "professional_warm",
      compliance_flags: ["hipaa", "ada"],
      keywords: ["healthcare", "clinic", "wellness"],
      pages: [
        { slug: "home", title: "Home" },
        { slug: "services", title: "Services" },
        { slug: "about", title: "About Us" },
        { slug: "contact", title: "Contact" },
      ],
      colors: {
        primary: "#2563EB",
        secondary: "#1E3A5F",
        accent: "#10B981",
        light: "#EFF6FF",
      },
      fonts: { heading: "Montserrat", body: "Lato" },
    });

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/provision/generate-blueprint", {
        method: "POST",
      });
      const text = await r.text();
      try {
        return { status: r.status, body: JSON.parse(text) };
      } catch {
        return { status: r.status, body: { raw: text } };
      }
    });

    expect(res.status).toBe(200);
    expect(res.body.blueprintId).toBeTruthy();
    expect(res.body.siteId).toBeTruthy();
    expect(res.body.status).toBe("generating");
  });

  test("GET /api/provision/status returns generation progress after triggering", async ({
    page,
  }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Test Biz",
      idea: "A test business",
      audience: "Everyone",
    });

    // Trigger generation
    await page.evaluate(async () => {
      await fetch("/api/provision/generate-blueprint", { method: "POST" });
    });

    // Small wait to let generation start
    await page.waitForTimeout(1000);

    // Poll status
    const status = await page.evaluate(async () => {
      const r = await fetch("/api/provision/status");
      return { status: r.status, body: await r.json() };
    });

    expect(status.status).toBe(200);
    expect(status.body.siteId).toBeTruthy();
    expect(status.body.siteStatus).toBeTruthy();
    expect(status.body.generationStep).toBeTruthy();
    expect(typeof status.body.progress).toBe("number");
  });

  test("blueprint generation completes with ready status", async ({
    page,
  }) => {
    test.setTimeout(120000); // Allow up to 120s for AI generation + fallbacks

    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "fonts",
      name: "Quick Test Co",
      idea: "A professional services consulting firm",
      audience: "Business owners",
      industry: "professional_services",
      tone: "professional_warm",
      compliance_flags: [],
      keywords: ["consulting", "services"],
      pages: [
        { slug: "home", title: "Home" },
        { slug: "services", title: "Services" },
        { slug: "contact", title: "Contact" },
      ],
      colors: { primary: "#6366F1", secondary: "#1E1B4B" },
      fonts: { heading: "Inter", body: "Inter" },
    });

    // Trigger generation
    await page.evaluate(async () => {
      await fetch("/api/provision/generate-blueprint", { method: "POST" });
    });

    // Poll until complete or timeout
    let finalStatus: { generationStep: string; progress: number } | null = null;
    for (let i = 0; i < 35; i++) {
      await page.waitForTimeout(3000);
      const data = await page.evaluate(async () => {
        const r = await fetch("/api/provision/status");
        return r.json();
      });
      if (data.generationStep === "ready" || data.generationStep === "failed") {
        finalStatus = data;
        break;
      }
    }

    expect(finalStatus).not.toBeNull();
    expect(finalStatus!.generationStep).toBe("ready");
    expect(finalStatus!.progress).toBe(100);
  });
});
