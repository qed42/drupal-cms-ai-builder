import { test, expect } from "@playwright/test";
import { registerAndLogin, seedOnboardingData } from "./helpers";
import path from "path";
import fs from "fs";

// Create a tiny test PNG for upload tests
function createTestPNG(): string {
  const testDir = path.join(__dirname, "fixtures");
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  const filePath = path.join(testDir, "test-logo.png");
  if (!fs.existsSync(filePath)) {
    // Minimal valid 1x1 red PNG
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(filePath, png);
  }
  return filePath;
}

test.describe("TASK-107: Wizard Screen 6 — Brand Assets", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedOnboardingData(page, {
      _step: "design",
      name: "Test",
      idea: "A test project",
      design_source: "ai",
    });
  });

  test("displays correct title, subtitle, and button", async ({ page }) => {
    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByRole("heading", { name: /Show us your brand/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("Drop your logo or brand kit")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Next: Brand & Style/i })
    ).toBeVisible();
  });

  test("shows two upload zones — logo and palette reference", async ({ page }) => {
    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Add logo")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Add color palette reference")).toBeVisible();
  });

  test("logo upload works and triggers color extraction", async ({ page }) => {
    const testPNG = createTestPNG();

    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    // Wait for page to load
    await expect(page.getByText("Add logo")).toBeVisible({ timeout: 10000 });

    // Upload file via the hidden input inside the logo upload zone
    const fileInput = page.locator('input[type="file"][accept=".png,.jpg,.jpeg,.svg"]');
    await fileInput.setInputFiles(testPNG);

    // Wait for upload + color extraction to complete
    // After upload, the filename should appear as the current file indicator
    await expect(page.getByText("test-logo.png")).toBeVisible({ timeout: 15000 });

    // Colors should be extracted — look for "Extracted Colors" section
    await expect(page.getByText("Extracted Colors")).toBeVisible({ timeout: 15000 });
  });

  test("uploaded file shows Remove link", async ({ page }) => {
    const testPNG = createTestPNG();

    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    const fileInput = page.locator('input[type="file"][accept=".png,.jpg,.jpeg,.svg"]');
    await fileInput.setInputFiles(testPNG);

    await expect(page.getByText("test-logo.png")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
  });

  test("Remove button clears uploaded file", async ({ page }) => {
    const testPNG = createTestPNG();

    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    const fileInput = page.locator('input[type="file"][accept=".png,.jpg,.jpeg,.svg"]');
    await fileInput.setInputFiles(testPNG);

    await expect(page.getByText("test-logo.png")).toBeVisible({ timeout: 15000 });

    // Click Remove
    await page.getByRole("button", { name: "Remove" }).first().click();

    // Upload zone should reappear
    await expect(page.getByText("Add logo")).toBeVisible();
    await expect(page.getByText("test-logo.png")).not.toBeVisible();
  });

  test("user can add manual colors via '+' button", async ({ page }) => {
    // Seed with existing colors so the color section is visible
    await seedOnboardingData(page, {
      _step: "design",
      colors: { primary: "#FF0000", secondary: "#00FF00" },
    });

    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText("Extracted Colors")).toBeVisible();

    // Click the "+" add color button
    await page.getByTitle("Add color").click();

    // Should now have 3 swatches (primary, secondary, + new one)
    const swatchButtons = page.locator('button[style*="background-color"]');
    await expect(swatchButtons).toHaveCount(3);
  });

  test("navigates to fonts screen on submit", async ({ page }) => {
    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Show us your brand/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /Next: Brand & Style/i }).click();
    await page.waitForURL("**/onboarding/fonts", { timeout: 10000 });
  });

  test("has Back button navigating to design step", async ({ page }) => {
    await page.goto("/onboarding/brand");
    await page.waitForLoadState("domcontentloaded");

    // Wait for page to load
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Back" }).click();
    await page.waitForURL("**/onboarding/design", { timeout: 10000 });
  });
});

test.describe("TASK-107: Upload API", () => {
  test("upload API returns 401 for unauthenticated requests", async ({ request }) => {
    const res = await request.post("http://localhost:3000/api/upload", {
      multipart: {
        type: "logo",
        file: {
          name: "test.png",
          mimeType: "image/png",
          buffer: Buffer.from("fake"),
        },
      },
    });
    expect(res.status()).toBe(401);
  });
});
