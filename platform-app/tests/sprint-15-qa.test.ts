/**
 * Sprint 15 QA Tests: UX Overhaul Phase 1 — Identity & Trust
 *
 * Tests all 7 tasks:
 * - TASK-281: Brand token CSS path fix
 * - TASK-271: Product brand identity
 * - TASK-272: Auth screen redesign
 * - TASK-273: Onboarding visual overhaul
 * - TASK-274: Pre-generation review step
 * - TASK-275: Generation progress UX
 * - TASK-276: Dashboard redesign
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const PLATFORM = path.resolve(__dirname, "..");
const SRC = path.join(PLATFORM, "src");
const DRUPAL = path.resolve(PLATFORM, "..", "drupal-site");
const PROVISIONING = path.resolve(PLATFORM, "..", "provisioning");

// =====================================================================
// TASK-281: Brand token CSS path fix
// =====================================================================
describe("TASK-281: Brand tokens written to space_ds.settings config (v2)", () => {
  const brandServicePath = path.join(
    DRUPAL,
    "web/modules/custom/ai_site_builder/src/Service/BrandTokenService.php"
  );
  const applyBrandPath = path.join(
    PROVISIONING,
    "src/steps/09-apply-brand.ts"
  );

  it("brand tokens are written to space_ds.settings Drupal config (not CSS file)", () => {
    const content = fs.readFileSync(brandServicePath, "utf8");
    expect(content).toContain("space_ds.settings");
    expect(content).toContain("applyBrandSettings");
    // v2 no longer writes CSS files
    expect(content).not.toContain("brand-tokens.css");
  });

  it("BrandTokenService maps brand colors to theme setting keys", () => {
    const content = fs.readFileSync(brandServicePath, "utf8");
    expect(content).toContain("base_brand_color");
    expect(content).toContain("accent_color_primary");
    expect(content).toContain("accent_color_secondary");
  });

  it("BrandTokenService maps font settings to theme config", () => {
    const content = fs.readFileSync(brandServicePath, "utf8");
    expect(content).toContain("font_family");
    expect(content).toContain("mapToThemeFont");
  });

  it("provisioning step copies logo to Drupal files dir", () => {
    const content = fs.readFileSync(applyBrandPath, "utf8");
    expect(content).toContain("copyFile");
    expect(content).toContain("blueprint.brand.logo_url");
    expect(content).toContain("public://");
  });

  it("provisioning step handles missing logo gracefully", () => {
    const content = fs.readFileSync(applyBrandPath, "utf8");
    expect(content).toContain("existsSync(platformLogoPath)");
    expect(content).toContain("delete blueprint.brand.logo_url");
  });
});

// =====================================================================
// TASK-271: Product Brand Identity
// =====================================================================
describe("TASK-271: Product brand identity", () => {
  const brandPath = path.join(SRC, "lib/brand.ts");
  const globalsPath = path.join(SRC, "app/globals.css");
  const layoutPath = path.join(SRC, "app/layout.tsx");
  const faviconPath = path.join(PLATFORM, "public/favicon.svg");

  it("brand.ts exists with product name and tagline", () => {
    const content = fs.readFileSync(brandPath, "utf8");
    expect(content).toContain('name: "Space AI"');
    expect(content).toContain("tagline");
  });

  it("globals.css defines brand color tokens (teal palette)", () => {
    const content = fs.readFileSync(globalsPath, "utf8");
    expect(content).toContain("--color-brand-500");
    expect(content).toContain("--color-brand-600");
    expect(content).toContain("#14b8a6"); // teal-500
    expect(content).toContain("#0d9488"); // teal-600
  });

  it("no indigo or purple color references in globals.css", () => {
    const content = fs.readFileSync(globalsPath, "utf8");
    expect(content).not.toMatch(/indigo/i);
    expect(content).not.toMatch(/purple/i);
  });

  it("root layout uses Inter font, not Geist", () => {
    const content = fs.readFileSync(layoutPath, "utf8");
    expect(content).toContain("Inter");
    expect(content).not.toContain("Geist");
  });

  it("root layout metadata shows product name", () => {
    const content = fs.readFileSync(layoutPath, "utf8");
    expect(content).toContain("Space AI");
  });

  it("favicon.svg exists", () => {
    expect(fs.existsSync(faviconPath)).toBe(true);
    const content = fs.readFileSync(faviconPath, "utf8");
    expect(content).toContain("<svg");
    expect(content).toContain("#0d9488"); // brand-600
  });

  it("layout.tsx references favicon.svg in metadata", () => {
    const content = fs.readFileSync(layoutPath, "utf8");
    expect(content).toContain("favicon.svg");
  });

  it("no indigo/purple references remain in src/**/*.tsx files", () => {
    const tsxFiles = findFilesRecursive(SRC, ".tsx");
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf8");
      expect(content, `${path.relative(PLATFORM, file)} contains indigo`).not.toMatch(/\bindigo-\d/);
      expect(content, `${path.relative(PLATFORM, file)} contains purple`).not.toMatch(/\bpurple-\d/);
    }
  });

  it("no old gradient hex #0a0a2e remains in src/**/*.tsx files", () => {
    const tsxFiles = findFilesRecursive(SRC, ".tsx");
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf8");
      expect(content, `${path.relative(PLATFORM, file)} contains old gradient`).not.toContain("#0a0a2e");
    }
  });
});

