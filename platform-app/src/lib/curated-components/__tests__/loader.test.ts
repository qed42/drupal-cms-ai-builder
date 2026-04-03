import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  getCuratedComponents,
  getCuratedComponent,
  selectCuratedComponent,
  clearLoaderCache,
} from "../loader";

const COMPONENTS_DIR = path.resolve(__dirname, "..");

beforeEach(() => {
  clearLoaderCache();
});

describe("getCuratedComponents — full list", () => {
  it("returns all 24 components from the manifest", () => {
    const components = getCuratedComponents();
    expect(components).toHaveLength(24);
  });

  it("every component has required fields", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.category).toBeTruthy();
      expect(Array.isArray(c.visualStyles)).toBe(true);
      expect(Array.isArray(c.propsSchema)).toBe(true);
    }
  });
});

describe("getCuratedComponents — category filter", () => {
  it("filters by category 'hero' and returns 3 components", () => {
    const heroes = getCuratedComponents({ category: "hero" });
    expect(heroes).toHaveLength(3);
    for (const c of heroes) {
      expect(c.category).toBe("hero");
    }
  });

  it("filters by category 'features' and returns 2 components", () => {
    const features = getCuratedComponents({ category: "features" });
    expect(features).toHaveLength(2);
  });

  it("filters by category 'cta' and returns 3 components", () => {
    const cta = getCuratedComponents({ category: "cta" });
    expect(cta).toHaveLength(3);
    expect(cta.map((c) => c.id)).toContain("cta-banner");
  });

  it("returns empty array for unknown category", () => {
    const result = getCuratedComponents({ category: "unknown-category" });
    expect(result).toHaveLength(0);
  });
});

describe("getCuratedComponents — visualStyle filter", () => {
  it("filters by visualStyle 'minimal'", () => {
    const minimal = getCuratedComponents({ visualStyle: "minimal" });
    expect(minimal.length).toBeGreaterThan(0);
    for (const c of minimal) {
      expect(c.visualStyles).toContain("minimal");
    }
  });

  it("filters by visualStyle 'bold'", () => {
    const bold = getCuratedComponents({ visualStyle: "bold" });
    expect(bold.length).toBeGreaterThan(0);
    for (const c of bold) {
      expect(c.visualStyles).toContain("bold");
    }
  });

  it("returns empty array for unknown visualStyle", () => {
    const result = getCuratedComponents({ visualStyle: "nonexistent-style" });
    expect(result).toHaveLength(0);
  });
});

describe("getCuratedComponent — by ID", () => {
  it("returns hero-gradient by ID", () => {
    const c = getCuratedComponent("hero-gradient");
    expect(c).not.toBeNull();
    expect(c!.id).toBe("hero-gradient");
    expect(c!.category).toBe("hero");
  });

  it("returns features-grid by ID", () => {
    const c = getCuratedComponent("features-grid");
    expect(c).not.toBeNull();
    expect(c!.id).toBe("features-grid");
  });

  it("returns null for unknown ID", () => {
    const c = getCuratedComponent("does-not-exist");
    expect(c).toBeNull();
  });

  it("returns null for empty string ID", () => {
    const c = getCuratedComponent("");
    expect(c).toBeNull();
  });
});

describe("selectCuratedComponent — scoring", () => {
  it("returns hero-gradient for ('hero', 'bold', 'moderate')", () => {
    const c = selectCuratedComponent("hero", "bold", "moderate");
    expect(c).not.toBeNull();
    expect(c!.id).toBe("hero-gradient");
  });

  it("returns hero-minimal for ('hero', 'minimal', 'subtle')", () => {
    const c = selectCuratedComponent("hero", "minimal", "subtle");
    expect(c).not.toBeNull();
    expect(c!.id).toBe("hero-minimal");
  });

  it("maps 'header' section type to header category", () => {
    const c = selectCuratedComponent("header", "bold", "subtle");
    expect(c).not.toBeNull();
    expect(c!.category).toBe("header");
  });

  it("maps 'services' section type to services category", () => {
    const c = selectCuratedComponent("services", "elegant", "moderate");
    expect(c).not.toBeNull();
    expect(c!.category).toBe("services");
  });

  it("maps 'metrics' section type to stats category", () => {
    const c = selectCuratedComponent("metrics", "bold", "moderate");
    expect(c).not.toBeNull();
    expect(c!.category).toBe("stats");
  });

  it("returns null for unknown section type", () => {
    const c = selectCuratedComponent("unknown-section", "bold", "moderate");
    expect(c).toBeNull();
  });
});

describe("component source files on disk", () => {
  it("all component JSX source files exist and are non-empty", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      const jsxPath = path.join(COMPONENTS_DIR, c.source.jsx);
      expect(fs.existsSync(jsxPath), `JSX missing for ${c.id}: ${jsxPath}`).toBe(true);
      const content = fs.readFileSync(jsxPath, "utf-8");
      expect(content.trim().length, `JSX empty for ${c.id}`).toBeGreaterThan(0);
    }
  });

  it("all component CSS source files exist", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      const cssPath = path.join(COMPONENTS_DIR, c.source.css);
      expect(fs.existsSync(cssPath), `CSS missing for ${c.id}: ${cssPath}`).toBe(true);
    }
  });

  it("loaded jsx field is non-empty for every component", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(c.jsx.trim().length, `jsx field empty for ${c.id}`).toBeGreaterThan(0);
    }
  });
});

describe("clearLoaderCache", () => {
  it("manifest reloads fresh after clearLoaderCache", () => {
    // Prime the cache
    const first = getCuratedComponents();
    expect(first).toHaveLength(24);

    // Clear and reload — should produce the same result without throwing
    clearLoaderCache();
    const second = getCuratedComponents();
    expect(second).toHaveLength(24);

    // IDs should be identical
    const firstIds = first.map((c) => c.id).sort();
    const secondIds = second.map((c) => c.id).sort();
    expect(secondIds).toEqual(firstIds);
  });

  it("component cache is cleared — objects are re-read from disk", () => {
    const before = getCuratedComponent("hero-gradient");
    clearLoaderCache();
    const after = getCuratedComponent("hero-gradient");
    // Both should be valid and equivalent in content
    expect(after).not.toBeNull();
    expect(after!.jsx).toBe(before!.jsx);
  });
});
