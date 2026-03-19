import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.join(__dirname, "..", "src");

describe("Sprint 13: Content Review Page & Inline Editing", () => {
  // === TASK-230: Blueprint-to-Markdown Renderer ===
  describe("TASK-230: Blueprint-to-Markdown Renderer", () => {
    const rendererPath = path.join(SRC, "lib/blueprint/markdown-renderer.ts");

    it("markdown-renderer.ts exists", () => {
      expect(fs.existsSync(rendererPath)).toBe(true);
    });

    it("exports blueprintPageToMarkdown function", () => {
      const content = fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("export function blueprintPageToMarkdown");
    });

    it("exports getComponentLabel function", () => {
      const content = fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("export function getComponentLabel");
    });

    it("has friendly labels for all major Space DS components", () => {
      const content = fs.readFileSync(rendererPath, "utf8");
      const expectedComponents = [
        "space-hero-banner-style-01",
        "space-text-media-default",
        "space-cta-banner-type-1",
        "space-features",
        "space-accordion",
        "space-team-section-type-1",
        "space-testimony-card",
        "space-pricing-card",
        "space-stats-kpi",
      ];
      for (const comp of expectedComponents) {
        expect(content).toContain(comp);
      }
    });

    it("extracts title, subtitle, description, button text, quote, and list items from props", () => {
      const content = fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("props.title");
      expect(content).toContain("props.sub_headline");
      expect(content).toContain("props.description");
      expect(content).toContain("props.button_text");
      expect(content).toContain("props.quote");
      expect(content).toContain("props.items");
    });

    it("renders form fields", () => {
      const content = fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("Form Fields");
      expect(content).toContain("field.label");
    });
  });

  // === TASK-231: Review Page Layout ===
  describe("TASK-231: Review Page Layout", () => {
    const reviewPagePath = path.join(SRC, "app/onboarding/review/page.tsx");
    const sidebarPath = path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx");
    const previewPath = path.join(SRC, "app/onboarding/review/components/PagePreview.tsx");

    it("review page.tsx exists", () => {
      expect(fs.existsSync(reviewPagePath)).toBe(true);
    });

    it("PageSidebar component exists", () => {
      expect(fs.existsSync(sidebarPath)).toBe(true);
    });

    it("PagePreview component exists", () => {
      expect(fs.existsSync(previewPath)).toBe(true);
    });

    it("review page loads blueprint from API", () => {
      const content = fs.readFileSync(reviewPagePath, "utf8");
      expect(content).toContain("/api/blueprint/");
    });

    it("sidebar shows page list with viewed/unviewed indicators", () => {
      const content = fs.readFileSync(sidebarPath, "utf8");
      expect(content).toContain("viewedPages");
      expect(content).toContain("onPageSelect");
    });

    it("preview renders sections with component labels", () => {
      const content = fs.readFileSync(previewPath, "utf8");
      expect(content).toContain("getComponentLabel");
    });

    it("review page uses siteId from search params", () => {
      const content = fs.readFileSync(reviewPagePath, "utf8");
      expect(content).toContain("useSearchParams");
      expect(content).toContain('searchParams.get("siteId")');
    });

    it("middleware covers /onboarding/review via existing matcher", () => {
      const middlewarePath = path.join(SRC, "middleware.ts");
      const content = fs.readFileSync(middlewarePath, "utf8");
      expect(content).toContain("/onboarding/:path*");
    });
  });

  // === TASK-232: Inline Section Editor ===
  describe("TASK-232: Inline Section Editor", () => {
    const previewPath = path.join(SRC, "app/onboarding/review/components/PagePreview.tsx");
    const autoSavePath = path.join(SRC, "app/onboarding/review/hooks/useAutoSave.ts");
    const editRoutePath = path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts");

    it("PagePreview has edit/done toggle for each section", () => {
      const content = fs.readFileSync(previewPath, "utf8");
      expect(content).toContain("editingSection");
      expect(content).toContain("onEditSection");
      expect(content).toContain('"Edit"');
      expect(content).toContain('"Done"');
    });

    it("useAutoSave hook exists with debounce", () => {
      expect(fs.existsSync(autoSavePath)).toBe(true);
      const content = fs.readFileSync(autoSavePath, "utf8");
      expect(content).toContain("debounceMs");
      expect(content).toContain("setTimeout");
    });

    it("useAutoSave default debounce is 500ms", () => {
      const content = fs.readFileSync(autoSavePath, "utf8");
      expect(content).toContain("500");
    });

    it("edit API route exists", () => {
      expect(fs.existsSync(editRoutePath)).toBe(true);
    });

    it("edit API validates ownership and review status", () => {
      const content = fs.readFileSync(editRoutePath, "utf8");
      expect(content).toContain("session.user.id");
      expect(content).toContain('status !== "review"');
    });

    it("edit API accepts pageIndex, sectionIndex, field, value", () => {
      const content = fs.readFileSync(editRoutePath, "utf8");
      expect(content).toContain("body.pageIndex");
      expect(content).toContain("body.sectionIndex");
      expect(content).toContain("body.field");
      expect(content).toContain("body.value");
    });

    it("useAutoSave flushes pending save on unmount", () => {
      const content = fs.readFileSync(autoSavePath, "utf8");
      expect(content).toContain("pendingRef.current");
      expect(content).toContain("clearTimeout");
    });

    it("useAutoSave uses siteId not blueprintId", () => {
      const content = fs.readFileSync(autoSavePath, "utf8");
      expect(content).toContain("siteId");
      expect(content).not.toContain("blueprintId");
    });
  });

  // === TASK-236: Original Version Preservation ===
  describe("TASK-236: Original Version Preservation", () => {
    const editRoutePath = path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts");
    const versionsRoutePath = path.join(SRC, "app/api/blueprint/[siteId]/versions/route.ts");

    it("edit API preserves original on first edit", () => {
      const content = fs.readFileSync(editRoutePath, "utf8");
      expect(content).toContain("originalPayload");
      expect(content).toContain("blueprintVersion.create");
    });

    it("original is only saved when originalPayload is null", () => {
      const content = fs.readFileSync(editRoutePath, "utf8");
      expect(content).toContain("!blueprint.originalPayload");
    });

    it("versions API route exists", () => {
      expect(fs.existsSync(versionsRoutePath)).toBe(true);
    });

    it("versions API verifies ownership", () => {
      const content = fs.readFileSync(versionsRoutePath, "utf8");
      expect(content).toContain("session.user.id");
    });

    it("versions API returns hasOriginal flag", () => {
      const content = fs.readFileSync(versionsRoutePath, "utf8");
      expect(content).toContain("hasOriginal");
    });
  });

  // === TASK-238: Approve & Provision Flow ===
  describe("TASK-238: Approve & Provision Flow", () => {
    const approvePath = path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx");
    const provisionStartPath = path.join(SRC, "app/api/provision/start/route.ts");

    it("ApproveButton component exists", () => {
      expect(fs.existsSync(approvePath)).toBe(true);
    });

    it("approve button disabled until all pages viewed", () => {
      const content = fs.readFileSync(approvePath, "utf8");
      expect(content).toContain("allViewed");
      expect(content).toContain("remaining");
      expect(content).toContain("disabled");
    });

    it("approve button shows remaining page count", () => {
      const content = fs.readFileSync(approvePath, "utf8");
      expect(content).toContain("Review");
      expect(content).toContain("more page");
    });

    it("approve triggers provision/start with siteId", () => {
      const content = fs.readFileSync(approvePath, "utf8");
      expect(content).toContain("/api/provision/start");
      expect(content).toContain("siteId");
    });

    it("skip review option is available", () => {
      const content = fs.readFileSync(approvePath, "utf8");
      expect(content).toContain("Skip review");
    });

    it("provision/start accepts review status", () => {
      const content = fs.readFileSync(provisionStartPath, "utf8");
      expect(content).toContain('"review"');
    });

    it("provision/start accepts siteId from request body", () => {
      const content = fs.readFileSync(provisionStartPath, "utf8");
      expect(content).toContain("requestedSiteId");
    });
  });

  // === Progress Page Integration ===
  describe("Progress Page → Review Page Integration", () => {
    const progressPath = path.join(SRC, "app/onboarding/progress/page.tsx");

    it("progress page shows Review button when status is review", () => {
      const content = fs.readFileSync(progressPath, "utf8");
      expect(content).toContain("Review Your Content");
      expect(content).toContain("/onboarding/review");
    });

    it("progress page passes siteId to review page", () => {
      const content = fs.readFileSync(progressPath, "utf8");
      expect(content).toContain("siteId=${siteId}");
    });
  });

  // === Blueprint API Enhancement ===
  describe("Blueprint API includes blueprint ID", () => {
    const blueprintRoutePath = path.join(SRC, "app/api/blueprint/[siteId]/route.ts");

    it("GET response includes blueprint id", () => {
      const content = fs.readFileSync(blueprintRoutePath, "utf8");
      expect(content).toContain("id: site.blueprint.id");
    });
  });
});
