import { describe, it, expect } from "vitest";
import { getSDCRendererSource, SUPPORTED_SDC_TYPES } from "../sdc-renderers";

describe("getSDCRendererSource", () => {
  const source = getSDCRendererSource();

  it("returns non-empty JavaScript source", () => {
    expect(source.length).toBeGreaterThan(100);
  });

  it("defines SDC_RENDERERS registry", () => {
    expect(source).toContain("SDC_RENDERERS");
  });

  it("includes all supported component types", () => {
    for (const type of SUPPORTED_SDC_TYPES) {
      expect(source).toContain(`SDC_RENDERERS["${type}"]`);
    }
  });

  it("includes UnsupportedComponent fallback", () => {
    expect(source).toContain("UnsupportedComponent");
  });

  it("includes renderSDCComponent lookup function", () => {
    expect(source).toContain("renderSDCComponent");
  });

  it("exposes renderers on window for iframe access", () => {
    expect(source).toContain("window.__renderSDCComponent");
    expect(source).toContain("window.__SDC_RENDERERS");
  });

  it("uses brand token CSS variables in renderers", () => {
    expect(source).toContain("var(--color-primary");
    expect(source).toContain("var(--font-heading");
    expect(source).toContain("var(--color-text");
    expect(source).toContain("var(--font-body");
  });

  it("hero renderer handles background image", () => {
    expect(source).toContain("backgroundImage");
    expect(source).toContain("backgroundSize");
  });

  it("card renderer handles image objects", () => {
    // Should handle both {src} and {url} image formats
    expect(source).toContain("image.src");
    expect(source).toContain("image.url");
  });

  it("strips SDC prefix in component ID lookup", () => {
    // The lookup should strip "sdc.{ds}.space-" prefix
    expect(source).toContain('replace(/^sdc');
  });
});

describe("SUPPORTED_SDC_TYPES", () => {
  it("has at least 15 component types", () => {
    expect(SUPPORTED_SDC_TYPES.length).toBeGreaterThanOrEqual(15);
  });

  it("includes core component types", () => {
    expect(SUPPORTED_SDC_TYPES).toContain("hero");
    expect(SUPPORTED_SDC_TYPES).toContain("card");
    expect(SUPPORTED_SDC_TYPES).toContain("button");
    expect(SUPPORTED_SDC_TYPES).toContain("footer");
    expect(SUPPORTED_SDC_TYPES).toContain("accordion");
    expect(SUPPORTED_SDC_TYPES).toContain("tabs");
    expect(SUPPORTED_SDC_TYPES).toContain("image");
    expect(SUPPORTED_SDC_TYPES).toContain("text-block");
  });
});
