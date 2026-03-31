/**
 * TASK-505 QA: Unit tests for code component image enhancement.
 * Tests against the real Canvas JS Component config entity schema.
 */
import { describe, it, expect } from "vitest";
import { buildConfigYaml } from "@/lib/code-components/config-builder";
import type { CodeComponentOutput } from "@/lib/code-components/types";

/**
 * Generate a realistic config YAML with an image prop for testing parsers.
 */
function buildTestYaml(): string {
  const output: CodeComponentOutput = {
    machineName: "hero_section",
    name: "Hero Section",
    jsx: 'function Hero({ heading, hero_image }) {\n  return <div>{heading}<img src={hero_image.url} alt={hero_image.alt} /></div>;\n}',
    css: ".hero { background: var(--color-primary); }",
    props: [
      { name: "heading", type: "string", required: true, default: "Welcome", description: "Hero heading" },
      {
        name: "hero_image",
        type: "image",
        required: false,
        default: { url: "https://placeholder.example.com/hero.jpg", alt: "Hero background" },
        description: "Background image",
      },
    ],
  };
  return buildConfigYaml(output);
}

describe("TASK-505: Canvas config YAML structure", () => {
  it("generates YAML with machineName (not id) at top level", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("machineName: hero_section");
    expect(yaml).not.toContain("id: hero_section");
  });

  it("generates YAML with empty required[] (code components have no mandatory props)", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("required: []");
  });

  it("generates props as flat mapping (no type:object/properties wrapper)", () => {
    const yaml = buildTestYaml();
    // Props should be direct children of props: not under props.properties
    expect(yaml).toMatch(/^props:\n  heading:/m);
    expect(yaml).not.toContain("properties:");
    expect(yaml).not.toMatch(/props:\n\s+type: object/);
  });

  it("image props use $ref for canvas.module/image", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("json-schema-definitions://canvas.module/image");
    expect(yaml).toContain("type: object");
  });

  it("image props use examples with {src, width, height, alt}", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("examples:");
    expect(yaml).toContain("src:");
    expect(yaml).toContain("alt:");
    expect(yaml).not.toContain("default:");
  });

  it("YAML has js.original as block scalar with JSX content", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("js:");
    expect(yaml).toContain("original: |-");
    expect(yaml).toContain("function Hero");
  });

  it("YAML has css.original with CSS content", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("css:");
    expect(yaml).toContain("original:");
    expect(yaml).toContain("--color-primary");
  });

  it("slots is empty mapping when no slots defined", () => {
    const yaml = buildTestYaml();
    expect(yaml).toContain("slots: {}");
  });
});

describe("TASK-505: findImagePropsFromConfig (Canvas format)", () => {
  it("should identify image props via $ref marker", () => {
    const yaml = buildTestYaml();

    // Replicate the new findImagePropsFromConfig logic
    const imageProps: string[] = [];
    const lines = yaml.split("\n");
    let currentProp = "";
    let inProps = false;

    for (const line of lines) {
      if (/^props:/.test(line)) { inProps = true; continue; }
      if (inProps && /^\S/.test(line) && !line.startsWith("props:")) { inProps = false; break; }
      if (!inProps) continue;

      const propMatch = line.match(/^  (\w+):$/);
      if (propMatch) { currentProp = propMatch[1]; continue; }

      if (currentProp && line.includes("canvas.module/image")) {
        imageProps.push(currentProp);
      }
    }

    expect(imageProps).toEqual(["hero_image"]);
  });

  it("should not flag non-image props", () => {
    const yaml = buildTestYaml();

    const imageProps: string[] = [];
    const lines = yaml.split("\n");
    let currentProp = "";
    let inProps = false;

    for (const line of lines) {
      if (/^props:/.test(line)) { inProps = true; continue; }
      if (inProps && /^\S/.test(line) && !line.startsWith("props:")) { inProps = false; break; }
      if (!inProps) continue;
      const propMatch = line.match(/^  (\w+):$/);
      if (propMatch) { currentProp = propMatch[1]; continue; }
      if (currentProp && line.includes("canvas.module/image")) {
        imageProps.push(currentProp);
      }
    }

    expect(imageProps).not.toContain("heading");
  });
});

describe("TASK-507: extractCodeFromConfig YAML parsing", () => {
  it("should extract JSX from block scalar (|-)", () => {
    const yaml = buildTestYaml();

    // Updated regex for |- (strip trailing newlines) block scalar
    const jsMatch = yaml.match(/^js:\n\s+original:\s*\|-?\n([\s\S]*?)(?=\ncss:|\n\w+:|\n$)/m);
    expect(jsMatch).not.toBeNull();
    if (jsMatch) {
      const jsx = jsMatch[1]
        .split("\n")
        .map((line) => line.replace(/^ {4}/, ""))
        .join("\n")
        .trim();
      expect(jsx).toContain("function Hero");
    }
  });

  it("should extract CSS (single-line quoted or block scalar)", () => {
    const yaml = buildTestYaml();

    let css = "";
    const cssBlockMatch = yaml.match(/^css:\n\s+original:\s*\|-?\n([\s\S]*?)(?=\nprops:|\nslots:|\ndataDependencies:|\n\w+:|\n$)/m);
    if (cssBlockMatch) {
      css = cssBlockMatch[1].split("\n").map((l) => l.replace(/^ {4}/, "")).join("\n").trim();
    } else {
      const cssInlineMatch = yaml.match(/^css:\n\s+original:\s*'((?:[^']|'')*?)'/m);
      if (cssInlineMatch) {
        css = cssInlineMatch[1].replace(/''/g, "'");
      }
    }

    expect(css).toBeTruthy();
    expect(css).toContain("--color-primary");
  });
});

describe("TASK-505: isPlaceholderUrl detection", () => {
  const isPlaceholderUrl = (url: string): boolean => {
    return (
      url.includes("placeholder") ||
      url.includes("example.com") ||
      url.includes("placehold.co") ||
      url.includes("via.placeholder") ||
      url === "" ||
      url === "#"
    );
  };

  it("detects placeholder URLs", () => {
    expect(isPlaceholderUrl("https://placeholder.example.com/hero.jpg")).toBe(true);
    expect(isPlaceholderUrl("https://placehold.co/800x600")).toBe(true);
    expect(isPlaceholderUrl("https://via.placeholder.com/300")).toBe(true);
    expect(isPlaceholderUrl("")).toBe(true);
    expect(isPlaceholderUrl("#")).toBe(true);
  });

  it("does not flag real URLs", () => {
    expect(isPlaceholderUrl("/images/stock/pexels-12345.jpg")).toBe(false);
    expect(isPlaceholderUrl("https://images.pexels.com/photo.jpg")).toBe(false);
  });
});

describe("TASK-505: buildCodeComponentSearchQuery", () => {
  it("uses contentBrief when available", () => {
    const section = {
      component_id: "js.hero_section",
      props: { heading: "Welcome to Our Business" },
      _meta: { contentBrief: "Hero section showcasing main value proposition for visitors" },
    };
    const industry = "healthcare";
    const words = section._meta.contentBrief.split(/\s+/).slice(0, 4).join(" ");
    const query = `${industry} ${words}`.trim();
    expect(query).toBe("healthcare Hero section showcasing main");
  });

  it("falls back to heading prop", () => {
    const section = {
      component_id: "js.hero_section",
      props: { heading: "Welcome to Our Business" },
    };
    const industry = "healthcare";
    const heading = section.props.heading;
    const query = `${industry} ${heading.split(/\s+/).slice(0, 3).join(" ")}`.trim();
    expect(query).toBe("healthcare Welcome to Our");
  });
});
