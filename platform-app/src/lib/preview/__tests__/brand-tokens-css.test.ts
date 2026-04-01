import { describe, it, expect } from "vitest";
import { brandTokensToCss, googleFontsLink } from "../brand-tokens-css";
import type { BrandTokens } from "@/lib/blueprint/types";
import type { TokenRules } from "@/lib/rules/types";

describe("brandTokensToCss", () => {
  const baseBrand: BrandTokens = {
    colors: { primary: "#2563eb", secondary: "#1e40af", accent: "#f59e0b" },
    fonts: { heading: "Inter", body: "Open Sans" },
  };

  it("generates CSS custom properties for brand colors", () => {
    const css = brandTokensToCss(baseBrand);
    expect(css).toContain("--color-primary: #2563eb;");
    expect(css).toContain("--color-secondary: #1e40af;");
    expect(css).toContain("--color-accent: #f59e0b;");
  });

  it("generates CSS custom properties for fonts", () => {
    const css = brandTokensToCss(baseBrand);
    expect(css).toContain("--font-heading: 'Inter', sans-serif;");
    expect(css).toContain("--font-body: 'Open Sans', sans-serif;");
  });

  it("wraps output in :root selector", () => {
    const css = brandTokensToCss(baseBrand);
    expect(css).toMatch(/^:root \{/);
    expect(css).toMatch(/\}$/);
  });

  it("handles empty colors gracefully", () => {
    const brand: BrandTokens = {
      colors: {},
      fonts: { heading: "Inter", body: "Inter" },
    };
    const css = brandTokensToCss(brand);
    expect(css).toContain(":root {");
    expect(css).not.toContain("--color-");
  });

  it("includes design rule tokens when provided", () => {
    const tokens: TokenRules = {
      container: "max-w-7xl mx-auto px-4",
      sectionSpacing: "py-16",
      card: "rounded-xl shadow-md",
      gridGap: "gap-8",
      typography: { h1: "text-5xl font-bold", h2: "text-3xl font-semibold", body: "text-base" },
      button: { primary: "bg-primary text-white px-6 py-3 rounded-lg" },
    };
    const css = brandTokensToCss(baseBrand, tokens);
    expect(css).toContain("--token-container: max-w-7xl mx-auto px-4;");
    expect(css).toContain("--token-section-spacing: py-16;");
    expect(css).toContain("--token-card: rounded-xl shadow-md;");
    expect(css).toContain("--token-grid-gap: gap-8;");
    expect(css).toContain("--token-typo-h1: text-5xl font-bold;");
    expect(css).toContain("--token-typo-h2: text-3xl font-semibold;");
    expect(css).toContain("--token-typo-body: text-base;");
    expect(css).toContain("--token-btn-primary: bg-primary text-white px-6 py-3 rounded-lg;");
  });

  it("omits token fields that are not set", () => {
    const tokens: TokenRules = { container: "max-w-6xl" };
    const css = brandTokensToCss(baseBrand, tokens);
    expect(css).toContain("--token-container: max-w-6xl;");
    expect(css).not.toContain("--token-section-spacing");
    expect(css).not.toContain("--token-card");
  });
});

describe("googleFontsLink", () => {
  it("generates correct URL for a single font", () => {
    const url = googleFontsLink(["Inter"]);
    expect(url).toContain("fonts.googleapis.com/css2");
    expect(url).toContain("family=Inter");
    expect(url).toContain("display=swap");
  });

  it("generates URL with multiple fonts", () => {
    const url = googleFontsLink(["Inter", "Open Sans"]);
    expect(url).toContain("family=Inter");
    expect(url).toContain("family=Open%20Sans");
  });

  it("deduplicates fonts", () => {
    const url = googleFontsLink(["Inter", "Inter", "Open Sans"]);
    const matches = url.match(/family=Inter/g);
    expect(matches).toHaveLength(1);
  });

  it("returns empty string for empty input", () => {
    expect(googleFontsLink([])).toBe("");
  });

  it("filters out empty strings", () => {
    const url = googleFontsLink(["", "Inter", ""]);
    expect(url).toContain("family=Inter");
    expect(url).not.toContain("family=&");
  });
});
