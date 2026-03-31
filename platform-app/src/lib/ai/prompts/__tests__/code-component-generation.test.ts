import { describe, it, expect } from "vitest";
import {
  CodeComponentResponseSchema,
  buildCodeComponentPrompt,
  formatValidationFeedbackForRetry,
} from "../code-component-generation";
import type { SectionDesignBrief } from "@/lib/code-components/types";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const baseBrief: SectionDesignBrief = {
  heading: "Transform Your Business",
  contentBrief: "Hero section showcasing the company value proposition with a strong CTA",
  sectionType: "hero",
  position: 0,
  brandTokens: {
    colors: { primary: "#2563eb", accent: "#f59e0b", surface: "#f9fafb" },
    fonts: { heading: "Playfair Display", body: "Inter" },
  },
  toneGuidance: "professional yet approachable",
  animationLevel: "moderate",
  visualStyle: "bold",
};

// ---------------------------------------------------------------------------
// Zod Schema Tests
// ---------------------------------------------------------------------------

describe("CodeComponentResponseSchema", () => {
  it("validates a well-formed hero component response", () => {
    const valid = {
      machineName: "hero_gradient_abc",
      name: "Hero with Gradient",
      jsx: 'export default function HeroGradient({ title }) { return (<section><h1>{title}</h1></section>); }',
      css: "",
      props: [
        { name: "title", type: "string", required: true, default: null, description: "Headline" },
      ],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid machine names (uppercase)", () => {
    const invalid = {
      machineName: "HeroBanner",
      name: "Hero",
      jsx: 'export default function Hero({ t }) { return (<section><h1>{t}</h1></section>); }',
      css: "",
      props: [],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects machine names starting with a number", () => {
    const invalid = {
      machineName: "1hero",
      name: "Hero",
      jsx: 'export default function Hero({ t }) { return (<section><h1>{t}</h1></section>); }',
      css: "",
      props: [],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects JSX that is too short", () => {
    const invalid = {
      machineName: "hero_short",
      name: "Hero",
      jsx: "export default function Hero() {}",
      css: "",
      props: [],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates all Canvas prop types", () => {
    const valid = {
      machineName: "all_types_test",
      name: "All Types",
      jsx: 'export default function AllTypes({ a,b,c,d,e,f,g,h }) { return (<section><p>{a}</p></section>); }',
      css: "",
      props: [
        { name: "text_prop", type: "string", required: true, default: null, description: "" },
        { name: "rich_text", type: "formatted_text", required: false, default: null, description: "" },
        { name: "flag", type: "boolean", required: false, default: false, description: "" },
        { name: "count", type: "integer", required: false, default: 0, description: "" },
        { name: "price", type: "number", required: false, default: 0, description: "" },
        { name: "url", type: "link", required: false, default: null, description: "" },
        { name: "photo", type: "image", required: false, default: null, description: "" },
        { name: "clip", type: "video", required: false, default: null, description: "" },
      ],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid prop types", () => {
    const invalid = {
      machineName: "bad_type",
      name: "Bad",
      jsx: 'export default function Bad({ x }) { return (<section><p>{x}</p></section>); }',
      css: "",
      props: [{ name: "x", type: "array", required: false, default: null, description: "" }],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects prop names starting with uppercase", () => {
    const invalid = {
      machineName: "bad_prop",
      name: "Bad",
      jsx: 'export default function Bad({ Title }) { return (<section><h1>{Title}</h1></section>); }',
      css: "",
      props: [{ name: "Title", type: "string", required: true, default: null, description: "" }],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts optional slots", () => {
    const valid = {
      machineName: "with_slots",
      name: "With Slots",
      jsx: 'export default function WithSlots({ title, children }) { return (<section><h1>{title}</h1>{children}</section>); }',
      css: "",
      props: [{ name: "title", type: "string", required: true, default: null, description: "" }],
      slots: [{ name: "actions", description: "CTA buttons" }],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts response with empty slots array", () => {
    const valid = {
      machineName: "no_slots",
      name: "No Slots",
      jsx: 'export default function NoSlots({ title }) { return (<section><h1>{title}</h1></section>); }',
      css: "",
      props: [{ name: "title", type: "string", required: true, default: null, description: "" }],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slots).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Prompt Builder Tests
// ---------------------------------------------------------------------------

describe("buildCodeComponentPrompt", () => {
  it("includes the section type in the prompt", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("SECTION TYPE: HERO");
    expect(prompt).toContain("Full-viewport hero section");
  });

  it("includes brand colors from the brief", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("--color-primary: #2563eb");
    expect(prompt).toContain("--color-accent: #f59e0b");
  });

  it("includes font information", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("Playfair Display");
    expect(prompt).toContain("Inter");
  });

  it("includes animation guidance for the specified level", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("ANIMATION LEVEL: Moderate");
    expect(prompt).toContain("motion-safe:");
  });

  it("includes visual style guidance", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("VISUAL STYLE: Bold");
    expect(prompt).toContain("High contrast");
  });

  it("adapts animation guidance for subtle level", () => {
    const subtleBrief = { ...baseBrief, animationLevel: "subtle" as const };
    const prompt = buildCodeComponentPrompt(subtleBrief);
    expect(prompt).toContain("ANIMATION LEVEL: Subtle");
    expect(prompt).toContain("No entrance animations");
  });

  it("adapts visual style for minimal", () => {
    const minimalBrief = { ...baseBrief, visualStyle: "minimal" as const };
    const prompt = buildCodeComponentPrompt(minimalBrief);
    expect(prompt).toContain("VISUAL STYLE: Minimal");
    expect(prompt).toContain("whitespace");
  });

  it("includes section context from brief", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("Transform Your Business");
    expect(prompt).toContain("Hero section showcasing");
    expect(prompt).toContain("professional yet approachable");
  });

  it("marks position 0 as most prominent", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("First section (most prominent)");
  });

  it("labels non-zero positions correctly", () => {
    const secondBrief = { ...baseBrief, position: 2 };
    const prompt = buildCodeComponentPrompt(secondBrief);
    expect(prompt).toContain("Section 3");
  });

  it("includes SEO keywords when present", () => {
    const seoTrief = { ...baseBrief, targetKeywords: ["dental care", "family dentist"] };
    const prompt = buildCodeComponentPrompt(seoTrief);
    expect(prompt).toContain("dental care, family dentist");
  });

  it("includes visual rhythm section when previous sections provided", () => {
    const prev = [
      { machineName: "hero_main", sectionType: "hero" },
      { machineName: "features_grid", sectionType: "features" },
    ];
    const prompt = buildCodeComponentPrompt(baseBrief, prev);
    expect(prompt).toContain("VISUAL RHYTHM");
    expect(prompt).toContain("hero → features");
    expect(prompt).toContain("Do NOT repeat");
  });

  it("omits visual rhythm section when no previous sections", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).not.toContain("VISUAL RHYTHM");
  });

  it("includes reference examples in the prompt", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("REFERENCE EXAMPLES");
    expect(prompt).toContain("Hero with Gradient Overlay");
  });

  it("selects testimonials example for testimonials section", () => {
    const testBrief = { ...baseBrief, sectionType: "testimonials" };
    const prompt = buildCodeComponentPrompt(testBrief);
    expect(prompt).toContain("Testimonials Cards");
  });

  it("includes tech constraints", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain("export default function ComponentName");
    expect(prompt).toContain("Tailwind CSS v4");
    expect(prompt).toContain("FORBIDDEN");
    expect(prompt).toContain("motion-safe:");
  });

  it("includes output format JSON structure", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).toContain('"machineName"');
    expect(prompt).toContain('"jsx"');
    expect(prompt).toContain('"props"');
  });

  it("handles unknown section types gracefully", () => {
    const unknownBrief = { ...baseBrief, sectionType: "unknown_type" };
    const prompt = buildCodeComponentPrompt(unknownBrief);
    expect(prompt).toContain("SECTION TYPE: UNKNOWN_TYPE");
    // Falls back to features guidance
    expect(prompt).toContain("Grid of 3-4 feature");
  });

  it("handles default brand tokens when colors empty", () => {
    const noBrandBrief = {
      ...baseBrief,
      brandTokens: { colors: {}, fonts: { heading: "", body: "" } },
    };
    const prompt = buildCodeComponentPrompt(noBrandBrief);
    expect(prompt).toContain("Use default brand color variables");
  });

  it("includes design rules fragment before GENERATE NOW when provided", () => {
    const fragment = `## DESIGN RULES (Auto-resolved: global → industry-healthcare)

### Design Tokens (MUST USE — apply these exact classes for cross-section consistency)
- **Container**: \`max-w-6xl mx-auto px-6 lg:px-8\`
- **Card base**: \`rounded-2xl border border-blue-100 p-6 md:p-8 shadow-sm bg-white\``;

    const prompt = buildCodeComponentPrompt(baseBrief, undefined, fragment);
    // Fragment should be present
    expect(prompt).toContain("DESIGN RULES");
    expect(prompt).toContain("Design Tokens (MUST USE");
    expect(prompt).toContain("max-w-6xl mx-auto px-6 lg:px-8");
    expect(prompt).toContain("rounded-2xl");
    // Fragment should appear BEFORE "GENERATE NOW"
    const fragmentIdx = prompt.indexOf("DESIGN RULES");
    const generateIdx = prompt.indexOf("GENERATE NOW");
    expect(fragmentIdx).toBeLessThan(generateIdx);
    // Fragment should appear AFTER "REFERENCE EXAMPLES"
    const examplesIdx = prompt.indexOf("REFERENCE EXAMPLES");
    expect(fragmentIdx).toBeGreaterThan(examplesIdx);
  });

  it("omits design rules section when no fragment provided", () => {
    const prompt = buildCodeComponentPrompt(baseBrief);
    expect(prompt).not.toContain("DESIGN RULES");
  });

  it("includes total sections in position context", () => {
    const briefWithTotal = { ...baseBrief, position: 2, totalSections: 6 };
    const prompt = buildCodeComponentPrompt(briefWithTotal);
    expect(prompt).toContain("Section 3 of 6");
  });

  it("includes section index in GENERATE NOW instruction", () => {
    const briefWithTotal = { ...baseBrief, position: 0, totalSections: 5 };
    const prompt = buildCodeComponentPrompt(briefWithTotal);
    expect(prompt).toContain("Generate section 1 of 5 (hero)");
  });
});

