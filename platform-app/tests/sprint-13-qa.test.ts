import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.join(__dirname, "..", "src");

describe("Sprint 13 QA: Content Review Page & Inline Editing", () => {
  // === TASK-230: Blueprint-to-Markdown Renderer ===
  describe("TASK-230: Blueprint-to-Markdown Renderer", () => {
    const rendererPath = path.join(SRC, "lib/blueprint/markdown-renderer.ts");
    let content: string;

    it("module exists and is importable", () => {
      expect(fs.existsSync(rendererPath)).toBe(true);
      content = fs.readFileSync(rendererPath, "utf8");
    });

    it("AC: All current Space DS components have friendly labels", () => {
      // Cross-reference against canvas-component-versions.ts components
      const requiredComponents = [
        "hero-banner-style-01",
        "text-media-default",
        "cta-banner-type-1",
        "cta-banner-type-2",
        "cta-banner-type-3",
        "features",
        "accordion",
        "team-section-type-1",
        "testimony-card",
        "pricing-card",
        "stats-kpi",
        "logo-grid",
        "footer",
        "container",
        "section-heading",
        "icon-card",
        "imagecard",
        "video",
        "video-card",
        "people-card-type-1",
        "quicklink-card",
      ];
      content = content || fs.readFileSync(rendererPath, "utf8");
      for (const comp of requiredComponents) {
        expect(content, `Missing label for ${comp}`).toContain(comp);
      }
    });

    it("AC: Text content is extracted from component props", () => {
      content = content || fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("props.title");
      expect(content).toContain("props.description");
      expect(content).toContain("props.sub_headline");
    });

    it("AC: Output is readable markdown with section headings", () => {
      content = content || fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("## Section");
      expect(content).toContain("# ${page.title}");
    });

    it("AC: Lists and multi-item components render", () => {
      content = content || fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("props.items");
      expect(content).toContain("props.features");
    });

    it("AC: Form fields render as a field list preview", () => {
      content = content || fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("Form Fields");
      expect(content).toContain("field.required");
    });

    it("has fallback label derivation for unknown components", () => {
      content = content || fs.readFileSync(rendererPath, "utf8");
      expect(content).toContain("componentId.split");
      expect(content).toContain("toUpperCase");
    });
  });

  // === TASK-231: Review Page Layout ===
  describe("TASK-231: Review Page Layout", () => {
    it("AC: Review page loads and displays blueprint pages", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("loadBlueprint");
      expect(content).toContain("fetch(`/api/blueprint/");
      expect(content).toContain("payload?.pages");
    });

    it("AC: Sidebar lists all pages with click-to-navigate", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"),
        "utf8"
      );
      expect(content).toContain("pages.map");
      expect(content).toContain("onPageSelect");
      expect(content).toContain("page.title");
    });

    it("AC: Each page renders formatted content with component labels", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      expect(content).toContain("getComponentLabel");
      expect(content).toContain("section.component_id");
    });

    it("AC: Content is full-length (not truncated)", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      // No truncation or line-clamp on content fields
      expect(content).not.toContain("line-clamp");
      expect(content).not.toContain("truncate");
      // PagePreview content area doesn't truncate — only sidebar truncates titles
      const sidebarContent = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PageSidebar.tsx"),
        "utf8"
      );
      // Sidebar uses truncate on page titles (acceptable)
      expect(sidebarContent).toContain("truncate");
    });

    it("AC: Route added to middleware (auth-protected)", () => {
      const content = fs.readFileSync(
        path.join(SRC, "middleware.ts"),
        "utf8"
      );
      // /onboarding/:path* covers /onboarding/review
      expect(content).toContain("/onboarding/:path*");
    });

    it("review page shows loading state", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("Loading your content");
      expect(content).toContain("animate-spin");
    });

    it("review page handles error state with dashboard link", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("Go to Dashboard");
      expect(content).toContain("text-red-400");
    });
  });

  // === TASK-232: Inline Section Editor ===
  describe("TASK-232: Inline Section Editor", () => {
    it("AC: Edit button on each section switches to textarea mode", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      expect(content).toContain("<textarea");
      expect(content).toContain('<input');
      expect(content).toContain('"Edit"');
    });

    it("AC: Done button returns to read-only mode", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      expect(content).toContain('"Done"');
      expect(content).toContain("onDone");
    });

    it("AC: Changes auto-save with 500ms debounce", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/hooks/useAutoSave.ts"),
        "utf8"
      );
      expect(content).toContain("debounceMs = 500");
      expect(content).toContain("setTimeout(flush, debounceMs)");
    });

    it("AC: Edit API validates ownership and review status", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain("session.user.id");
      expect(content).toContain('status !== "review"');
    });

    it("AC: Multiple sections can be edited independently", () => {
      // Each section has its own isEditing state driven by editingSection index
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("editingSection");
      expect(content).toContain("setEditingSection");
    });

    it("AC: Plain textarea editing (not rich editor per ADR-005)", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/PagePreview.tsx"),
        "utf8"
      );
      // Uses plain textarea, not contentEditable or rich text editor
      expect(content).toContain("<textarea");
      expect(content).not.toContain("contentEditable");
      expect(content).not.toContain("rich-text");
    });

    it("BUG-CHECK: Only one section editable at a time", () => {
      // editingSection is a single number | null state, not an array
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("useState<number | null>(null)");
    });

    it("edit API validates payload structure", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain('typeof body.pageIndex !== "number"');
      expect(content).toContain('typeof body.field !== "string"');
    });

    it("edit API validates page and section bounds", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain("body.pageIndex >= pages.length");
      expect(content).toContain("body.sectionIndex >= page.sections.length");
    });

    it("edit syncs component_tree inputs alongside section props", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain("component_tree");
      expect(content).toContain("inputs[body.field]");
    });
  });

  // === TASK-236: Original Version Preservation ===
  describe("TASK-236: Original Version Preservation", () => {
    it("AC: Original blueprint preserved on first edit", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain("!blueprint.originalPayload");
      expect(content).toContain("originalPayload");
    });

    it("AC: Subsequent edits don't overwrite the original", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      // Conditional: only save originalPayload when it's null
      expect(content).toContain("if (!blueprint.originalPayload)");
    });

    it("AC: originalPayload is immutable once set", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      // Only one place where originalPayload is written, inside the !null check
      const matches = content.match(/data:.*originalPayload/g);
      expect(matches?.length).toBe(1);
    });

    it("AC: Versions API returns available versions", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/versions/route.ts"),
        "utf8"
      );
      expect(content).toContain("versions");
      expect(content).toContain('"current"');
      expect(content).toContain("hasOriginal");
    });

    it("BlueprintVersion record created with version 1 and label 'original'", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/edit/route.ts"),
        "utf8"
      );
      expect(content).toContain("blueprintVersion.create");
      expect(content).toContain('label: "original"');
      expect(content).toContain("version: 1");
    });
  });

  // === TASK-238: Approve & Provision Flow ===
  describe("TASK-238: Approve & Provision Flow", () => {
    it("AC: Button disabled until all pages viewed", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("!allViewed || loading");
      expect(content).toContain("disabled");
    });

    it("AC: Hint text shows how many pages remain", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("remaining");
      expect(content).toContain("more page");
    });

    it("AC: On approve, provisioning starts", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("/api/provision/start");
      expect(content).toContain("method: \"POST\"");
    });

    it("AC: Site status transitions from review to provisioning", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/provision/start/route.ts"),
        "utf8"
      );
      expect(content).toContain('"review"');
      expect(content).toContain('status: "provisioning"');
    });

    it("AC: User redirected to provisioning progress page", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("/onboarding/progress");
    });

    it("AC: Optional Skip Review link available", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("Skip review");
    });

    it("provision/start accepts siteId from request body", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/provision/start/route.ts"),
        "utf8"
      );
      expect(content).toContain("requestedSiteId");
      expect(content).toContain("req.json()");
    });
  });

  // === BUG FIX VERIFICATION ===
  describe("Bug Fix Verification", () => {
    it("BUG-S13-001 FIXED: No route conflict — only [siteId] segment exists", () => {
      const idDir = path.join(SRC, "app/api/blueprint/[id]");
      const siteIdDir = path.join(SRC, "app/api/blueprint/[siteId]");
      expect(fs.existsSync(idDir)).toBe(false);
      expect(fs.existsSync(siteIdDir)).toBe(true);
      expect(fs.existsSync(path.join(siteIdDir, "edit/route.ts"))).toBe(true);
      expect(fs.existsSync(path.join(siteIdDir, "versions/route.ts"))).toBe(true);
    });

    it("BUG-S13-002 FIXED: Single startProvisioning function", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/components/ApproveButton.tsx"),
        "utf8"
      );
      expect(content).toContain("startProvisioning");
      expect(content).not.toContain("handleApprove");
      expect(content).not.toContain("handleSkip");
      const fetchCalls = content.match(/fetch\("\/api\/provision\/start"/g);
      expect(fetchCalls?.length).toBe(1);
    });

    it("BUG-S13-003 FIXED: Back to Dashboard navigation exists", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("Back to Dashboard");
      const dashboardLinks = content.match(/\/dashboard/g);
      expect((dashboardLinks?.length ?? 0)).toBeGreaterThanOrEqual(3);
    });
  });

  // === Integration Tests ===
  describe("Integration: Progress → Review flow", () => {
    it("progress page redirects to review when status is 'review'", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/progress/page.tsx"),
        "utf8"
      );
      expect(content).toContain("Review Your Content");
      expect(content).toContain("/onboarding/review?siteId=");
    });

    it("progress page still shows dashboard for non-review statuses", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/progress/page.tsx"),
        "utf8"
      );
      expect(content).toContain('siteStatus !== "review"');
      expect(content).toContain("Continue to Dashboard");
    });

    it("blueprint API returns id for review page consumption", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/api/blueprint/[siteId]/route.ts"),
        "utf8"
      );
      expect(content).toContain("id: site.blueprint.id");
    });
  });

  // === Regression: Save status feedback ===
  describe("Save status UI feedback", () => {
    it("shows saving/saved/error indicators", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain("Saving...");
      expect(content).toContain("Saved");
      expect(content).toContain("Save failed");
    });

    it("saved indicator auto-clears after 2 seconds", () => {
      const content = fs.readFileSync(
        path.join(SRC, "app/onboarding/review/page.tsx"),
        "utf8"
      );
      expect(content).toContain('setTimeout(() => setSaveStatus("idle"), 2000)');
    });
  });
});