// =====================================================================
// TASK-272: Auth screen redesign
// =====================================================================
describe("TASK-272: Auth screen redesign — split layout", () => {
  const authLayoutPath = path.join(SRC, "app/(auth)/layout.tsx");
  const loginPath = path.join(SRC, "app/(auth)/login/page.tsx");
  const registerPath = path.join(SRC, "app/(auth)/register/page.tsx");

  it("auth layout has two-panel structure (lg:w-1/2)", () => {
    const content = fs.readFileSync(authLayoutPath, "utf8");
    expect(content).toContain("lg:w-1/2");
    expect(content).toContain("hidden lg:flex");
  });

  it("auth layout includes value proposition content", () => {
    const content = fs.readFileSync(authLayoutPath, "utf8");
    expect(content).toContain("under 5 minutes");
    expect(content).toContain("Tell us about your business");
  });

  it("auth layout shows product logo/name", () => {
    const content = fs.readFileSync(authLayoutPath, "utf8");
    expect(content).toContain("BRAND.name");
  });

  it("login page has product logo", () => {
    const content = fs.readFileSync(loginPath, "utf8");
    expect(content).toContain("BRAND.name");
    expect(content).toContain('import { BRAND }');
  });

  it("register page has specific value messaging", () => {
    const content = fs.readFileSync(registerPath, "utf8");
    expect(content).toContain("under 5 minutes");
    expect(content).toContain("Get Started Free");
  });

  it("auth pages use bg-slate-950 not gradient for form panel", () => {
    const content = fs.readFileSync(authLayoutPath, "utf8");
    expect(content).toContain("bg-slate-950");
  });
});

// =====================================================================
// TASK-273: Onboarding visual overhaul
// =====================================================================
describe("TASK-273: Onboarding visual overhaul", () => {
  const stepIconPath = path.join(SRC, "components/onboarding/StepIcon.tsx");
  const stepLayoutPath = path.join(SRC, "components/onboarding/StepLayout.tsx");
  const progressDotsPath = path.join(SRC, "components/onboarding/ProgressDots.tsx");
  const startPath = path.join(SRC, "app/onboarding/start/page.tsx");
  const onboardingLayoutPath = path.join(SRC, "app/onboarding/layout.tsx");

  it("StepIcon component exists with icons for all steps", () => {
    const content = fs.readFileSync(stepIconPath, "utf8");
    const steps = ["start", "name", "idea", "audience", "pages", "design", "brand", "fonts", "tone", "review-settings"];
    for (const step of steps) {
      expect(content, `Missing icon for step: ${step}`).toContain(`${step}`);
    }
    // follow-up has quotes around the key
    expect(content).toContain("follow-up");
  });

  it("StepLayout uses StepIcon instead of pulsing bars", () => {
    const content = fs.readFileSync(stepLayoutPath, "utf8");
    expect(content).toContain("StepIcon");
    expect(content).not.toContain("pulse 1.5s");
    expect(content).not.toContain("scaleY");
  });

  it("ProgressDots shows step number and label", () => {
    const content = fs.readFileSync(progressDotsPath, "utf8");
    expect(content).toContain("Step");
    expect(content).toContain("currentLabel");
    expect(content).toContain("of {total}");
  });

  it("start page has compelling hero with brand", () => {
    const content = fs.readFileSync(startPath, "utf8");
    expect(content).toContain("BRAND.name");
    expect(content).toContain("designed");
    expect(content).toContain("built by AI");
    expect(content).toContain("No credit card required");
  });

  it("start page uses brand-500 CTA button, not white", () => {
    const content = fs.readFileSync(startPath, "utf8");
    expect(content).toContain("bg-brand-500");
    expect(content).toContain("shadow-brand-500");
  });

  it("onboarding layout does NOT contain pulse animation", () => {
    const content = fs.readFileSync(onboardingLayoutPath, "utf8");
    expect(content).not.toContain("@keyframes pulse");
    expect(content).not.toContain("scaleY");
  });
});

