/**
 * Shared helper to load research brief and content plan for a site.
 * Used by regeneration APIs that need pipeline context for AI consistency.
 */

import { prisma } from "@/lib/prisma";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";

interface PipelineContext {
  research: ResearchBrief;
  plan: ContentPlan;
}

/**
 * Load the latest research brief and content plan for a site.
 * Falls back to defaults derived from the blueprint payload if
 * no pipeline data exists.
 */
export async function loadPipelineContext(
  siteId: string,
  blueprintPayload: Record<string, unknown>
): Promise<PipelineContext> {
  const siteData = (blueprintPayload.site ?? {}) as Record<string, unknown>;

  // Load latest research brief
  const researchBrief = await prisma.researchBrief.findFirst({
    where: { siteId },
    orderBy: { version: "desc" },
  });

  const research: ResearchBrief = researchBrief
    ? (researchBrief.content as unknown as ResearchBrief)
    : {
        industry: (siteData.industry as string) ?? "general",
        targetAudience: {
          primary: (siteData.audience as string) ?? "",
          demographics: [],
          painPoints: [],
        },
        competitors: [],
        keyMessages: [],
        toneGuidance: {
          primary: (siteData.tone as string) ?? "professional",
          avoid: [],
          examples: [],
        },
        seoKeywords: [],
        complianceNotes: [],
      };

  // Load latest content plan
  const contentPlan = await prisma.contentPlan.findFirst({
    where: { siteId },
    orderBy: { version: "desc" },
  });

  const plan: ContentPlan = contentPlan
    ? (contentPlan.content as unknown as ContentPlan)
    : {
        siteName: (siteData.name as string) ?? "",
        tagline: "",
        pages: [],
        globalContent: { services: [], teamMembers: [], testimonials: [] },
      };

  return { research, plan };
}
