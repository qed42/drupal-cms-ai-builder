/**
 * Adapter Contract Test Suite — validates any DesignSystemAdapter implementation
 * against the shared interface contract. Run via vitest.
 *
 * Usage in each adapter's test file:
 *   import { runAdapterContractTests } from "@ai-builder/ds-types/__tests__/adapter-contract";
 *   import { spaceDsAdapter } from "../src";
 *   runAdapterContractTests(spaceDsAdapter);
 */

import { describe, it, expect } from "vitest";
import type { DesignSystemAdapter, ComponentTreeItem } from "../types";

const REQUIRED_ROLES = ["container", "heading", "text", "image", "button", "link"] as const;

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function validateTreeItem(item: ComponentTreeItem): void {
  expect(item.uuid).toBeTruthy();
  expect(isValidUuid(item.uuid), `Invalid UUID: ${item.uuid}`).toBe(true);
  expect(item.component_id).toBeTruthy();
  expect(typeof item.component_version).toBe("string");
  expect(typeof item.label).toBe("string");
  expect(item.label.length).toBeGreaterThan(0);
}

export function runAdapterContractTests(adapter: DesignSystemAdapter): void {
  describe(`Adapter Contract: ${adapter.name}`, () => {
    // ─── Registry Tests ──────────────────────────────
    describe("Registry", () => {
      it("has valid identity fields", () => {
        expect(adapter.id).toBeTruthy();
        expect(adapter.name).toBeTruthy();
        expect(adapter.themeName).toBeTruthy();
        expect(adapter.composerPackage).toBeTruthy();
      });
    });

    // ─── Role Resolution Tests ───────────────────────
    describe("Role Resolution", () => {
      for (const role of REQUIRED_ROLES) {
        it(`resolves required role: ${role}`, () => {
          const ids = adapter.resolveRole(role);
          // CivicTheme uses pre-composed organisms without a separate container
          // component, so "container" role may resolve empty — this is acceptable.
          if (role === "container" && ids.length === 0) {
            return; // documented exception
          }
          expect(ids.length, `Role "${role}" must map to at least one component`).toBeGreaterThan(0);
        });
      }

      it("resolveRole returns only IDs present in manifest", () => {
        const manifestIds = new Set(adapter.getManifest().map((c) => c.id));
        for (const role of REQUIRED_ROLES) {
          for (const id of adapter.resolveRole(role)) {
            expect(manifestIds.has(id), `Role "${role}" resolved to "${id}" which is not in manifest`).toBe(true);
          }
        }
      });

      it("primaryComponent returns the first from resolveRole", () => {
        for (const role of REQUIRED_ROLES) {
          const resolved = adapter.resolveRole(role);
          if (resolved.length > 0) {
            expect(adapter.primaryComponent(role)).toBe(resolved[0]);
          }
        }
      });

      it("supportsRole matches resolveRole().length > 0", () => {
        for (const role of REQUIRED_ROLES) {
          expect(adapter.supportsRole(role)).toBe(adapter.resolveRole(role).length > 0);
        }
      });
    });

    // ─── Manifest Tests ──────────────────────────────
    describe("Manifest", () => {
      it("returns non-empty array", () => {
        const manifest = adapter.getManifest();
        expect(manifest.length).toBeGreaterThan(0);
      });

      it("every component has id, name, and props", () => {
        for (const comp of adapter.getManifest()) {
          expect(comp.id, "Component must have an id").toBeTruthy();
          expect(comp.name, `Component ${comp.id} must have a name`).toBeTruthy();
          expect(Array.isArray(comp.props), `Component ${comp.id} must have props array`).toBe(true);
        }
      });

      it("no duplicate component IDs", () => {
        const ids = adapter.getManifest().map((c) => c.id);
        const unique = new Set(ids);
        expect(unique.size, "Duplicate component IDs found").toBe(ids.length);
      });

      it("getComponent returns the correct component by ID", () => {
        const manifest = adapter.getManifest();
        const sample = manifest[0];
        const found = adapter.getComponent(sample.id);
        expect(found).toBeDefined();
        expect(found!.id).toBe(sample.id);
      });

      it("getComponent returns undefined for unknown ID", () => {
        expect(adapter.getComponent("nonexistent:component")).toBeUndefined();
      });
    });

    // ─── Composition Tests ───────────────────────────
    describe("Composition", () => {
      it("getCompositionPatterns returns non-empty record", () => {
        const patterns = adapter.getCompositionPatterns();
        expect(Object.keys(patterns).length).toBeGreaterThan(0);
      });

      it("all pattern names are unique (keys match pattern.name)", () => {
        const patterns = adapter.getCompositionPatterns();
        for (const [key, pattern] of Object.entries(patterns)) {
          expect(pattern.name).toBe(key);
        }
      });

      it("all patterns have childRoles", () => {
        const patterns = adapter.getCompositionPatterns();
        for (const [name, pattern] of Object.entries(patterns)) {
          expect(pattern.childRoles.length, `Pattern "${name}" must have childRoles`).toBeGreaterThan(0);
        }
      });

      it("getPageDesignRules returns non-empty array", () => {
        const rules = adapter.getPageDesignRules();
        expect(rules.length).toBeGreaterThan(0);
      });

      it("getFullWidthOrganisms returns array", () => {
        const organisms = adapter.getFullWidthOrganisms();
        expect(Array.isArray(organisms)).toBe(true);
      });

      it("full-width organisms are in manifest", () => {
        const manifestIds = new Set(adapter.getManifest().map((c) => c.id));
        for (const id of adapter.getFullWidthOrganisms()) {
          expect(manifestIds.has(id), `Full-width organism "${id}" not in manifest`).toBe(true);
        }
      });
    });

    // ─── Tree Builder Tests ──────────────────────────
    describe("Tree Builders", () => {
      it("buildHeaderTree returns valid ComponentTreeItems", () => {
        const items = adapter.buildHeaderTree({
          siteName: "Test Site",
          pages: [
            { slug: "home", title: "Home" },
            { slug: "about", title: "About" },
          ],
        });
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          validateTreeItem(item);
        }
      });

      it("buildFooterTree returns valid ComponentTreeItems", () => {
        const items = adapter.buildFooterTree({
          siteName: "Test Site",
          tagline: "Test tagline",
        });
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          validateTreeItem(item);
        }
      });

      it("buildHeroSection returns valid ComponentTreeItems", () => {
        const heroIds = adapter.resolveRole("hero");
        if (heroIds.length === 0) return; // skip if no hero support
        const items = adapter.buildHeroSection(heroIds[0], {
          title: "Test Hero",
          sub_headline: "Test subtitle",
        });
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          validateTreeItem(item);
        }
      });

      it("buildContentSection returns valid items for a pattern", () => {
        const patterns = adapter.getCompositionPatterns();
        const patternName = Object.keys(patterns)[0];
        const items = adapter.buildContentSection(patternName, [], {
          sectionHeading: { title: "Test Section" },
        });
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          validateTreeItem(item);
        }
      });

      it("buildOrganismSection returns valid items", () => {
        const fullWidth = adapter.getFullWidthOrganisms();
        if (fullWidth.length === 0) return;
        const items = adapter.buildOrganismSection(fullWidth[0], {
          title: "Test Organism",
        });
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          validateTreeItem(item);
        }
      });
    });

    // ─── Metadata Tests ──────────────────────────────
    describe("Metadata", () => {
      it("getVersionHash returns string for manifest components", () => {
        for (const comp of adapter.getManifest()) {
          const hash = adapter.getVersionHash(comp.id);
          expect(typeof hash).toBe("string");
          expect(hash.length).toBeGreaterThan(0);
        }
      });

      it("toCanvasId produces valid Canvas format", () => {
        const comp = adapter.getManifest()[0];
        const canvasId = adapter.toCanvasId(comp.id);
        expect(typeof canvasId).toBe("string");
        expect(canvasId.length).toBeGreaterThan(0);
      });

      it("getLabel returns non-empty string for manifest components", () => {
        for (const comp of adapter.getManifest()) {
          const label = adapter.getLabel(comp.id);
          expect(typeof label).toBe("string");
          expect(label.length, `Label for ${comp.id} must be non-empty`).toBeGreaterThan(0);
        }
      });

      it("getPlaceholderImagePath returns non-empty string", () => {
        const path = adapter.getPlaceholderImagePath();
        expect(typeof path).toBe("string");
        expect(path.length).toBeGreaterThan(0);
      });

      it("getPropOverrides returns object", () => {
        const overrides = adapter.getPropOverrides();
        expect(typeof overrides).toBe("object");
      });
    });

    // ─── Color & Theming Tests ───────────────────────
    describe("Color & Theming", () => {
      it("getColorPalette has required fields", () => {
        const palette = adapter.getColorPalette();
        expect(palette.values.length).toBeGreaterThan(0);
        expect(palette.darkBackgrounds.length).toBeGreaterThan(0);
        expect(palette.lightBackgrounds.length).toBeGreaterThan(0);
        expect(palette.defaultAlternation.length).toBeGreaterThan(0);
      });
    });

    // ─── Prompt Tests ────────────────────────────────
    describe("Prompt Engineering", () => {
      it("buildPromptComponentReference returns non-empty string", () => {
        const ref = adapter.buildPromptComponentReference();
        expect(ref.length).toBeGreaterThan(0);
      });

      it("buildPromptAccessibilityRules returns non-empty string", () => {
        const rules = adapter.buildPromptAccessibilityRules();
        expect(rules.length).toBeGreaterThan(0);
      });

      it("buildPromptDesignGuidance returns non-empty string", () => {
        const guidance = adapter.buildPromptDesignGuidance();
        expect(guidance.length).toBeGreaterThan(0);
      });
    });

    // ─── Brand Application Tests ─────────────────────
    describe("Brand Application", () => {
      it("prepareBrandPayload returns valid payload", () => {
        const payload = adapter.prepareBrandPayload({
          colors: { primary: "#007bff", secondary: "#6c757d" },
          fonts: { heading: "Inter", body: "Inter" },
        });
        expect(payload.type).toBeTruthy();
        expect(["drupal-config", "css-file", "scss-file"]).toContain(payload.type);
      });
    });
  });
}