// =====================================================================
// TASK-274: Pre-generation review step
// =====================================================================
describe("TASK-274: Pre-generation review step", () => {
  const reviewSettingsPath = path.join(SRC, "app/onboarding/review-settings/page.tsx");
  const stepsPath = path.join(SRC, "lib/onboarding-steps.ts");
  const tonePath = path.join(SRC, "app/onboarding/tone/page.tsx");

  it("review-settings page exists", () => {
    expect(fs.existsSync(reviewSettingsPath)).toBe(true);
  });

  it("review-settings displays all user selections", () => {
    const content = fs.readFileSync(reviewSettingsPath, "utf8");
    const fields = ["Site Name", "Business Idea", "Audience", "Industry", "Pages", "Colors", "Fonts", "Tone"];
    for (const field of fields) {
      expect(content, `Missing field: ${field}`).toContain(field);
    }
  });

  it("review-settings has Generate My Website CTA", () => {
    const content = fs.readFileSync(reviewSettingsPath, "utf8");
    expect(content).toContain("Generate My Website");
  });

  it("review-settings shows time expectation", () => {
    const content = fs.readFileSync(reviewSettingsPath, "utf8");
    expect(content).toContain("2-3 minutes");
  });

  it("review-settings triggers generate-blueprint API", () => {
    const content = fs.readFileSync(reviewSettingsPath, "utf8");
    expect(content).toContain("/api/provision/generate-blueprint");
  });

  it("onboarding steps list includes review-settings", () => {
    const content = fs.readFileSync(stepsPath, "utf8");
    expect(content).toContain('"review-settings"');
    expect(content).toContain('"Review & Generate"');
  });

  it("onboarding steps has 11 total steps", () => {
    const content = fs.readFileSync(stepsPath, "utf8");
    // Count step definition entries (slug + label pairs in the array)
    const stepMatches = content.match(/\{ slug: "/g);
    expect(stepMatches).toHaveLength(11);
  });

  it("tone page navigates to review-settings, not directly to generation", () => {
    const content = fs.readFileSync(tonePath, "utf8");
    expect(content).toContain("review-settings");
    expect(content).not.toContain("generate-blueprint");
  });

  it("review-settings has Back button to tone step", () => {
    const content = fs.readFileSync(reviewSettingsPath, "utf8");
    expect(content).toContain('buildStepUrl("tone")');
  });
});

// =====================================================================
// TASK-275: Generation progress UX
// =====================================================================
describe("TASK-275: Generation progress UX — user-friendly labels", () => {
  const pipelineProgressPath = path.join(SRC, "components/onboarding/PipelineProgress.tsx");
  const progressPagePath = path.join(SRC, "app/onboarding/progress/page.tsx");

  it("pipeline labels are user-friendly, not technical", () => {
    const content = fs.readFileSync(pipelineProgressPath, "utf8");
    // Should have user labels
    expect(content).toContain("Analyzing your business");
    expect(content).toContain("Designing your pages");
    expect(content).toContain("Writing your content");
    expect(content).toContain("Adding images");
    // Should NOT have technical labels
    expect(content).not.toMatch(/label:\s*"Research"/);
    expect(content).not.toMatch(/label:\s*"Plan"/);
    expect(content).not.toMatch(/label:\s*"Generate"/);
  });

  it("progress page shows Review Your Website CTA", () => {
    const content = fs.readFileSync(progressPagePath, "utf8");
    expect(content).toContain("Review Your Website");
  });

  it("progress page shows completion summary with page count", () => {
    const content = fs.readFileSync(progressPagePath, "utf8");
    expect(content).toContain("pageNames");
    expect(content).toContain("page");
    expect(content).toContain("generated");
  });

  it("progress page communicates time expectation", () => {
    const content = fs.readFileSync(progressPagePath, "utf8");
    expect(content).toContain("2-3 minutes");
  });

  it("error state provides reassurance about data safety", () => {
    const content = fs.readFileSync(progressPagePath, "utf8");
    expect(content).toContain("data is safe");
  });
});

// =====================================================================
// TASK-276: Dashboard redesign
// =====================================================================
describe("TASK-276: Dashboard redesign", () => {
  const dashLayoutPath = path.join(SRC, "app/dashboard/layout.tsx");
  const siteCardPath = path.join(SRC, "components/dashboard/SiteCard.tsx");

  it("dashboard layout shows product logo and name", () => {
    const content = fs.readFileSync(dashLayoutPath, "utf8");
    expect(content).toContain("BRAND.name");
    expect(content).toContain('import { BRAND }');
  });

  it("dashboard has navigation links", () => {
    const content = fs.readFileSync(dashLayoutPath, "utf8");
    expect(content).toContain("Sites");
    expect(content).toContain("Settings");
    expect(content).toContain("Help");
  });

  it("site card has visual avatar with initial letter", () => {
    const content = fs.readFileSync(siteCardPath, "utf8");
    expect(content).toContain("toUpperCase()");
    expect(content).toContain("rounded-xl");
    expect(content).toContain("brand-500/10");
  });

  it("site card has color bar for live status", () => {
    const content = fs.readFileSync(siteCardPath, "utf8");
    expect(content).toContain("bg-gradient-to-r from-brand-500 to-brand-400");
  });

  it("site card has Visit Site button for live sites", () => {
    const content = fs.readFileSync(siteCardPath, "utf8");
    expect(content).toContain("Visit Site");
    expect(content).toContain('target="_blank"');
    expect(content).toContain('rel="noopener noreferrer"');
  });

  it("developer actions are behind overflow menu", () => {
    const content = fs.readFileSync(siteCardPath, "utf8");
    expect(content).toContain("menuOpen");
    expect(content).toContain("Download Blueprint");
    // Blueprint JSON should NOT be a primary button anymore
    expect(content).not.toMatch(/className="rounded-lg border.*Blueprint JSON/);
  });

  it("overflow menu closes on outside click", () => {
    const content = fs.readFileSync(siteCardPath, "utf8");
    expect(content).toContain("handleClick");
    expect(content).toContain("mousedown");
    expect(content).toContain("menuRef");
  });
});

// =====================================================================
// Cross-cutting: No regressions
// =====================================================================
describe("Sprint 15: Cross-cutting quality checks", () => {
  it("globals.css uses Inter font variable", () => {
    const content = fs.readFileSync(path.join(SRC, "app/globals.css"), "utf8");
    expect(content).toContain("--font-inter");
  });

  it("brand.ts exports BRAND constant", () => {
    const content = fs.readFileSync(path.join(SRC, "lib/brand.ts"), "utf8");
    expect(content).toContain("export const BRAND");
  });

  it("review-settings page is a client component", () => {
    const content = fs.readFileSync(path.join(SRC, "app/onboarding/review-settings/page.tsx"), "utf8");
    expect(content.trimStart().startsWith('"use client"')).toBe(true);
  });

  it("StepIcon is a client component", () => {
    const content = fs.readFileSync(path.join(SRC, "components/onboarding/StepIcon.tsx"), "utf8");
    expect(content.trimStart().startsWith('"use client"')).toBe(true);
  });

  it("all brand color shades defined (50 through 950)", () => {
    const content = fs.readFileSync(path.join(SRC, "app/globals.css"), "utf8");
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(content).toContain(`--color-brand-${shade}`);
    }
  });
});

// =====================================================================
// Helpers
// =====================================================================
function findFilesRecursive(dir: string, ext: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesRecursive(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}
