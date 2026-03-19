import { prisma } from "@/lib/prisma";
import { runResearchPhase } from "./phases/research";
import { runPlanPhase } from "./phases/plan";
import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief } from "./schemas";

export type PipelinePhase =
  | "research"
  | "research_complete"
  | "plan"
  | "plan_complete"
  | "research_failed"
  | "plan_failed";

export interface PipelineResult {
  researchBriefId: string;
  contentPlanId: string;
  totalDurationMs: number;
}

/**
 * Update the site's pipeline phase and optionally record an error.
 */
async function updatePipelinePhase(
  siteId: string,
  phase: PipelinePhase,
  error?: string
): Promise<void> {
  await prisma.site.update({
    where: { id: siteId },
    data: {
      pipelinePhase: phase,
      pipelineError: error || null,
    },
  });
}

/**
 * Run the content pipeline: Research → Plan.
 *
 * Updates Site.pipelinePhase at each transition. On error, sets the phase
 * to `{phase}_failed` and records the error message.
 *
 * Sprint 12 will extend this to add the Generate phase.
 */
export async function runPipeline(
  siteId: string,
  data: OnboardingData
): Promise<PipelineResult> {
  const pipelineStart = Date.now();

  // --- Phase 1: Research ---
  await updatePipelinePhase(siteId, "research");

  let researchResult;
  try {
    researchResult = await runResearchPhase(siteId, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research phase failed";
    await updatePipelinePhase(siteId, "research_failed", message);
    throw err;
  }

  await updatePipelinePhase(siteId, "research_complete");

  // --- Phase 2: Plan ---
  await updatePipelinePhase(siteId, "plan");

  let planResult;
  try {
    planResult = await runPlanPhase(
      siteId,
      researchResult.briefId,
      researchResult.brief as ResearchBrief,
      data
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Plan phase failed";
    await updatePipelinePhase(siteId, "plan_failed", message);
    throw err;
  }

  await updatePipelinePhase(siteId, "plan_complete");

  return {
    researchBriefId: researchResult.briefId,
    contentPlanId: planResult.planId,
    totalDurationMs: Date.now() - pipelineStart,
  };
}
