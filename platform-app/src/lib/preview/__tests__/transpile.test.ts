import { describe, it, expect, beforeEach } from "vitest";
import { transpileJsx, clearTranspileCache, transpileCacheSize } from "../transpile";

describe("transpileJsx", () => {
  beforeEach(() => {
    clearTranspileCache();
  });

  it("transpiles valid JSX to JS", () => {
    const result = transpileJsx(`const App = () => <div>Hello</div>;`);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toContain("React.createElement");
      expect(result.code).not.toContain("<div>");
    }
  });

  it("transpiles JSX with TypeScript annotations", () => {
    const jsx = `
      interface Props { title: string; count: number; }
      const Card = ({ title, count }: Props) => (
        <div className="card">
          <h2>{title}</h2>
          <span>{count}</span>
        </div>
      );
    `;
    const result = transpileJsx(jsx);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toContain("React.createElement");
      // TypeScript types should be stripped
      expect(result.code).not.toContain("interface Props");
      expect(result.code).not.toContain(": string");
    }
  });

  it("returns error result for invalid JSX (does not throw)", () => {
    const result = transpileJsx(`const x = <div><span></div>;`);
    expect("error" in result).toBe(true);
  });

  it("caches transpilation result on same input", () => {
    const jsx = `const A = () => <p>cached</p>;`;
    transpileJsx(jsx);
    expect(transpileCacheSize()).toBe(1);

    // Second call should hit cache
    const result = transpileJsx(jsx);
    expect("code" in result).toBe(true);
    expect(transpileCacheSize()).toBe(1);
  });

  it("handles multiple components correctly", () => {
    const jsx = `
      const Header = () => <header><h1>Title</h1></header>;
      const Footer = () => <footer><p>Copyright</p></footer>;
    `;
    const result = transpileJsx(jsx);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toContain("Header");
      expect(result.code).toContain("Footer");
    }
  });

  it("handles JSX with expressions and ternaries", () => {
    const jsx = `
      const Hero = ({ show }: { show: boolean }) => (
        <section className={show ? "visible" : "hidden"}>
          {show && <h1>Hello</h1>}
        </section>
      );
    `;
    const result = transpileJsx(jsx);
    expect("code" in result).toBe(true);
  });

  it("clears cache", () => {
    transpileJsx(`const A = () => <div />;`);
    expect(transpileCacheSize()).toBe(1);
    clearTranspileCache();
    expect(transpileCacheSize()).toBe(0);
  });
});
