import { describe, it, expect } from "vitest";
import { buildPreviewHtml } from "../build-preview-html";
import { CSP_META_TAG } from "../sanitize";
import type { PreviewPayload } from "../types";

function makePayload(overrides?: Partial<PreviewPayload>): PreviewPayload {
  return {
    page: {
      slug: "home",
      title: "Home",
      seo: { meta_title: "Home", meta_description: "Home page" },
      sections: [
        {
          component_id: "js.hero_section",
          props: { heading: "Welcome", cta_text: "Get Started" },
          _meta: { codeComponent: { machineName: "hero_section", generatedAt: "", validationPassed: true, retryCount: 0 } },
        },
      ],
    },
    brand: {
      colors: { primary: "#2563eb", secondary: "#1e40af", accent: "#f59e0b" },
      fonts: { heading: "Inter", body: "Open Sans" },
    },
    codeComponentSources: {
      hero_section: {
        jsx: 'const HeroSection = ({ heading }) => <section><h1>{heading}</h1></section>;',
        css: ".hero { padding: 4rem; }",
      },
    },
    generationMode: "code_components",
    ...overrides,
  };
}

describe("buildPreviewHtml", () => {
  it("generates a valid HTML document structure", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
    expect(html).toContain('id="root"');
  });

  it("includes CSP meta tag", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain(CSP_META_TAG);
  });

  it("includes brand token CSS custom properties", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("--color-primary: #2563eb");
    expect(html).toContain("--color-secondary: #1e40af");
    expect(html).toContain("--font-heading: 'Inter'");
    expect(html).toContain("--font-body: 'Open Sans'");
  });

  it("includes Tailwind CDN script", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("cdn.tailwindcss.com");
  });

  it("includes Google Fonts link tags", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("fonts.gstatic.com");
    expect(html).toContain("Inter");
  });

  it("includes React 18 UMD scripts", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("unpkg.com/react@18.3.1/umd/react.production.min.js");
    expect(html).toContain("unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js");
  });

  it("includes serialized preview data", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("__PREVIEW_DATA__");
    expect(html).toContain("JSON.parse");
  });

  it("code_components mode includes Babel standalone script", () => {
    const html = buildPreviewHtml(makePayload({ generationMode: "code_components" }));
    expect(html).toContain("babel");
  });

  it("design_system mode includes SDC renderer code", () => {
    const html = buildPreviewHtml(makePayload({
      generationMode: "design_system",
      codeComponentSources: {},
    }));
    expect(html).toContain("SDC_RENDERERS");
    expect(html).toContain("renderSDCComponent");
    expect(html).not.toContain("sucrase@");
  });

  it("design_system mode does NOT include Babel standalone", () => {
    const html = buildPreviewHtml(makePayload({
      generationMode: "design_system",
      codeComponentSources: {},
    }));
    expect(html).not.toContain("babel.min.js");
  });

  it("includes section wrapper with data-section-index", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("data-section-index");
  });

  it("includes click handler for sections", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("section-click");
  });

  it("includes hover handler for sections", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("section-hover");
  });

  it("includes error boundary", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("ErrorBoundary");
    expect(html).toContain("section-error");
  });

  it("posts ready message after mount", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain('{ type: "ready" }');
  });

  it("sanitizes JSX before embedding", () => {
    const payload = makePayload({
      codeComponentSources: {
        hero_section: {
          jsx: 'const Hero = () => { fetch("/steal"); return <div>evil</div>; };',
          css: "",
        },
      },
    });
    const html = buildPreviewHtml(payload);
    // fetch should be sanitized to /* blocked */
    expect(html).toContain("/* blocked */");
  });

  it("omits Google Fonts when fonts are empty", () => {
    const html = buildPreviewHtml(makePayload({
      brand: { colors: { primary: "#000" }, fonts: { heading: "", body: "" } },
    }));
    expect(html).not.toContain("fonts.googleapis.com/css2");
  });

  it("includes base styles for section interaction", () => {
    const html = buildPreviewHtml(makePayload());
    expect(html).toContain("[data-section-index]:hover");
    expect(html).toContain("section-active");
  });
});
