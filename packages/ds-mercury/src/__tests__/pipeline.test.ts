/**
 * TASK-374: Mercury Adapter E2E Pipeline Test
 *
 * Validates the full blueprint generation pipeline using the Mercury adapter.
 * Tests that all generated component references, tree structures, and
 * composition patterns produce valid Mercury-compatible output.
 */

import { describe, it, expect } from "vitest";
import { mercuryAdapter } from "../index";
import type { ComponentTreeItem } from "@ai-builder/ds-types";

const MERCURY_PREFIX = "mercury:";

function validateTreeItems(items: ComponentTreeItem[], manifestIds: Set<string>): void {
  for (const item of items) {
    expect(item.uuid).toBeTruthy();
    expect(item.component_id.startsWith("sdc."), `Component ID "${item.component_id}" should be in Canvas format`).toBe(true);
  }
}

describe("Mercury E2E Pipeline", () => {
  const manifestIds = new Set(mercuryAdapter.getManifest().map((c) => c.id));

  // ─── Blueprint Component References ────────────────
  describe("Blueprint Component Validation", () => {
    it("all hero components exist in manifest", () => {
      const heroes = mercuryAdapter.resolveRole("hero");
      for (const id of heroes) {
        expect(id.startsWith(MERCURY_PREFIX), `Hero "${id}" should start with ${MERCURY_PREFIX}`).toBe(true);
        expect(manifestIds.has(id), `Hero "${id}" must exist in Mercury manifest`).toBe(true);
      }
    });

    it("all required role components exist in manifest", () => {
      const roles = ["container", "heading", "text", "image", "button", "link"] as const;
      for (const role of roles) {
        for (const id of mercuryAdapter.resolveRole(role)) {
          expect(manifestIds.has(id), `${role} component "${id}" must be in manifest`).toBe(true);
        }
      }
    });

    it("CTA banner component exists in manifest", () => {
      const cta = mercuryAdapter.primaryComponent("cta-banner");
      expect(manifestIds.has(cta)).toBe(true);
    });

    it("header component exists in manifest", () => {
      const header = mercuryAdapter.primaryComponent("header");
      expect(manifestIds.has(header)).toBe(true);
    });

    it("footer component exists in manifest", () => {
      const footer = mercuryAdapter.primaryComponent("footer");
      expect(manifestIds.has(footer)).toBe(true);
    });
  });

  // ─── Canvas ID Format ─────────────────────────────
  describe("Canvas ID Generation", () => {
    it("toCanvasId produces sdc.* format for all components", () => {
      for (const comp of mercuryAdapter.getManifest()) {
        const canvasId = mercuryAdapter.toCanvasId(comp.id);
        expect(canvasId.startsWith("sdc."), `Canvas ID for "${comp.id}" should start with "sdc."`).toBe(true);
      }
    });

    it("version hashes are consistent", () => {
      for (const comp of mercuryAdapter.getManifest()) {
        const v1 = mercuryAdapter.getVersionHash(comp.id);
        const v2 = mercuryAdapter.getVersionHash(comp.id);
        expect(v1).toBe(v2);
      }
    });
  });

  // ─── Header Tree ───────────────────────────────────
  describe("Header Generation", () => {
    it("generates valid header with navigation", () => {
      const items = mercuryAdapter.buildHeaderTree({
        siteName: "Mercury Test Site",
        logo: { url: "/logo.svg", alt: "Logo" },
        pages: [
          { slug: "home", title: "Home" },
          { slug: "about", title: "About" },
          { slug: "services", title: "Services" },
          { slug: "contact", title: "Contact" },
        ],
        ctaText: "Get Started",
        ctaUrl: "/contact",
      });

      expect(items.length).toBeGreaterThan(0);
      // Root should be navbar
      const root = items.find((i) => i.parent_uuid === null);
      expect(root).toBeDefined();
    });
  });

  // ─── Footer Tree ───────────────────────────────────
  describe("Footer Generation", () => {
    it("generates valid footer with branding and links", () => {
      const items = mercuryAdapter.buildFooterTree({
        siteName: "Mercury Test Site",
        tagline: "Test tagline",
        brandDescription: "A test site for Mercury adapter validation.",
        navLinks: [
          { title: "Home", url: "/" },
          { title: "About", url: "/about" },
        ],
        socialLinks: [
          { platform: "Twitter", url: "https://twitter.com", icon: "twitter-logo" },
        ],
        legalLinks: [
          { title: "Privacy", url: "/privacy" },
        ],
      });

      expect(items.length).toBeGreaterThan(0);
    });
  });

  // ─── Hero Sections ─────────────────────────────────
  describe("Hero Section Generation", () => {
    it("generates valid hero for each hero variant", () => {
      const heroIds = mercuryAdapter.resolveRole("hero");
      for (const heroId of heroIds) {
        const items = mercuryAdapter.buildHeroSection(heroId, {
          title: "Welcome to Our Site",
          sub_headline: "Professional services you can trust",
        });
        expect(items.length, `Hero "${heroId}" should produce items`).toBeGreaterThan(0);
      }
    });
  });

  // ─── Content Sections ──────────────────────────────
  describe("Content Section Generation", () => {
    it("generates valid sections for all composition patterns", () => {
      const patterns = mercuryAdapter.getCompositionPatterns();
      for (const [name] of Object.entries(patterns)) {
        const items = mercuryAdapter.buildContentSection(name, [], {
          sectionHeading: { title: `Test ${name}` },
          backgroundColor: "transparent",
        });
        expect(items.length, `Pattern "${name}" should produce items`).toBeGreaterThan(0);
      }
    });
  });

  // ─── Brand Tokens ──────────────────────────────────
  describe("Brand Token Application", () => {
    it("produces CSS brand payload", () => {
      const payload = mercuryAdapter.prepareBrandPayload({
        colors: { primary: "#1a73e8", secondary: "#34a853" },
        fonts: { heading: "Inter", body: "Roboto" },
      });
      expect(payload.type).toBe("css-file");
      if (payload.type === "css-file") {
        expect(payload.path).toBeTruthy();
        expect(payload.content).toContain("#1a73e8");
      }
    });
  });

  // ─── Color Palette ─────────────────────────────────
  describe("Color Palette", () => {
    it("provides background alternation for sections", () => {
      const palette = mercuryAdapter.getColorPalette();
      expect(palette.defaultAlternation.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── Prompt Generation ─────────────────────────────
  describe("Prompt Generation", () => {
    it("component reference mentions Mercury components", () => {
      const ref = mercuryAdapter.buildPromptComponentReference();
      expect(ref).toContain("mercury:");
    });

    it("design guidance is non-empty", () => {
      const guidance = mercuryAdapter.buildPromptDesignGuidance();
      expect(guidance.length).toBeGreaterThan(50);
    });
  });
});
