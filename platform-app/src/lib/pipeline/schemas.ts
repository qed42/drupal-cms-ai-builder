import { z } from "zod";

// --- Research Phase Output ---
// NOTE: OpenAI structured output requires ALL properties in `required`.
// Do not use .optional() on schemas passed to generateValidatedJSON with OpenAI.

export const ResearchBriefSchema = z.object({
  industry: z.string().describe("Industry classification"),
  targetAudience: z.object({
    primary: z.string(),
    demographics: z.array(z.string()),
    painPoints: z.array(z.string()),
  }),
  competitors: z.array(
    z.object({
      name: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })
  ),
  keyMessages: z.array(z.string()).describe("Core value propositions"),
  toneGuidance: z.object({
    primary: z.string(),
    avoid: z.array(z.string()),
    examples: z.array(z.string()),
  }),
  seoKeywords: z.array(z.string()),
  complianceNotes: z.array(z.string()).describe("Compliance considerations, empty array if none"),
});

export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

// --- Plan Phase Output ---

export const ContentPlanPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  purpose: z.string(),
  targetKeywords: z.array(z.string()),
  sections: z.array(
    z.object({
      heading: z.string(),
      type: z.string().describe("Section type: hero, features, testimonials, cta, text, gallery, etc."),
      contentBrief: z.string().describe("What content should be generated for this section"),
      estimatedWordCount: z.number().describe("Target word count for this section"),
      componentSuggestion: z.string().describe("Suggested Space DS component or empty string if none"),
    })
  ).min(3, "Each page must have at least 3 sections"),
});

export const ContentPlanSchema = z.object({
  siteName: z.string(),
  tagline: z.string(),
  pages: z.array(ContentPlanPageSchema),
  globalContent: z.object({
    services: z.array(
      z.object({
        title: z.string(),
        briefDescription: z.string(),
      })
    ),
    teamMembers: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    ).describe("Team members, empty array if not applicable"),
    testimonials: z.array(
      z.object({
        quote: z.string(),
        authorName: z.string(),
        authorRole: z.string(),
      })
    ).describe("Testimonials, empty array if not applicable"),
  }),
});

export type ContentPlan = z.infer<typeof ContentPlanSchema>;

// --- Generate Phase Output (enhanced PageLayout) ---

const PageSectionChildSchema = z.object({
  component_id: z.string(),
  slot: z.string().describe("Target slot name (e.g., column_one, slide_item, content)"),
  props_json: z.string().describe("JSON-encoded object of child component props. Must be valid JSON."),
});

export const PageSectionSchema = z.object({
  // Type A: Organism section (hero, CTA, accordion, slider)
  component_id: z.string().describe("Component ID for organism sections, empty string for composed sections"),
  props_json: z.string().describe("JSON-encoded object of component props. Must be valid JSON. Empty string for composed sections."),
  // Type B: Composed section (flexi grid with atoms in slots)
  pattern: z.string().describe("Composition pattern name (e.g., text-image-split-50-50). Empty string for organism sections."),
  section_heading: z.object({
    label: z.string().describe("Short label above the title, empty string if none"),
    title: z.string(),
    description: z.string().describe("Description text, empty string if none"),
  }).describe("Section heading config. Use empty strings for organism sections."),
  container_background: z.string().describe("Background color for container. Use values from the design system's color palette. Empty string for organism sections."),
  children: z.array(PageSectionChildSchema).describe("Child components for slots. Empty array if none."),
});

export const PageLayoutSchema = z.object({
  slug: z.string(),
  title: z.string(),
  seo: z.object({
    meta_title: z.string(),
    meta_description: z.string(),
  }),
  sections: z.array(PageSectionSchema),
});

export const BlueprintOutputSchema = z.object({
  site: z.object({
    name: z.string(),
    tagline: z.string(),
    industry: z.string(),
    audience: z.string(),
    compliance_flags: z.array(z.string()),
    tone: z.string(),
  }),
  brand: z.object({
    colors: z.record(z.string(), z.string()),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
    logo_url: z.string().describe("Logo URL or empty string if none"),
  }),
  pages: z.array(PageLayoutSchema),
  content: z.object({
    services: z.array(z.record(z.string(), z.unknown())),
    team_members: z.array(z.record(z.string(), z.unknown())),
    testimonials: z.array(z.record(z.string(), z.unknown())),
  }),
  forms: z.object({
    contact: z.object({
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.enum([
            "text",
            "email",
            "tel",
            "textarea",
            "select",
            "checkbox",
          ]),
          label: z.string(),
          required: z.boolean(),
          options: z.array(z.string()).describe("Options for select/checkbox, empty array otherwise"),
        })
      ),
    }),
  }),
});

export type BlueprintOutput = z.infer<typeof BlueprintOutputSchema>;
