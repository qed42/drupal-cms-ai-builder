/**
 * Brand token integration tests.
 *
 * Verifies that every curated component JSX source file uses the required
 * CSS custom properties (brand tokens) that the live-preview sandbox injects.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getCuratedComponents, clearLoaderCache } from "../loader";

beforeEach(() => {
  clearLoaderCache();
});

describe("brand token usage — color-primary", () => {
  it("every component JSX contains var(--color-primary)", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(
        c.jsx.includes("var(--color-primary)"),
        `${c.id} is missing var(--color-primary) in JSX`
      ).toBe(true);
    }
  });
});

describe("brand token usage — font-heading", () => {
  it("every component JSX contains var(--font-heading)", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(
        c.jsx.includes("var(--font-heading)"),
        `${c.id} is missing var(--font-heading) in JSX`
      ).toBe(true);
    }
  });
});

describe("brand token usage — minimum body/text coverage", () => {
  it("every component JSX contains var(--font-body) OR var(--color-text)", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      const hasBodyFont = c.jsx.includes("var(--font-body)");
      const hasColorText = c.jsx.includes("var(--color-text)");
      expect(
        hasBodyFont || hasColorText,
        `${c.id} must use var(--font-body) or var(--color-text) in JSX`
      ).toBe(true);
    }
  });
});

describe("brand token manifest declarations", () => {
  it("every component declares brandTokensUsed with at least --color-primary", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(
        c.brandTokensUsed,
        `${c.id} has no brandTokensUsed array`
      ).toBeTruthy();
      expect(
        c.brandTokensUsed.includes("--color-primary"),
        `${c.id} does not declare --color-primary in brandTokensUsed`
      ).toBe(true);
    }
  });

  it("every component declares --font-heading in brandTokensUsed", () => {
    const components = getCuratedComponents();
    for (const c of components) {
      expect(
        c.brandTokensUsed.includes("--font-heading"),
        `${c.id} does not declare --font-heading in brandTokensUsed`
      ).toBe(true);
    }
  });

  it("each component JSX references at least 2 distinct known brand tokens", () => {
    const KNOWN_TOKENS = [
      "--color-primary", "--color-accent", "--color-surface",
      "--color-text", "--font-heading", "--font-body",
    ];
    const components = getCuratedComponents();
    for (const c of components) {
      const used = KNOWN_TOKENS.filter((token) => c.jsx.includes(`var(${token}`));
      expect(
        used.length,
        `${c.id} only references ${used.length} brand token(s) in JSX — expected at least 2`
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("layout patterns — container width", () => {
  it("non-full-viewport components use max-w- container class", () => {
    const components = getCuratedComponents();
    // Full-viewport heroes are exempt (they use min-h-screen / full bleed)
    const fullViewportIds = new Set(["hero-gradient"]);

    for (const c of components) {
      if (fullViewportIds.has(c.id)) continue;
      expect(
        c.jsx.includes("max-w-"),
        `${c.id} does not use a max-w- container class`
      ).toBe(true);
    }
  });

  it("all hero components still have internal max-w- content container", () => {
    const heroes = getCuratedComponents({ category: "hero" });
    for (const c of heroes) {
      expect(
        c.jsx.includes("max-w-"),
        `hero ${c.id} has no max-w- content container`
      ).toBe(true);
    }
  });
});

describe("layout patterns — section spacing", () => {
  it("non-hero components use py-16 or py-20 section padding", () => {
    const components = getCuratedComponents();
    // Heroes, headers, and footers use different spacing patterns
    const skipIds = new Set(["hero-gradient", "hero-split", "hero-minimal", "header-sticky", "footer-multi-column"]);

    for (const c of components) {
      if (skipIds.has(c.id)) continue;
      const hasPy16 = c.jsx.includes("py-16");
      const hasPy20 = c.jsx.includes("py-20");
      const hasPy24 = c.jsx.includes("py-24"); // also acceptable
      expect(
        hasPy16 || hasPy20 || hasPy24,
        `${c.id} does not use py-16, py-20, or py-24 section spacing`
      ).toBe(true);
    }
  });
});

describe("brand token usage — component-level spot checks", () => {
  it("hero-gradient uses var(--color-accent) for CTA button", () => {
    const c = getCuratedComponents({ category: "hero" }).find(
      (x) => x.id === "hero-gradient"
    )!;
    expect(c.jsx.includes("var(--color-accent)")).toBe(true);
  });

  it("features-grid uses var(--color-surface) for card background", () => {
    const c = getCuratedComponents({ category: "features" })[0];
    // Accept var(--color-surface) with or without a CSS fallback value
    expect(c.jsx.includes("var(--color-surface")).toBe(true);
  });
});
