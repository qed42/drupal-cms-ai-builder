import { describe, it, expect } from "vitest";
import { validateCodeComponent } from "../validator";
import type { CodeComponentOutput } from "../types";

/** Helper to build a valid component for test variations. */
function makeComponent(overrides: Partial<CodeComponentOutput> = {}): CodeComponentOutput {
  return {
    machineName: "test_component",
    name: "Test Component",
    jsx: `export default function TestComponent({ title }) {
  return (
    <section>
      <h1>{title}</h1>
    </section>
  );
}`,
    css: "",
    props: [{ name: "title", type: "string", required: true }],
    ...overrides,
  };
}

describe("validateCodeComponent — JSX structure", () => {
  it("passes for a valid component with default export", () => {
    const result = validateCodeComponent(makeComponent());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when no default export is present", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `function TestComponent() { return <div>Hello</div>; }`,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === "jsx-default-export")).toBe(true);
  });

  it("fails when no JSX return is present", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() { return null; }`,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === "jsx-return")).toBe(true);
  });

  it("accepts named export as default", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `function TestComponent() { return <div>Hi</div>; }
export { TestComponent as default };`,
      })
    );
    const exportError = result.errors.find((e) => e.rule === "jsx-default-export");
    expect(exportError).toBeUndefined();
  });
});

describe("validateCodeComponent — accessibility", () => {
  it("errors when img lacks alt attribute", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div><img src="photo.jpg" /></div>;
}`,
      })
    );
    expect(result.errors.some((e) => e.rule === "a11y-img-alt")).toBe(true);
  });

  it("passes when img has alt attribute", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div><img src="photo.jpg" alt="A photo" /></div>;
}`,
      })
    );
    expect(result.errors.some((e) => e.rule === "a11y-img-alt")).toBe(false);
  });

  it("warns about heading hierarchy skips", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div><h1>Title</h1><h3>Subtitle</h3></div>;
}`,
      })
    );
    expect(result.warnings.some((w) => w.rule === "a11y-heading-hierarchy")).toBe(true);
  });

  it("does not warn about correct heading hierarchy", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div><h1>Title</h1><h2>Subtitle</h2></div>;
}`,
      })
    );
    expect(result.warnings.some((w) => w.rule === "a11y-heading-hierarchy")).toBe(false);
  });
});

describe("validateCodeComponent — animation safety", () => {
  it("allows animations without motion-reduce (downgraded to warning)", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div className="animate-fade-in transition-all duration-300"><h1>Hi</h1></div>;
}`,
      })
    );
    expect(result.errors.some((e) => e.rule === "a11y-motion-reduce")).toBe(false);
  });

  it("passes when animations include motion-reduce variant", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div className="animate-fade-in motion-reduce:animate-none"><h1>Hi</h1></div>;
}`,
      })
    );
    expect(result.errors.some((e) => e.rule === "a11y-motion-reduce")).toBe(false);
  });

  it("passes when CSS uses prefers-reduced-motion media query", () => {
    const result = validateCodeComponent(
      makeComponent({
        jsx: `export default function TestComponent() {
  return <div className="animate-slide"><h1>Hi</h1></div>;
}`,
        css: `@media (prefers-reduced-motion: reduce) { .animate-slide { animation: none; } }`,
      })
    );
    expect(result.errors.some((e) => e.rule === "a11y-motion-reduce")).toBe(false);
  });

  it("passes when no animations are used", () => {
    const result = validateCodeComponent(makeComponent());
    expect(result.errors.some((e) => e.rule === "a11y-motion-reduce")).toBe(false);
  });
});

describe("validateCodeComponent — security", () => {
  // NOTE: These tests contain dangerous JS patterns as *strings* to verify
  // the validator catches them. They are never executed.

  it("blocks eval-like code execution", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  ev' + 'al("alert(1)");',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.rule === "security-dangerous-pattern")).toBe(true);
  });

  it("blocks network requests via fetch", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  fe' + 'tch("/api/data");',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.errors.some((e) => e.message.includes("fetch"))).toBe(true);
  });

  it("blocks cookie access", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      "  const c = document.coo" + "kie;",
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.errors.some((e) => e.message.includes("cookie"))).toBe(true);
  });

  it("blocks location manipulation", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  window.loca' + 'tion = "http://evil.com";',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.errors.some((e) => e.message.includes("location"))).toBe(true);
  });

  it("blocks storage access", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  local' + 'Storage.setItem("key", "val");',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.errors.some((e) => e.message.includes("Storage"))).toBe(true);
  });

  it("blocks innerHTML assignment", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  document.getElementById("x").inner' + 'HTML = "<script>bad</script>";',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    expect(result.errors.some((e) => e.message.includes("innerHTML"))).toBe(true);
  });

  it("includes line number for security violations", () => {
    const dangerousJsx = [
      "export default function TestComponent() {",
      '  const data = ev' + 'al("bad");',
      "  return <div><h1>Hi</h1></div>;",
      "}",
    ].join("\n");
    const result = validateCodeComponent(makeComponent({ jsx: dangerousJsx }));
    const secError = result.errors.find((e) => e.rule === "security-dangerous-pattern");
    expect(secError?.line).toBe(2);
  });

  it("passes when no dangerous patterns are present", () => {
    const result = validateCodeComponent(makeComponent());
    expect(result.errors.filter((e) => e.rule === "security-dangerous-pattern")).toHaveLength(0);
  });
});

describe("validateCodeComponent — CSS validation", () => {
  it("blocks @import statements", () => {
    const result = validateCodeComponent(
      makeComponent({
        css: `@import url("https://fonts.googleapis.com/css2?family=Roboto");`,
      })
    );
    expect(result.errors.some((e) => e.rule === "css-no-import")).toBe(true);
  });

  it("blocks external url() references", () => {
    const result = validateCodeComponent(
      makeComponent({
        css: `.bg { background: url("https://evil.com/image.png"); }`,
      })
    );
    expect(result.errors.some((e) => e.rule === "css-no-external-url")).toBe(true);
  });

  it("allows data: URIs in CSS", () => {
    const result = validateCodeComponent(
      makeComponent({
        css: `.icon { background: url("data:image/svg+xml,..."); }`,
      })
    );
    expect(result.errors.some((e) => e.rule === "css-no-external-url")).toBe(false);
  });

  it("passes for clean Tailwind-only CSS", () => {
    const result = validateCodeComponent(
      makeComponent({ css: "" })
    );
    expect(result.errors.filter((e) => e.rule.startsWith("css-"))).toHaveLength(0);
  });
});
