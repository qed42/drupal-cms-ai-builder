/**
 * TASK-380: CivicTheme Adapter E2E Pipeline Test
 *
 * Validates the full blueprint generation pipeline using the CivicTheme adapter.
 * Tests that all generated component references, tree structures, and
 * composition patterns produce valid CivicTheme-compatible output.
 */

import { describe, it, expect } from "vitest";
import { civicthemeAdapter } from "../index";
import type { ComponentTreeItem } from "@ai-builder/ds-types";

const CT_PREFIX = "civictheme:";

describe("CivicTheme E2E Pipeline", () => {
  const manifestIds = new Set(civicthemeAdapter.getManifest().map((c) => c.id));

  // ─── Blueprint Component References ────────────────
  describe("Blueprint Component Validation", () => {
    it("all hero components exist in manifest", () => {
      const heroes = civicthemeAdapter.resolveRole("hero");
      for (const id of heroes) {
        expect(id.startsWith(CT_PREFIX), `Hero "${id}" should start with ${CT_PREFIX}`).toBe(true);
        expect(manifestIds.has(id), `Hero "${id}" must exist in CivicTheme manifest`).toBe(true);
      }
    });

    it("core text/heading/image/button components exist", () => {
      const roles = ["heading", "text", "image", "button"] as const;
      for (const role of roles) {
        const ids = civicthemeAdapter.resolveRole(role);
        expect(ids.length, `Role "${role}" should have at least one component`).toBeGreaterThan(0);
        for (const id of ids) {
          expect(manifestIds.has(id), `${role} component "${id}" must be in manifest`).toBe(true);
        }
      }
    });

    it("CTA banner component exists in manifest", () => {
      const cta = civicthemeAdapter.primaryComponent("cta-banner");
      expect(manifestIds.has(cta)).toBe(true);
    });

    it("header component exists in manifest", () => {
      const header = civicthemeAdapter.primaryComponent("header");
      expect(manifestIds.has(header)).toBe(true);
    });

    it("footer component exists in manifest", () => {
      const footer = civicthemeAdapter.primaryComponent("footer");
      expect(manifestIds.has(footer)).toBe(true);
    });
  });

  // ─── Canvas ID Format ─────────────────────────────
  describe("Canvas ID Generation", () => {
    it("toCanvasId produces sdc.* format for all components", () => {
      for (const comp of civicthemeAdapter.getManifest()) {
        const canvasId = civicthemeAdapter.toCanvasId(comp.id);
        expect(canvasId.startsWith("sdc."), `Canvas ID for "${comp.id}" should start with "sdc."`).toBe(true);
      }
    });

    it("version hashes are consistent", () => {
      for (const comp of civicthemeAdapter.getManifest()) {
        const v1 = civicthemeAdapter.getVersionHash(comp.id);
        const v2 = civicthemeAdapter.getVersionHash(comp.id);
        expect(v1).toBe(v2);
      }
    });
  });

  // ─── Header Tree ───────────────────────────────────
  describe("Header Generation", () => {
    it("generates valid header with navigation", () => {
      const items = civicthemeAdapter.buildHeaderTree({
        siteName: "CivicTheme Test Site",
        pages: [
          { slug: "home", title: "Home" },
          { slug: "about", title: "About" },
          { slug: "services", title: "Services" },
        ],
      });

      expect(items.length).toBeGreaterThan(0);
      const root = items.find((i) => i.parent_uuid === null);
      expect(root).toBeDefined();
    });
  });

  // ─── Footer Tree ───────────────────────────────────
  describe("Footer Generation", () => {
    it("generates valid footer", () => {
      const items = civicthemeAdapter.buildFooterTree({
        siteName: "CivicTheme Test Site",
        tagline: "Government-grade design",
        navLinks: [
          { title: "Home", url: "/" },
          { title: "About", url: "/about" },
        ],
      });

      expect(items.length).toBeGreaterThan(0);
    });
  });

  // ─── Hero Sections ─────────────────────────────────
  describe("Hero Section Generation", () => {
    it("generates valid hero for each hero variant", () => {
      const heroIds = civicthemeAdapter.resolveRole("hero");
      for (const heroId of heroIds) {
        const items = civicthemeAdapter.buildHeroSection(heroId, {
          title: "Welcome to Our Community",
          sub_headline: "Trusted government services",
        });
        expect(items.length, `Hero "${heroId}" should produce items`).toBeGreaterThan(0);
      }
    });
  });

  // ─── Content Sections ──────────────────────────────
  describe("Content Section Generation", () => {
    it("generates valid sections for all composition patterns", () => {
      const patterns = civicthemeAdapter.getCompositionPatterns();
      for (const [name] of Object.entries(patterns)) {
        const items = civicthemeAdapter.buildContentSection(name, [], {
          sectionHeading: { title: `Test ${name}` },
        });
        expect(items.length, `Pattern "${name}" should produce items`).toBeGreaterThan(0);
      }
    });
  });

  // ─── Brand Tokens ──────────────────────────────────
  describe("Brand Token Application", () => {
    it("produces SCSS brand payload requiring build", () => {
      const payload = civicthemeAdapter.prepareBrandPayload({
        colors: { primary: "#003366", secondary: "#006633" },
        fonts: { heading: "Lexend", body: "Inter" },
      });
      expect(payload.type).toBe("scss-file");
      if (payload.type === "scss-file") {
        expect(payload.requiresBuild).toBe(true);
        expect(payload.path).toBeTruthy();
        expect(payload.content).toContain("#003366");
      }
    });
  });

  // ─── Color Palette ─────────────────────────────────
  describe("Color Palette", () => {
    it("provides light and dark backgrounds", () => {
      const palette = civicthemeAdapter.getColorPalette();
      expect(palette.lightBackgrounds.length).toBeGreaterThan(0);
      expect(palette.darkBackgrounds.length).toBeGreaterThan(0);
    });
  });

  // ─── Prompt Generation ─────────────────────────────
  describe("Prompt Generation", () => {
    it("component reference mentions CivicTheme components", () => {
      const ref = civicthemeAdapter.buildPromptComponentReference();
      expect(ref).toContain("civictheme:");
    });

    it("design guidance is non-empty", () => {
      const guidance = civicthemeAdapter.buildPromptDesignGuidance();
      expect(guidance.length).toBeGreaterThan(50);
    });
  });

  // ─── CivicTheme-Specific: Pre-composed Organisms ──
  describe("Pre-composed Organisms", () => {
    it("uses pre-composed organisms where expected", () => {
      // CivicTheme uses organisms like promo, callout, etc. as pre-composed units
      const patterns = civicthemeAdapter.getCompositionPatterns();
      const patternNames = Object.keys(patterns);
      // Should have at least the standard patterns
      expect(patternNames).toContain("text-image-split-50-50");
      expect(patternNames).toContain("features-grid-3col");
    });
  });
});
