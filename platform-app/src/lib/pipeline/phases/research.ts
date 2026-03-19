import { prisma } from "@/lib/prisma";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { ResearchBriefSchema } from "@/lib/pipeline/schemas";
import { buildResearchPrompt } from "@/lib/ai/prompts/research";
import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief } from "@/lib/pipeline/schemas";

export interface ResearchPhaseResult {
  briefId: string;
  brief: ResearchBrief;
  durationMs: number;
}

/**
 * Execute the Research phase of the content pipeline.
 * Analyzes onboarding data and produces a validated ResearchBrief,
 * stored in the research_briefs table.
 */
export async function runResearchPhase(
  siteId: string,
  data: OnboardingData
): Promise<ResearchPhaseResult> {
  const startTime = Date.now();

  const provider = await getAIProvider("research");
  const model = resolveModel("research") || "default";
  const prompt = buildResearchPrompt(data);

  const brief = await generateValidatedJSON<ResearchBrief>(
    provider,
    prompt,
    ResearchBriefSchema,
    {
      phase: "research",
      temperature: 0.4,
      maxTokens: 4000,
    }
  );

  const durationMs = Date.now() - startTime;

  // Determine next version number
  const lastBrief = await prisma.researchBrief.findFirst({
    where: { siteId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (lastBrief?.version ?? 0) + 1;

  // Store in database
  const record = await prisma.researchBrief.create({
    data: {
      siteId,
      version,
      content: JSON.parse(JSON.stringify(brief)),
      model,
      provider: provider.name,
      durationMs,
    },
  });

  return { briefId: record.id, brief, durationMs };
}
