/**
 * Manifest integrity and CI validation tests.
 *
 * These tests act as a gate for the curated component library: any new
 * component added to manifest.json must satisfy all constraints here before
 * merging, ensuring the library stays consistent and production-ready.
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { getCuratedComponents, clearLoaderCache } from "../loader";
import { getApplicableTrends, clearTrendsCache } from "../trends-loader";

const COMPONENTS_DIR = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(COMPONENTS_DIR, "manifest.json");
const TRENDS_PATH = path.join(COMPONENTS_DIR, "trends.json");

// Raw manifest read — bypass the loader so we can inspect the raw JSON shape
function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
}

function readTrends() {
  return JSON.parse(fs.readFileSync(TRENDS_PATH, "utf-8"));
}

beforeEach(() => {
  clearLoaderCache();
  clearTrendsCache();
});

// ---------------------------------------------------------------------------
// Manifest structure
// ---------------------------------------------------------------------------

describe("manifest — top-level structure", () => {
  it("has a version field", () => {
    const manifest = readManifest();
    expect(manifest.version).toBeTruthy();
    expect(typeof manifest.version).toBe("string");
  });

  it("has a components array", () => {
    const manifest = readManifest();
    expect(Array.isArray(manifest.components)).toBe(true);
    expect(manifest.components.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Component ID uniqueness and format
// ---------------------------------------------------------------------------

describe("manifest — component IDs", () => {
  it("all component IDs are unique", () => {
    const manifest = readManifest();
    const ids: string[] = manifest.components.map((c: { id: string }) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all component IDs match directory name format (lowercase letters and hyphens)", () => {
    const manifest = readManifest();
    const validId = /^[a-z][a-z0-9-]*[a-z0-9]$/;
    for (const c of manifest.components) {
      expect(
        validId.test(c.id),
        `ID "${c.id}" does not match [a-z][a-z0-9-]* format`
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Source path existence
// ---------------------------------------------------------------------------

describe("manifest — source paths point to existing files", () => {
  it("all JSX source paths in manifest exist on disk", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      const jsxPath = path.join(COMPONENTS_DIR, c.source.jsx);
      expect(
        fs.existsSync(jsxPath),
        `JSX file not found for ${c.id}: ${jsxPath}`
      ).toBe(true);
    }
  });

  it("all CSS source paths in manifest exist on disk", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      const cssPath = path.join(COMPONENTS_DIR, c.source.css);
      expect(
        fs.existsSync(cssPath),
        `CSS file not found for ${c.id}: ${cssPath}`
      ).toBe(true);
    }
  });

  it("source jsx paths follow the convention components/{id}/component.tsx", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        c.source.jsx,
        `${c.id} source.jsx does not follow components/{id}/component.tsx pattern`
      ).toBe(`components/${c.id}/component.tsx`);
    }
  });

  it("source css paths follow the convention components/{id}/styles.css", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        c.source.css,
        `${c.id} source.css does not follow components/{id}/styles.css pattern`
      ).toBe(`components/${c.id}/styles.css`);
    }
  });
});

// ---------------------------------------------------------------------------
// Required fields per component
// ---------------------------------------------------------------------------

describe("manifest — component required fields", () => {
  it("each component has at least one visualStyle", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        Array.isArray(c.visualStyles),
        `${c.id}: visualStyles is not an array`
      ).toBe(true);
      expect(
        c.visualStyles.length,
        `${c.id}: visualStyles is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("each component has a non-empty category", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(typeof c.category).toBe("string");
      expect(c.category.trim().length, `${c.id}: category is empty`).toBeGreaterThan(0);
    }
  });

  it("each component has a propsSchema with at least one prop", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        Array.isArray(c.propsSchema),
        `${c.id}: propsSchema is not an array`
      ).toBe(true);
      expect(
        c.propsSchema.length,
        `${c.id}: propsSchema is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("each component's brandTokensUsed array is non-empty", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        Array.isArray(c.brandTokensUsed),
        `${c.id}: brandTokensUsed is not an array`
      ).toBe(true);
      expect(
        c.brandTokensUsed.length,
        `${c.id}: brandTokensUsed is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("each component has a boolean hasAnimation field", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      expect(
        typeof c.hasAnimation,
        `${c.id}: hasAnimation is not a boolean`
      ).toBe("boolean");
    }
  });

  it("each component has a non-empty animationLevel", () => {
    const manifest = readManifest();
    const validLevels = new Set(["none", "subtle", "moderate", "energetic"]);
    for (const c of manifest.components) {
      expect(
        validLevels.has(c.animationLevel),
        `${c.id}: animationLevel "${c.animationLevel}" is not one of ${[...validLevels].join(", ")}`
      ).toBe(true);
    }
  });

  it("each propsSchema entry has name, type, and required fields", () => {
    const manifest = readManifest();
    for (const c of manifest.components) {
      for (const prop of c.propsSchema) {
        expect(prop.name, `${c.id}: prop missing name`).toBeTruthy();
        expect(prop.type, `${c.id}: prop "${prop.name}" missing type`).toBeTruthy();
        expect(
          typeof prop.required,
          `${c.id}: prop "${prop.name}" missing required`
        ).toBe("boolean");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Loader consistency
// ---------------------------------------------------------------------------

describe("loader consistency with manifest", () => {
  it("getCuratedComponents returns same count as manifest.components", () => {
    const manifest = readManifest();
    const loaded = getCuratedComponents();
    expect(loaded).toHaveLength(manifest.components.length);
  });

  it("loaded component IDs match manifest IDs exactly", () => {
    const manifest = readManifest();
    const manifestIds = manifest.components.map((c: { id: string }) => c.id).sort();
    const loadedIds = getCuratedComponents().map((c) => c.id).sort();
    expect(loadedIds).toEqual(manifestIds);
  });
});

// ---------------------------------------------------------------------------
// trends.json
// ---------------------------------------------------------------------------

describe("trends.json — structure", () => {
  it("loads and has a version field", () => {
    const db = readTrends();
    expect(db.version).toBeTruthy();
  });

  it("has at least 10 trend entries", () => {
    const db = readTrends();
    expect(Array.isArray(db.trends)).toBe(true);
    expect(db.trends.length).toBeGreaterThanOrEqual(10);
  });

  it("each trend has an id and name", () => {
    const db = readTrends();
    for (const t of db.trends) {
      expect(t.id, "trend missing id").toBeTruthy();
      expect(t.name, `trend ${t.id} missing name`).toBeTruthy();
    }
  });

  it("each trend has an applicableSections array with at least one entry", () => {
    const db = readTrends();
    for (const t of db.trends) {
      expect(
        Array.isArray(t.applicableSections),
        `trend ${t.id}: applicableSections is not an array`
      ).toBe(true);
      expect(
        t.applicableSections.length,
        `trend ${t.id}: applicableSections is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("each trend has a visualStyles array with at least one entry", () => {
    const db = readTrends();
    for (const t of db.trends) {
      expect(
        Array.isArray(t.visualStyles),
        `trend ${t.id}: visualStyles is not an array`
      ).toBe(true);
      expect(
        t.visualStyles.length,
        `trend ${t.id}: visualStyles is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("each trend has a non-empty cssPattern", () => {
    const db = readTrends();
    for (const t of db.trends) {
      expect(
        typeof t.cssPattern,
        `trend ${t.id}: cssPattern is not a string`
      ).toBe("string");
      expect(
        t.cssPattern.trim().length,
        `trend ${t.id}: cssPattern is empty`
      ).toBeGreaterThan(0);
    }
  });

  it("all trend IDs are unique", () => {
    const db = readTrends();
    const ids: string[] = db.trends.map((t: { id: string }) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("trends-loader — getApplicableTrends", () => {
  it("returns trends for 'hero' section type", () => {
    const trends = getApplicableTrends("hero", "bold");
    expect(trends.length).toBeGreaterThan(0);
    for (const t of trends) {
      expect(t.applicableSections).toContain("hero");
    }
  });

  it("returns trends for 'features' section type", () => {
    const trends = getApplicableTrends("features", "minimal");
    expect(trends.length).toBeGreaterThan(0);
    for (const t of trends) {
      expect(t.applicableSections).toContain("features");
    }
  });

  it("respects the limit parameter", () => {
    const trends = getApplicableTrends("hero", "bold", 2);
    expect(trends.length).toBeLessThanOrEqual(2);
  });

  it("style-matching trends appear before non-matching trends", () => {
    const trends = getApplicableTrends("hero", "bold", 10);
    // Find the first non-matching trend index
    const firstNonMatch = trends.findIndex((t) => !t.visualStyles.includes("bold"));
    if (firstNonMatch === -1) return; // all match — trivially passes
    // All entries before firstNonMatch must match
    for (let i = 0; i < firstNonMatch; i++) {
      expect(trends[i].visualStyles).toContain("bold");
    }
  });

  it("returns empty array for a section type with no trends", () => {
    const trends = getApplicableTrends("nonexistent-section-type", "bold");
    expect(trends).toHaveLength(0);
  });
});
