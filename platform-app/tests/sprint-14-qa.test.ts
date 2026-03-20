import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.join(__dirname, "..", "src");

describe("Sprint 14 QA: Blueprint Validation & AI Regeneration", () => {
  // === TASK-268 QA: Component Validator Correctness ===
  describe("QA: Component Validator loads full manifest", () => {
    it("manifest JSON has 31 components (v2 compositional model)", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      expect(manifest.length).toBe(31);
    });

    it("validator handles all v2 component categories", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      const categories = [...new Set(manifest.map((c: { category: string }) => c.category))];
      expect(categories).toContain("base");
      expect(categories).toContain("atom");
      expect(categories).toContain("molecule");
      expect(categories).toContain("organism");
    });

    it("space-hero-banner-style-02 exists as the primary hero in v2", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      const hero02 = manifest.find((c: { id: string }) => c.id === "space_ds:space-hero-banner-style-02");
      expect(hero02).toBeDefined();
      const propNames = hero02.props.map((p: { name: string }) => p.name);
      expect(propNames).toContain("title");
    });

    it("v1 hero-banner-style-01 is removed in v2 manifest", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      const hero01 = manifest.find((c: { id: string }) => c.id === "space_ds:space-hero-banner-style-01");
      expect(hero01).toBeUndefined();
    });

    it("v2 manifest includes compositional base components (container, flexi)", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      const container = manifest.find((c: { id: string }) => c.id === "space_ds:space-container");
      const flexi = manifest.find((c: { id: string }) => c.id === "space_ds:space-flexi");
      expect(container).toBeDefined();
      expect(flexi).toBeDefined();
    });

    it("cta-banner-type-1 has required props width and alignment", () => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(SRC, "lib/ai/space-component-manifest.json"), "utf8")
      );
      const cta1 = manifest.find((c: { id: string }) => c.id === "space_ds:space-cta-banner-type-1");
      const requiredProps = cta1.props
        .filter((p: { required: boolean }) => p.required)
        .map((p: { name: string }) => p.name)
        .sort();
      expect(requiredProps).toContain("width");
      expect(requiredProps).toContain("alignment");
    });
  });

  // === TASK-269 QA: Pipeline Integration ===
  describe("QA: Generate pipeline validation integration", () => {
    it("generate.ts calls validateSections on parsed sections", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8"
      );
      // Verify both parsing and validation exist in the generate function
      expect(content).toContain("safeParsePropsJson");
      expect(content).toContain("validateSections(sections)");
      // Validation result is used to sanitize sections
      expect(content).toContain("validation.sanitizedSections");
    });

    it("generate.ts feeds validation errors back to AI on retry", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/pipeline/phases/generate.ts"), "utf8"
      );
      expect(content).toContain("formatValidationFeedback");
      expect(content).toContain("COMPONENT PROP VALIDATION ERROR");
      expect(content).toContain("corrected JSON with only valid props");
    });

    it("page-generation prompt no longer suggests description for hero-01", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/ai/prompts/page-generation.ts"), "utf8"
      );
      // The old hardcoded line was: hero: '{"title":"...","sub_headline":"...","description":"..."}'
      expect(content).not.toContain('hero: \'{"title":"...","sub_headline":"...","description":"..."}\'');
    });

    it("page-generation prompt references buildComponentPropReference", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/ai/prompts/page-generation.ts"), "utf8"
      );
      expect(content).toContain("buildComponentPropReference()");
    });
  });

  // === TASK-233 QA: Section Regeneration ===
  describe("QA: Section regeneration API correctness", () => {
    it("regenerate-section route validates against manifest", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts"), "utf8"
      );
      expect(content).toContain("validateSections");
      expect(content).toContain("sanitizedSections");
    });

    it("regenerate-section route loads pipeline context from DB", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts"), "utf8"
      );
      expect(content).toContain("loadPipelineContext");
    });

    it("regenerate-section route returns previousSection for undo", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts"), "utf8"
      );
      expect(content).toContain("previousSection");
      // Verify it's in the response
      expect(content).toMatch(/NextResponse\.json\(\{[\s\S]*previousSection/);
    });

    it("regenerate-section rebuilds component tree after update", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts"), "utf8"
      );
      expect(content).toContain("buildComponentTree");
    });

    it("regenerate-section enforces review status", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-section/route.ts"), "utf8"
      );
      expect(content).toContain('"review"');
      expect(content).toContain("Regeneration is only allowed during review");
    });

    it("section-regeneration prompt includes surrounding sections context", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/ai/prompts/section-regeneration.ts"), "utf8"
      );
      expect(content).toContain("surroundingSections");
      expect(content).toContain("Surrounding Sections");
    });

    it("section-regeneration prompt references valid props from manifest", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/ai/prompts/section-regeneration.ts"), "utf8"
      );
      expect(content).toContain("getManifestComponent");
      expect(content).toContain("Valid props for");
    });

    it("PagePreview renders undo button after regeneration", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"), "utf8"
      );
      expect(content).toContain("undoSection");
      expect(content).toContain("handleUndo");
      expect(content).toContain("Undo");
    });
  });

  // === TASK-234 QA: Page Regeneration ===
  describe("QA: Page regeneration API correctness", () => {
    it("regenerate-page route validates all sections", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-page/route.ts"), "utf8"
      );
      expect(content).toContain("validateSections(sections)");
    });

    it("regenerate-page uses buildPageGenerationPrompt for full-page regen", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/regenerate-page/route.ts"), "utf8"
      );
      expect(content).toContain("buildPageGenerationPrompt");
    });

    it("PagePreview has Regenerate Page button", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"), "utf8"
      );
      expect(content).toContain("Regenerate Page");
      expect(content).toContain("handleRegeneratePage");
    });
  });

  // === TASK-235 QA: Add/Remove Pages ===
  describe("QA: Page add/remove API correctness", () => {
    it("add-page enforces 15-page max", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/add-page/route.ts"), "utf8"
      );
      expect(content).toContain("MAX_PAGES");
      expect(content).toContain("15");
      expect(content).toContain("Maximum of");
    });

    it("add-page validates generated content", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/add-page/route.ts"), "utf8"
      );
      expect(content).toContain("validateSections");
    });

    it("add-page generates slug from title", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/add-page/route.ts"), "utf8"
      );
      expect(content).toContain("toLowerCase");
      expect(content).toContain("replace");
    });

    it("remove-page prevents removing the last page", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/remove-page/route.ts"), "utf8"
      );
      expect(content).toContain("pages.length <= 1");
      expect(content).toContain("Cannot remove the last page");
    });

    it("remove-page enforces review status", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/remove-page/route.ts"), "utf8"
      );
      expect(content).toContain('"review"');
    });

    it("PageSidebar has Add Page form with title and description", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"), "utf8"
      );
      expect(content).toContain("Add Page");
      expect(content).toContain("addTitle");
      expect(content).toContain("addDescription");
      expect(content).toContain("Page title");
    });

    it("PageSidebar has remove confirmation flow", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"), "utf8"
      );
      expect(content).toContain("confirmRemove");
      expect(content).toContain("handleRemove");
    });

    it("PageSidebar disables add when at 15 pages", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"), "utf8"
      );
      expect(content).toContain("pages.length >= 15");
      expect(content).toContain("disabled");
    });
  });

  // === Cross-cutting: Shared Pipeline Context Helper ===
  describe("QA: Pipeline context loading", () => {
    it("load-pipeline-context.ts exists and loads from ResearchBrief + ContentPlan models", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/blueprint/load-pipeline-context.ts"), "utf8"
      );
      expect(content).toContain("prisma.researchBrief.findFirst");
      expect(content).toContain("prisma.contentPlan.findFirst");
      expect(content).toContain("orderBy: { version:");
    });

    it("load-pipeline-context falls back to blueprint payload data", () => {
      const content = fs.readFileSync(
        path.join(SRC, "lib/blueprint/load-pipeline-context.ts"), "utf8"
      );
      expect(content).toContain("siteData.industry");
      expect(content).toContain("siteData.audience");
      expect(content).toContain("siteData.tone");
    });
  });

  // === Regression: Sprint 13 features still work ===
  describe("Regression: Review page core features intact", () => {
    it("review page still imports PageSidebar, PagePreview, ApproveButton", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"), "utf8"
      );
      expect(content).toContain("PageSidebar");
      expect(content).toContain("PagePreview");
      expect(content).toContain("ApproveButton");
    });

    it("review page still has useAutoSave hook", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"), "utf8"
      );
      expect(content).toContain("useAutoSave");
    });

    it("review page passes siteId and new handlers to PagePreview", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"), "utf8"
      );
      expect(content).toContain("siteId={blueprint.siteId}");
      expect(content).toContain("onSectionRegenerated={handleSectionRegenerated}");
      expect(content).toContain("onPageRegenerated={handlePageRegenerated}");
    });

    it("review page passes add/remove handlers to PageSidebar", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"), "utf8"
      );
      expect(content).toContain("onAddPage={handleAddPage}");
      expect(content).toContain("onRemovePage={handleRemovePage}");
    });

    it("edit route still preserves original version on first edit", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"), "utf8"
      );
      expect(content).toContain("originalPayload");
      expect(content).toContain("BlueprintVersion");
    });
  });
});
