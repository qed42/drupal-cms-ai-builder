import { prisma } from "@/lib/prisma";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { ContentPlanSchema } from "@/lib/pipeline/schemas";
import { buildPlanPrompt } from "@/lib/ai/prompts/plan";
import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";

export interface PlanPhaseResult {
  planId: string;
  plan: ContentPlan;
  durationMs: number;
}

/**
 * Execute the Plan phase of the content pipeline.
 * Uses the ResearchBrief + onboarding data to produce a validated ContentPlan,
 * stored in the content_plans table.
 */
export async function runPlanPhase(
  siteId: string,
  researchBriefId: string,
  research: ResearchBrief,
  data: OnboardingData
): Promise<PlanPhaseResult> {
  const startTime = Date.now();

  const provider = await getAIProvider("plan");
  const model = resolveModel("plan") || "default";
  const prompt = buildPlanPrompt(data, research);

  const plan = await generateValidatedJSON<ContentPlan>(
    provider,
    prompt,
    ContentPlanSchema,
    {
      phase: "plan",
      temperature: 0.3,
      maxTokens: 6000,
    }
  );

  const durationMs = Date.now() - startTime;

  // Determine next version number
  const lastPlan = await prisma.contentPlan.findFirst({
    where: { siteId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (lastPlan?.version ?? 0) + 1;

  // Store in database
  const record = await prisma.contentPlan.create({
    data: {
      siteId,
      researchBriefId,
      version,
      content: JSON.parse(JSON.stringify(plan)),
      model,
      provider: provider.name,
      durationMs,
    },
  });

  return { planId: record.id, plan, durationMs };
}
