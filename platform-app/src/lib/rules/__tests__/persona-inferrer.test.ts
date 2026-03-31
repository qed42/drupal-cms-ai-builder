import { describe, it, expect } from "vitest";
import { inferPersona } from "../persona-inferrer";

describe("inferPersona", () => {
  it("returns solo-creative for photography industry", () => {
    expect(inferPersona("Photography")).toBe("solo-creative");
  });

  it("returns solo-creative for freelance designer", () => {
    expect(inferPersona("Design", "small businesses", "creative")).toBe("solo-creative");
  });

  it("returns enterprise for regulated industries", () => {
    expect(inferPersona("Financial Services", "enterprise clients")).toBe("enterprise");
  });

  it("returns small-business for local services", () => {
    expect(inferPersona("Plumbing", "local homeowners")).toBe("small-business");
  });

  it("returns small-business for restaurant", () => {
    expect(inferPersona("Restaurant")).toBe("small-business");
  });

  it("returns general when no keywords match", () => {
    expect(inferPersona("Consulting")).toBe("general");
  });

  it("returns general for empty input", () => {
    expect(inferPersona("")).toBe("general");
  });

  it("is case-insensitive", () => {
    expect(inferPersona("PHOTOGRAPHY")).toBe("solo-creative");
  });

  it("matches on audience field", () => {
    expect(inferPersona("Services", "enterprise organizations")).toBe("enterprise");
  });
});
