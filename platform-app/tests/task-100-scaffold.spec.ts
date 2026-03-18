import { test, expect } from "@playwright/test";

test.describe("TASK-100: Next.js App Scaffold + DB Schema", () => {
  test("app boots and serves at localhost:3000", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test("health check API returns ok with DB connected", async ({ page }) => {
    await page.goto("/api/health");
    const body = JSON.parse(await page.locator("body").innerText());
    expect(body.status).toBe("ok");
    expect(body.db).toBe("connected");
  });
});
