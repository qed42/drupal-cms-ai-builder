import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

const MANIFEST_PATH = resolve(
  __dirname,
  "../src/lib/ai/space-component-manifest.json"
);

test.describe("TASK-110: Space SDC Component Manifest", () => {
  let manifest: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    group: string;
    category: string;
    props: Array<{ name: string; type: string; required: boolean }>;
    slots: Array<{ name: string; title: string; description: string }>;
    usage_hint: string;
  }>;

  test.beforeAll(() => {
    const raw = readFileSync(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(raw);
  });

  test("manifest JSON file exists and is valid JSON", () => {
    expect(manifest).toBeDefined();
    expect(Array.isArray(manifest)).toBe(true);
  });

  test("manifest includes all 84 Space DS components", () => {
    expect(manifest.length).toBe(84);
  });

  test("every component has required fields: id, name, category, props, slots, usage_hint", () => {
    for (const c of manifest) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.category).toBeTruthy();
      expect(Array.isArray(c.props)).toBe(true);
      expect(Array.isArray(c.slots)).toBe(true);
      expect(c.usage_hint).toBeTruthy();
      expect(c.usage_hint.length).toBeGreaterThan(20);
    }
  });

  test("component IDs follow space_ds: prefix convention", () => {
    for (const c of manifest) {
      expect(c.id).toMatch(/^space_ds:space-/);
    }
  });

  test("manifest covers all 4 categories", () => {
    const categories = new Set(manifest.map((c) => c.category));
    expect(categories).toContain("base");
    expect(categories).toContain("atom");
    expect(categories).toContain("molecule");
    expect(categories).toContain("organism");
  });

  test("organism components have blueprint-mapping context in usage hints", () => {
    const organisms = manifest.filter((c) => c.category === "organism");
    expect(organisms.length).toBeGreaterThanOrEqual(30);

    for (const c of organisms) {
      // Enriched hints should mention "Best for:" or "Blueprint mapping:"
      const hasMapping =
        c.usage_hint.includes("Best for:") ||
        c.usage_hint.includes("Blueprint mapping:") ||
        c.usage_hint.includes("Maps to") ||
        c.usage_hint.includes("OBSOLETE");
      expect(hasMapping).toBe(true);
    }
  });

  test("props include type information", () => {
    const withProps = manifest.filter((c) => c.props.length > 0);
    expect(withProps.length).toBeGreaterThan(50);

    for (const c of withProps) {
      for (const p of c.props) {
        expect(p.name).toBeTruthy();
        expect(p.type).toBeTruthy();
        expect(typeof p.required).toBe("boolean");
      }
    }
  });

  test("hero banner variants are all present (11 styles)", () => {
    const heroes = manifest.filter((c) => c.id.includes("hero-banner-style"));
    expect(heroes.length).toBe(11);
  });

  test("CTA banner variants are all present (3 types)", () => {
    const ctas = manifest.filter((c) => c.id.includes("cta-banner-type"));
    expect(ctas.length).toBe(3);
  });

  test("team section variants are all present (6 variants)", () => {
    const teams = manifest.filter((c) => c.id.includes("team-section"));
    expect(teams.length).toBe(6);
  });

  test("export script exists and is executable", () => {
    const scriptPath = resolve(__dirname, "../scripts/export-component-manifest.mjs");
    const script = readFileSync(scriptPath, "utf-8");
    expect(script).toContain("findComponentFiles");
    expect(script).toContain("BLUEPRINT_HINTS");
    expect(script).toContain("usage_hint");
  });
});
