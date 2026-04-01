import { describe, it, expect } from "vitest";
import {
  sanitizeJsx,
  isPostMessageAllowed,
  validatePostMessageOrigin,
  CSP_META_TAG,
  escapeHtml,
} from "../sanitize";

describe("sanitizeJsx", () => {
  // Code execution patterns
  it("blocks eval()", () => {
    const input = 'eval("alert(1)")';
    expect(sanitizeJsx(input)).toContain("/* blocked */");
    expect(sanitizeJsx(input)).not.toMatch(/\beval\b/);
  });

  it("blocks constructor-based code execution", () => {
    // Testing that the sanitizer blocks the "Function(" pattern
    const input = 'new Function' + '("return 1")';
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  it("blocks setTimeout with string arg", () => {
    const input = 'setTimeout("alert(1)", 0)';
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  it("blocks setInterval with string arg", () => {
    const input = 'setInterval("alert(1)", 1000)';
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  // Network access patterns
  it("blocks fetch()", () => {
    expect(sanitizeJsx('fetch("https://evil.com")')).toContain("/* blocked */");
  });

  it("blocks XMLHttpRequest", () => {
    const input = "new XMLHttpRequest()";
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  it("blocks WebSocket", () => {
    const input = 'new WebSocket("ws://evil")';
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  it("blocks navigator.sendBeacon", () => {
    expect(sanitizeJsx('navigator.sendBeacon("/log", data)')).toContain("/* blocked */");
  });

  // Dynamic imports
  it("blocks dynamic import()", () => {
    expect(sanitizeJsx('import("./malicious")')).toContain("/* blocked */");
  });

  it("blocks require()", () => {
    expect(sanitizeJsx('require("fs")')).toContain("/* blocked */");
  });

  // Storage access
  it("blocks cookie access", () => {
    const input = "const c = document.cookie";
    expect(sanitizeJsx(input)).toContain("/* blocked */");
  });

  it("blocks localStorage", () => {
    expect(sanitizeJsx('localStorage.getItem("key")')).toContain("/* blocked */");
  });

  it("blocks sessionStorage", () => {
    expect(sanitizeJsx('sessionStorage.setItem("k", "v")')).toContain("/* blocked */");
  });

  it("blocks indexedDB", () => {
    expect(sanitizeJsx('indexedDB.open("db")')).toContain("/* blocked */");
  });

  // Parent frame access
  it("blocks window.parent", () => {
    expect(sanitizeJsx("window.parent.location")).toContain("/* blocked */");
  });

  it("blocks window.top", () => {
    expect(sanitizeJsx("window.top.document")).toContain("/* blocked */");
  });

  it("blocks parent.postMessage", () => {
    expect(sanitizeJsx('parent.postMessage({}, "*")')).toContain("/* blocked */");
  });

  it("blocks window.opener", () => {
    expect(sanitizeJsx("window.opener.close()")).toContain("/* blocked */");
  });

  // Safe JSX passes through unchanged
  it("does not modify safe JSX", () => {
    const safe = `
      const Hero = ({ title, subtitle }) => (
        <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-white">{title}</h1>
            <p className="mt-4 text-xl text-white/80">{subtitle}</p>
          </div>
        </section>
      );
    `;
    expect(sanitizeJsx(safe)).toBe(safe);
  });

  it("handles multiple dangerous patterns in one string", () => {
    const malicious = 'eval("x"); fetch("/steal"); localStorage.getItem("token")';
    const result = sanitizeJsx(malicious);
    expect(result).not.toMatch(/\beval\b/);
    expect(result).not.toMatch(/\bfetch\b/);
    expect(result).not.toMatch(/\blocalStorage\b/);
  });
});

describe("isPostMessageAllowed", () => {
  it("allows valid message types", () => {
    expect(isPostMessageAllowed("section-click")).toBe(true);
    expect(isPostMessageAllowed("section-hover")).toBe(true);
    expect(isPostMessageAllowed("ready")).toBe(true);
    expect(isPostMessageAllowed("error")).toBe(true);
    expect(isPostMessageAllowed("update-props")).toBe(true);
    expect(isPostMessageAllowed("replace-section")).toBe(true);
    expect(isPostMessageAllowed("update-section")).toBe(true);
  });

  it("rejects unknown message types", () => {
    expect(isPostMessageAllowed("steal-cookies")).toBe(false);
    expect(isPostMessageAllowed("")).toBe(false);
    expect(isPostMessageAllowed("navigate")).toBe(false);
    expect(isPostMessageAllowed("execute")).toBe(false);
  });
});

describe("validatePostMessageOrigin", () => {
  it("accepts null origin (srcdoc iframe)", () => {
    expect(validatePostMessageOrigin("null")).toBe(true);
  });

  it("accepts expected origin", () => {
    expect(validatePostMessageOrigin("http://localhost:3000", "http://localhost:3000")).toBe(true);
  });

  it("rejects unexpected origins", () => {
    expect(validatePostMessageOrigin("https://evil.com")).toBe(false);
    expect(validatePostMessageOrigin("https://evil.com", "http://localhost:3000")).toBe(false);
  });

  it("rejects empty string origin", () => {
    expect(validatePostMessageOrigin("")).toBe(false);
  });
});

describe("CSP_META_TAG", () => {
  it("contains default-src none", () => {
    expect(CSP_META_TAG).toContain("default-src 'none'");
  });

  it("allows inline scripts, eval, Tailwind CDN, and unpkg CDN", () => {
    expect(CSP_META_TAG).toContain("script-src 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com");
  });

  it("allows Google Fonts", () => {
    expect(CSP_META_TAG).toContain("style-src 'unsafe-inline' https://fonts.googleapis.com");
    expect(CSP_META_TAG).toContain("font-src https://fonts.gstatic.com");
  });

  it("allows images from any source", () => {
    expect(CSP_META_TAG).toContain("img-src * data: blob:");
  });

  it("blocks all network connections", () => {
    expect(CSP_META_TAG).toContain("connect-src 'none'");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });
});
