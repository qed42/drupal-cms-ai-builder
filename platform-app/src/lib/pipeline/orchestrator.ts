import { prisma } from "@/lib/prisma";
import { runResearchPhase } from "./phases/research";
import { runPlanPhase } from "./phases/plan";
import { runGeneratePhase } from "./phases/generate";
import { runEnhancePhase } from "./phases/enhance";
import { setActiveAdapter } from "@/lib/design-systems/setup";
import type { OnboardingData, BlueprintBundle } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "./schemas";

export type PipelinePhase =
  | "research"
  | "research_complete"
  | "plan"
  | "plan_complete"
  | "generate"
  | "generate_complete"
  | "enhance"
  | "enhance_complete"
  | "research_failed"
  | "plan_failed"
  | "generate_failed"
  | "enhance_failed";

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
 * Run the full content pipeline: Research → Plan → Generate.
 *
 * Updates Site.pipelinePhase at each transition. On error, sets the phase
 * to `{phase}_failed` and records the error message.
 *
 * After Generate completes, transitions site to "review" status and stores
 * the blueprint in the database.
 */
export async function runPipeline(
  siteId: string,
  blueprintId: string,
  data: OnboardingData
): Promise<PipelineResult> {
  // Activate the user-selected design system adapter for this pipeline run.
  setActiveAdapter(data.designSystemId || "space_ds");

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

  // --- Phase 3: Generate ---
  await updatePipelinePhase(siteId, "generate");

  try {
    await runGeneratePhase(
      siteId,
      data,
      researchResult.brief as ResearchBrief,
      planResult.plan as ContentPlan,
      async (pageName, pageIndex, totalPages) => {
        // Update pipeline phase with per-page progress detail
        await prisma.site.update({
          where: { id: siteId },
          data: {
            pipelinePhase: `generate:${pageIndex + 1}/${totalPages}:${pageName}`,
          },
        });
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generate phase failed";
    await updatePipelinePhase(siteId, "generate_failed", message);
    throw err;
  }

  await updatePipelinePhase(siteId, "generate_complete");

  // --- Phase 4: Enhance (stock images) ---
  await updatePipelinePhase(siteId, "enhance");

  try {
    // Load the saved blueprint for image enhancement
    const blueprintRecord = await prisma.blueprint.findUnique({
      where: { siteId },
      select: { payload: true },
    });

    if (blueprintRecord?.payload) {
      const blueprint = blueprintRecord.payload as unknown as BlueprintBundle;
      await runEnhancePhase(siteId, blueprint);
    }
  } catch (err) {
    // Enhance failures are non-fatal — site works without images
    const message = err instanceof Error ? err.message : "Enhance phase failed";
    console.warn(`[pipeline] Enhance phase failed (non-fatal): ${message}`);
    await updatePipelinePhase(siteId, "enhance_failed");
    // Continue to review — don't throw
  }

  await updatePipelinePhase(siteId, "enhance_complete");

  // Transition site to "review" status
  await prisma.site.update({
    where: { id: siteId },
    data: { status: "review" },
  });

  return {
    researchBriefId: researchResult.briefId,
    contentPlanId: planResult.planId,
    totalDurationMs: Date.now() - pipelineStart,
  };
}
