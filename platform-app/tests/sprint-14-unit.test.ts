import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.join(__dirname, "..", "src");

describe("Sprint 14: Blueprint Validation & AI Regeneration", () => {
  // === TASK-270: Sprint 13 Bug Fixes (verification) ===
  describe("TASK-270: Sprint 13 Bug Fix Verification", () => {
    it("no [id] route directory exists under /api/blueprint/ (BUG-S13-001)", () => {
      const idRouteDir = path.join(SRC, "app/api/blueprint/[id]");
      expect(fs.existsSync(idRouteDir)).toBe(false);
    });

    it("only [siteId] route directory exists under /api/blueprint/", () => {
      const siteIdRouteDir = path.join(SRC, "app/api/blueprint/[siteId]");
      expect(fs.existsSync(siteIdRouteDir)).toBe(true);
    });

    it("ApproveButton has no duplicate functions (BUG-S13-002)", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      // Should have a single startProvisioning function, not handleApprove + handleSkip
      expect(content).toContain("startProvisioning");
      expect(content).not.toMatch(/function handleApprove/);
      expect(content).not.toMatch(/function handleSkip/);
    });

    it("review page has back-to-dashboard navigation (BUG-S13-003)", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain('"/dashboard"');
      expect(content).toContain("Back to Dashboard");
    });
  });

  // === TASK-268: Component Prop Validator ===
  describe("TASK-268: Component Prop Validator", () => {
    const validatorPath = path.join(SRC, "lib/blueprint/component-validator.ts");

    it("component-validator.ts exists", () => {
      expect(fs.existsSync(validatorPath)).toBe(true);
    });

    it("exports validateSections function", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("export function validateSections");
    });

    it("exports formatValidationFeedback function", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("export function formatValidationFeedback");
    });

    it("exports getValidProps function", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("export function getValidProps");
    });

    it("exports getManifestComponent function", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("export function getManifestComponent");
    });

    it("loads and indexes the Space DS component manifest", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("space-component-manifest.json");
      expect(content).toContain("manifestIndex");
    });

    it("strips invalid props (warning) from generated sections", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("Stripped invalid prop");
    });

    it("flags unknown component IDs as errors", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("Unknown component");
      expect(content).toContain("does not exist in the Space DS manifest");
    });

    it("fills missing required props from defaults", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("Added default value");
      expect(content).toContain("for required prop");
    });

    it("validates enum prop values", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("Invalid enum value");
    });

    it("returns ValidationResult with valid, issues, and sanitizedSections", () => {
      const content = fs.readFileSync(validatorPath, "utf8");
      expect(content).toContain("export interface ValidationResult");
      expect(content).toContain("valid: boolean");
      expect(content).toContain("issues: ValidationIssue[]");
      expect(content).toContain("sanitizedSections: PageSection[]");
    });
  });

  // === TASK-269: Pipeline Integration & Prompt Fix ===
  describe("TASK-269: Validator Integration in Generate Pipeline", () => {
    const generatePath = path.join(SRC, "lib/pipeline/phases/generate.ts");

    it("generate.ts imports component validator", () => {
      const content = fs.readFileSync(generatePath, "utf8");
      expect(content).toContain("validateSections");
      expect(content).toContain("formatValidationFeedback");
      expect(content).toContain("component-validator");
    });

    it("generate.ts has prop validation retry loop", () => {
      const content = fs.readFileSync(generatePath, "utf8");
      expect(content).toContain("MAX_PROP_RETRIES");
      expect(content).toContain("COMPONENT PROP VALIDATION ERROR");
    });

    it("generate.ts uses sanitized sections from validator", () => {
      const content = fs.readFileSync(generatePath, "utf8");
      expect(content).toContain("validation.sanitizedSections");
    });

    it("generate.ts logs validation warnings", () => {
      const content = fs.readFileSync(generatePath, "utf8");
      expect(content).toContain("[generate] Page");
      expect(content).toContain("prop validation");
    });
  });

  describe("TASK-269: Page Generation Prompt Fix", () => {
    const promptPath = path.join(SRC, "lib/ai/prompts/page-generation.ts");

    it("prompt imports getManifestComponent", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      expect(content).toContain("getManifestComponent");
      expect(content).toContain("component-validator");
    });

    it("prompt has buildComponentPropReference function", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      expect(content).toContain("function buildComponentPropReference");
    });

    it("prompt no longer has hardcoded incorrect description prop for hero", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      // The old hardcoded example was: hero: '{"title":"...","sub_headline":"...","description":"..."}'
      expect(content).not.toContain(`hero: '{"title":"...","sub_headline":"...","description":"..."}'`);
    });

    it("prompt includes Component Prop Reference section", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      expect(content).toContain("Component Prop Reference");
      expect(content).toContain("ONLY use props listed here");
    });

    it("prompt instructs AI not to invent props", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      expect(content).toContain("CRITICAL: Only use props that are listed");
    });

    it("prompt references hero-banner-style-01 without description prop", () => {
      const content = fs.readFileSync(promptPath, "utf8");
      expect(content).toContain("space-hero-banner-style-01");
      // The prop reference is generated from manifest — hero-01 should NOT have description
      expect(content).not.toContain('hero: \'{"title":"...","sub_headline":"...","description":"..."}\'');
    });
  });

  // === TASK-268: Component tree builder updated ===
  describe("TASK-268: Component Tree Builder Update", () => {
    const builderPath = path.join(SRC, "lib/blueprint/component-tree-builder.ts");

    it("component-tree-builder.ts no longer has hardcoded REQUIRED_PROP_DEFAULTS map", () => {
      const content = fs.readFileSync(builderPath, "utf8");
      expect(content).not.toContain("REQUIRED_PROP_DEFAULTS: Record<string");
      expect(content).not.toContain('"space_ds:space-cta-banner-type-1": { width:');
    });

    it("component-tree-builder.ts wraps organisms in space-container (TASK-282)", () => {
      const content = fs.readFileSync(builderPath, "utf8");
      expect(content).toContain("space-container");
      expect(content).toContain("SKIP_CONTAINER");
    });
  });

  // === TASK-233: Per-Section AI Regeneration ===
  describe("TASK-233: Per-Section AI Regeneration", () => {
    const regenBtnPath = path.join(SRC, "app/onboarding/review/components/RegenerateButton.tsx");
    const regenApiPath = path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts");
    const regenPromptPath = path.join(SRC, "lib/ai/prompts/section-regeneration.ts");

    it("RegenerateButton.tsx exists", () => {
      expect(fs.existsSync(regenBtnPath)).toBe(true);
    });

    it("regenerate-section API route exists", () => {
      expect(fs.existsSync(regenApiPath)).toBe(true);
    });

    it("section-regeneration.ts prompt exists", () => {
      expect(fs.existsSync(regenPromptPath)).toBe(true);
    });

    it("RegenerateButton has guidance input", () => {
      const content = fs.readFileSync(regenBtnPath, "utf8");
      expect(content).toContain("guidance");
    });

    it("RegenerateButton passes previousSection for undo support", () => {
      const content = fs.readFileSync(regenBtnPath, "utf8");
      expect(content).toContain("previousSection");
    });

    it("regenerate-section API validates component props", () => {
      const content = fs.readFileSync(regenApiPath, "utf8");
      expect(content).toContain("validateSections");
    });

    it("PagePreview renders RegenerateButton", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      expect(content).toContain("RegenerateButton");
    });
  });

  // === TASK-234: Per-Page Regeneration ===
  describe("TASK-234: Per-Page Regeneration", () => {
    const regenPageApiPath = path.join(SRC, "app/api/blueprint/[siteId]/regenerate-page/route.ts");

    it("regenerate-page API route exists", () => {
      expect(fs.existsSync(regenPageApiPath)).toBe(true);
    });

    it("regenerate-page API uses research brief and plan context", () => {
      const content = fs.readFileSync(regenPageApiPath, "utf8");
      expect(content).toContain("research");
      expect(content).toContain("plan");
    });

    it("regenerate-page API validates component props", () => {
      const content = fs.readFileSync(regenPageApiPath, "utf8");
      expect(content).toContain("validateSections");
    });

    it("PagePreview has regenerate page button", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      expect(content).toContain("Regenerate Page");
    });
  });

  // === TASK-235: Page Add/Remove from Review ===
  describe("TASK-235: Page Add/Remove from Review", () => {
    const addPageApiPath = path.join(SRC, "app/api/blueprint/[siteId]/add-page/route.ts");
    const removePageApiPath = path.join(SRC, "app/api/blueprint/[siteId]/remove-page/route.ts");

    it("add-page API route exists", () => {
      expect(fs.existsSync(addPageApiPath)).toBe(true);
    });

    it("remove-page API route exists", () => {
      expect(fs.existsSync(removePageApiPath)).toBe(true);
    });

    it("add-page API enforces max 15 pages limit", () => {
      const content = fs.readFileSync(addPageApiPath, "utf8");
      expect(content).toContain("15");
    });

    it("add-page API validates generated component props", () => {
      const content = fs.readFileSync(addPageApiPath, "utf8");
      expect(content).toContain("validateSections");
    });

    it("PageSidebar has Add Page button", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"),
        "utf8"
      );
      expect(content).toContain("Add Page");
    });

    it("PageSidebar has Remove Page option", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"),
        "utf8"
      );
      expect(content).toContain("Remove");
    });
  });
});
