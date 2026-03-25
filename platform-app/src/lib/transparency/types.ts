import { z } from "zod";

/**
 * Zod schema for the research preview response shape.
 * Projects only the fields needed for user-facing strategy preview,
 * sanitizing competitor names to avoid legal issues.
 */
export const ResearchPreviewSchema = z.object({
  industry: z.string(),
  targetAudience: z.object({
    primary: z.string(),
    demographics: z.array(z.string()),
    painPoints: z.array(z.string()),
  }),
  toneGuidance: z.object({
    primary: z.string(),
    avoid: z.array(z.string()),
    examples: z.array(z.string()),
  }),
  seoKeywords: z.array(z.string()),
  competitivePositioning: z.array(z.string()),
  pageStrategy: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      purpose: z.string(),
    })
  ),
});

export type ResearchPreview = z.infer<typeof ResearchPreviewSchema>;

/**
 * API response envelope for the research preview endpoint.
 */
export interface ResearchPreviewResponse {
  success: true;
  data: ResearchPreview;
  cached: boolean;
}

export interface ResearchPreviewError {
  success: false;
  error: string;
}
