import { describe, it, expect } from "vitest";
import { buildConfigYaml, wrapAsCanvasTreeNode } from "../config-builder";
import type { CodeComponentOutput } from "../types";

const SAMPLE_OUTPUT: CodeComponentOutput = {
  machineName: "hero_banner",
  name: "Hero Banner",
  jsx: `export default function HeroBanner({ title, subtitle }) {
  return (
    <section className="py-20 text-center">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}`,
  css: ".hero-banner { /* scoped styles */ }",
  props: [
    { name: "title", type: "string", required: true, description: "Main heading text" },
    { name: "subtitle", type: "string", required: false, description: "Supporting text" },
  ],
  slots: [{ name: "actions", description: "CTA buttons slot" }],
};

describe("buildConfigYaml", () => {
  it("uses machineName (not id) as the entity identifier", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("machineName: hero_banner");
    expect(yaml).not.toContain("id: hero_banner");
  });

  it("includes the component name", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("name: Hero Banner");
  });

  it("includes the JSX source under js.original", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("js:");
    expect(yaml).toContain("original:");
    expect(yaml).toContain("export default function HeroBanner");
  });

  it("includes CSS source under css.original", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("css:");
    expect(yaml).toContain("hero-banner");
  });

  it("has required[] as empty array (code components have no mandatory props)", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("required: []");
  });

  it("props are flat mapping (no type:object/properties wrapper)", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toMatch(/^props:\n  title:/m);
    expect(yaml).not.toMatch(/props:\n\s+type: object/);
    expect(yaml).not.toMatch(/props:\n\s+properties:/m);
  });

  it("maps string props with examples", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("title:");
    expect(yaml).toContain("type: string");
    expect(yaml).toContain("examples:");
  });

  it("includes slots when defined", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("slots:");
    expect(yaml).toContain("actions:");
    expect(yaml).toContain("CTA buttons slot");
  });

  it("uses empty mapping for slots when none defined", () => {
    const noSlots: CodeComponentOutput = { ...SAMPLE_OUTPUT, slots: undefined };
    const yaml = buildConfigYaml(noSlots);
    expect(yaml).toContain("slots: {}");
  });

  it("maps link prop type to string with format: uri", () => {
    const output: CodeComponentOutput = {
      ...SAMPLE_OUTPUT,
      props: [{ name: "cta", type: "link", required: false }],
    };
    const yaml = buildConfigYaml(output);
    expect(yaml).toContain("cta:");
    expect(yaml).toContain("type: string");
    expect(yaml).toContain("format: uri");
  });

  it("maps image prop type to object with $ref", () => {
    const output: CodeComponentOutput = {
      ...SAMPLE_OUTPUT,
      props: [{ name: "photo", type: "image", required: false }],
    };
    const yaml = buildConfigYaml(output);
    expect(yaml).toContain("photo:");
    expect(yaml).toContain("type: object");
    expect(yaml).toContain("json-schema-definitions://canvas.module/image");
    expect(yaml).toContain("src:");
  });

  it("maps formatted_text to string with contentMediaType", () => {
    const output: CodeComponentOutput = {
      ...SAMPLE_OUTPUT,
      props: [{ name: "body", type: "formatted_text", required: false }],
    };
    const yaml = buildConfigYaml(output);
    expect(yaml).toContain("type: string");
    expect(yaml).toContain("contentMediaType:");
    expect(yaml).toContain("text/html");
    expect(yaml).not.toContain("format: html");
  });

  it("includes langcode and status", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("langcode: en");
    expect(yaml).toContain("status: true");
  });

  it("includes dependencies and dataDependencies", () => {
    const yaml = buildConfigYaml(SAMPLE_OUTPUT);
    expect(yaml).toContain("dependencies: {}");
    expect(yaml).toContain("dataDependencies: {}");
  });
});

describe("wrapAsCanvasTreeNode", () => {
  it("uses js.{machineName} format for component_id", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", { title: "Hello" });
    expect(node.component_id).toBe("js.hero_banner");
  });

  it("generates a UUID for the node", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {});
    expect(node.uuid).toBeTruthy();
    expect(node.uuid).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sets parent_uuid to null by default", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {});
    expect(node.parent_uuid).toBeNull();
  });

  it("sets parent_uuid when provided", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {}, "parent-123");
    expect(node.parent_uuid).toBe("parent-123");
  });

  it("sets slot to null by default", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {});
    expect(node.slot).toBeNull();
  });

  it("sets slot when provided", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {}, undefined, "content");
    expect(node.slot).toBe("content");
  });

  it("passes prop values as inputs", () => {
    const props = { title: "Welcome", subtitle: "Hello world" };
    const node = wrapAsCanvasTreeNode("hero_banner", props);
    expect(node.inputs).toEqual(props);
  });

  it("includes component_version placeholder", () => {
    const node = wrapAsCanvasTreeNode("hero_banner", {});
    expect(node.component_version).toBe("0000000000000000");
  });
});