// ---------------------------------------------------------------------------
// List Prop Type Tests (TASK-513)
// ---------------------------------------------------------------------------

describe("CodeComponentResponseSchema — list prop types", () => {
  it("accepts list:text prop type", () => {
    const valid = {
      machineName: "gallery_images",
      name: "Gallery",
      jsx: 'export default function Gallery({ imageUrls }) { return (<section>{imageUrls.map((u,i) => <img key={i} src={u} alt="" />)}</section>); }',
      css: "",
      props: [
        { name: "image_urls", type: "list:text", required: true, default: null, description: "List of image URLs" },
      ],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts list:integer prop type", () => {
    const valid = {
      machineName: "stats_counter",
      name: "Stats",
      jsx: 'export default function Stats({ values }) { return (<section>{values.map((v,i) => <span key={i}>{v}</span>)}</section>); }',
      css: "",
      props: [
        { name: "values", type: "list:integer", required: true, default: null, description: "List of stat values" },
      ],
      slots: [],
    };

    const result = CodeComponentResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation Feedback Formatter Tests
// ---------------------------------------------------------------------------

describe("formatValidationFeedbackForRetry", () => {
  it("formats errors with line numbers", () => {
    const errors = [
      { rule: "a11y-img-alt", message: "Missing alt attribute", line: 15 },
      { rule: "security-dangerous-pattern", message: "fetch() is not allowed", line: 23 },
    ];

    const feedback = formatValidationFeedbackForRetry(errors);
    expect(feedback).toContain("[a11y-img-alt] Missing alt attribute (line 15)");
    expect(feedback).toContain("[security-dangerous-pattern] fetch() is not allowed (line 23)");
    expect(feedback).toContain("CODE COMPONENT VALIDATION ERRORS");
    expect(feedback).toContain("Please fix these issues");
  });

  it("formats errors without line numbers", () => {
    const errors = [
      { rule: "jsx-default-export", message: "Must have a default export" },
    ];

    const feedback = formatValidationFeedbackForRetry(errors);
    expect(feedback).toContain("[jsx-default-export] Must have a default export");
    expect(feedback).not.toContain("(line");
  });
});
