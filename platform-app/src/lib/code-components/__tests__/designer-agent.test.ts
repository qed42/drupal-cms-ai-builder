import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SectionDesignBrief } from "../types";

// ---------------------------------------------------------------------------
// Mock AI provider + factory
// ---------------------------------------------------------------------------

const mockGenerateJSON = vi.fn();
const mockProvider = { generateJSON: mockGenerateJSON };

vi.mock("@/lib/ai/factory", () => ({
  getAIProvider: vi.fn().mockResolvedValue({
    generateJSON: (...args: unknown[]) => mockGenerateJSON(...args),
  }),
  resolveModel: vi.fn().mockReturnValue("test-model"),
}));

// We need to mock generateValidatedJSON to bypass the actual provider wrapper
// but still test our validation retry logic. The real generateValidatedJSON calls
// provider.generateJSON internally — we mock it to just call the Zod schema.
vi.mock("@/lib/ai/validation", () => ({
  generateValidatedJSON: vi.fn().mockImplementation(
    async (_provider: unknown, _prompt: string, schema: { parse: (v: unknown) => unknown }) => {
      const rawResult = await mockGenerateJSON();
      return schema.parse(rawResult);
    }
  ),
}));

import { generateCodeComponent, DesignerAgentError } from "../designer-agent";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const baseBrief: SectionDesignBrief = {
  heading: "Our Services",
  contentBrief: "Feature grid showing three core services",
  sectionType: "features",
  position: 1,
  brandTokens: {
    colors: { primary: "#2563eb" },
    fonts: { heading: "Inter", body: "Inter" },
  },
  toneGuidance: "professional",
  animationLevel: "moderate",
  visualStyle: "minimal",
};

const validResponse = {
  machineName: "features_grid_abc123",
  name: "Features Grid",
  jsx: `export default function FeaturesGrid({ title, desc }) {
  return (
    <section className="py-16 px-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-4 text-gray-600">{desc}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-xl hover:shadow-md transition-shadow motion-reduce:transition-none">Card 1</div>
        <div className="p-6 rounded-xl hover:shadow-md transition-shadow motion-reduce:transition-none">Card 2</div>
        <div className="p-6 rounded-xl hover:shadow-md transition-shadow motion-reduce:transition-none">Card 3</div>
      </div>
    </section>
  );
}`,
  css: "",
  props: [
    { name: "title", type: "string" as const, required: true, default: null, description: "Section heading" },
    { name: "desc", type: "string" as const, required: false, default: null, description: "Section description" },
  ],
  slots: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("generateCodeComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a DesignerAgentResult on valid generation", async () => {
    mockGenerateJSON.mockResolvedValueOnce(validResponse);

    const result = await generateCodeComponent(baseBrief);

    expect(result.output.machineName).toBe("features_grid_abc123");
    expect(result.output.name).toBe("Features Grid");
    expect(result.output.jsx).toContain("export default function");
    expect(result.configYaml).toContain("machineName: features_grid_abc123");
    expect(result.treeNode.component_id).toBe("js.features_grid_abc123");
    expect(result.treeNode.uuid).toBeTruthy();
    expect(result.validationResult.valid).toBe(true);
    expect(result.retryCount).toBe(0);
  });

  it("includes props in the tree node inputs", async () => {
    mockGenerateJSON.mockResolvedValueOnce({
      ...validResponse,
      props: [
        { name: "title", type: "string", required: true, default: "Hello", description: "Title" },
        { name: "desc", type: "string", required: false, default: null, description: "Description" },
      ],
    });

    const result = await generateCodeComponent(baseBrief);

    expect(result.treeNode.inputs).toEqual({ title: "Hello", desc: "" });
  });

  it("retries on validation failure and succeeds", async () => {
    // First attempt: missing default export (structural validation failure)
    const invalidResponse = {
      ...validResponse,
      jsx: `function Bad({ title }) {
  return (
    <section>
      <h2>{title}</h2>
    </section>
  );
}`,
    };

    // Second attempt: valid
    mockGenerateJSON
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(validResponse);

    const result = await generateCodeComponent(baseBrief);

    expect(result.retryCount).toBe(1);
    expect(result.validationResult.valid).toBe(true);
    expect(mockGenerateJSON).toHaveBeenCalledTimes(2);
  });

  it("throws DesignerAgentError after exhausting all retries", async () => {
    // All 3 attempts return invalid response (missing default export)
    const invalidResponse = {
      ...validResponse,
      jsx: `function Bad({ title }) {
  return (
    <section>
      <h2>{title}</h2>
    </section>
  );
}`,
    };

    mockGenerateJSON
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(invalidResponse);

    await expect(generateCodeComponent(baseBrief)).rejects.toThrow(
      DesignerAgentError
    );
    expect(mockGenerateJSON).toHaveBeenCalledTimes(3);
  });

  it("DesignerAgentError includes section type and last validation", async () => {
    const invalidResponse = {
      ...validResponse,
      jsx: `function Bad({ title }) {
  return (
    <section>
      <h2>{title}</h2>
    </section>
  );
}`,
    };

    mockGenerateJSON
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(invalidResponse)
      .mockResolvedValueOnce(invalidResponse);

    try {
      await generateCodeComponent(baseBrief);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DesignerAgentError);
      const agentErr = err as DesignerAgentError;
      expect(agentErr.sectionType).toBe("features");
      expect(agentErr.lastValidation).toBeDefined();
      expect(agentErr.lastValidation!.errors.length).toBeGreaterThan(0);
    }
  });

  it("passes previous sections to the prompt builder", async () => {
    mockGenerateJSON.mockResolvedValueOnce(validResponse);

    const prev = [{ machineName: "hero_main", sectionType: "hero" }];
    await generateCodeComponent(baseBrief, prev);

    // Verify the mock was called (prompt building happens internally)
    expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
  });

  it("generates valid config YAML for the component", async () => {
    mockGenerateJSON.mockResolvedValueOnce(validResponse);

    const result = await generateCodeComponent(baseBrief);

    expect(result.configYaml).toContain("langcode: en");
    expect(result.configYaml).toContain("status: true");
    expect(result.configYaml).toContain("name: Features Grid");
    expect(result.configYaml).toContain("js:");
    expect(result.configYaml).toContain("original:");
  });

  it("handles response with slots", async () => {
    const withSlots = {
      ...validResponse,
      slots: [{ name: "actions", description: "CTA buttons" }],
    };

    mockGenerateJSON.mockResolvedValueOnce(withSlots);

    const result = await generateCodeComponent(baseBrief);

    expect(result.output.slots).toHaveLength(1);
    expect(result.output.slots![0].name).toBe("actions");
    expect(result.configYaml).toContain("slots:");
    expect(result.configYaml).toContain("actions:");
  });

  it("propagates non-validation errors immediately", async () => {
    mockGenerateJSON.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    await expect(generateCodeComponent(baseBrief)).rejects.toThrow(
      "API rate limit exceeded"
    );
    expect(mockGenerateJSON).toHaveBeenCalledTimes(1);
  });
});
