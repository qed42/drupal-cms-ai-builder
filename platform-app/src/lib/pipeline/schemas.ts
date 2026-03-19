import { z } from "zod";

// --- Research Phase Output ---

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
  complianceNotes: z.array(z.string()).optional(),
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
      componentSuggestion: z.string().optional().describe("Suggested Space DS component"),
    })
  ),
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
    teamMembers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
        })
      )
      .optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string(),
          authorName: z.string(),
          authorRole: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export type ContentPlan = z.infer<typeof ContentPlanSchema>;

// --- Generate Phase Output (enhanced PageLayout) ---

export const PageSectionSchema = z.object({
  component_id: z.string(),
  props: z.record(z.string(), z.unknown()),
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
    logo_url: z.string().optional(),
  }),
  pages: z.array(PageLayoutSchema),
  content: z.object({
    services: z.array(z.record(z.string(), z.unknown())).optional(),
    team_members: z.array(z.record(z.string(), z.unknown())).optional(),
    testimonials: z.array(z.record(z.string(), z.unknown())).optional(),
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
          options: z.array(z.string()).optional(),
        })
      ),
    }),
  }),
});

export type BlueprintOutput = z.infer<typeof BlueprintOutputSchema>;
