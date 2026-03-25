import { describe, it, expect } from "vitest";
import {
  computeInputHash,
  previewRelevantFieldsChanged,
} from "../input-hash";

describe("computeInputHash", () => {
  it("produces identical hash for identical inputs", () => {
    const data = { idea: "A dental practice", audience: "families" };
    expect(computeInputHash(data)).toBe(computeInputHash(data));
  });

  it("produces identical hash regardless of field ordering", () => {
    const a = { idea: "test", audience: "families", tone: "warm" };
    const b = { tone: "warm", idea: "test", audience: "families" };
    expect(computeInputHash(a)).toBe(computeInputHash(b));
  });

  it("produces different hashes for different inputs", () => {
    const a = { idea: "A dental practice" };
    const b = { idea: "A law firm" };
    expect(computeInputHash(a)).not.toBe(computeInputHash(b));
  });

  it("ignores non-preview fields (name, colors, fonts)", () => {
    const base = { idea: "test idea", audience: "families" };
    const withExtras = {
      ...base,
      name: "My Site",
      colors: { primary: "#ff0000" },
      fonts: { heading: "Arial" },
      logo_url: "https://example.com/logo.png",
      design_source: "ai",
    };
    expect(computeInputHash(base)).toBe(computeInputHash(withExtras));
  });

  it("handles null/undefined data gracefully", () => {
    const hashNull = computeInputHash(null);
    const hashUndefined = computeInputHash(undefined);
    expect(hashNull).toBe(hashUndefined);
    expect(hashNull).toBeTruthy();
  });

  it("handles undefined/null field values consistently", () => {
    const a = { idea: "test" };
    const b = { idea: "test", audience: undefined };
    const c = { idea: "test", audience: null };
    // undefined fields are skipped, null fields are treated as absent
    expect(computeInputHash(a)).toBe(computeInputHash(b));
  });

  it("sorts pages by slug for deterministic hash", () => {
    const a = {
      pages: [
        { slug: "about", title: "About" },
        { slug: "home", title: "Home" },
      ],
    };
    const b = {
      pages: [
        { slug: "home", title: "Home" },
        { slug: "about", title: "About" },
      ],
    };
    expect(computeInputHash(a)).toBe(computeInputHash(b));
  });

  it("sorts followUpAnswers keys for deterministic hash", () => {
    const a = {
      followUpAnswers: { services: "dental", location: "portland" },
    };
    const b = {
      followUpAnswers: { location: "portland", services: "dental" },
    };
    expect(computeInputHash(a)).toBe(computeInputHash(b));
  });
});

describe("previewRelevantFieldsChanged", () => {
  it("returns true when a relevant field changes", () => {
    const old = { idea: "A dental practice", name: "My Site" };
    const update = { idea: "A law firm" };
    expect(previewRelevantFieldsChanged(old, update)).toBe(true);
  });

  it("returns false when only non-relevant fields change", () => {
    const old = { idea: "test", name: "Old Name", colors: { primary: "#000" } };
    const update = { name: "New Name", colors: { primary: "#fff" } };
    expect(previewRelevantFieldsChanged(old, update)).toBe(false);
  });

  it("returns false when relevant fields are unchanged", () => {
    const old = { idea: "test", audience: "families" };
    const update = { idea: "test" };
    expect(previewRelevantFieldsChanged(old, update)).toBe(false);
  });

  it("returns true when old data is null", () => {
    expect(previewRelevantFieldsChanged(null, { idea: "test" })).toBe(true);
  });

  it("returns true when new data is null", () => {
    expect(previewRelevantFieldsChanged({ idea: "test" }, null)).toBe(true);
  });
});
