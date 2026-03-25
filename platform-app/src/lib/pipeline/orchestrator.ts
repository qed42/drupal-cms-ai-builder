import { prisma } from "@/lib/prisma";
import { runResearchPhase } from "./phases/research";
import { runPlanPhase } from "./phases/plan";
import { runGeneratePhase } from "./phases/generate";
import { runEnhancePhase } from "./phases/enhance";
import { setActiveAdapter } from "@/lib/design-systems/setup";
import { computeInputHash } from "@/lib/transparency/input-hash";
import { buildImpactBullets } from "@/lib/transparency/summary-templates";
import type { OnboardingData, BlueprintBundle } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "./schemas";
import type { ResearchPhaseResult } from "./phases/research";

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
 * Check for a cached Research preview on the OnboardingSession.
 * If a valid cache exists (hash matches current inputs), create a
 * ResearchBrief record from the cached data and skip the AI call.
 */
async function resolveResearchPhase(
  siteId: string,
  data: OnboardingData
): Promise<ResearchPhaseResult> {
  const currentHash = computeInputHash(data as Record<string, unknown>);

  // Look up the onboarding session for this site
  const onboarding = await prisma.onboardingSession.findFirst({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });

  if (
    onboarding?.previewInputHash === currentHash &&
    onboarding?.researchPreview
  ) {
    const startTime = Date.now();
    const brief = onboarding.researchPreview as unknown as ResearchBrief;

    // Determine next version number
    const lastBrief = await prisma.researchBrief.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = (lastBrief?.version ?? 0) + 1;

    // Store cached brief as a ResearchBrief record
    const record = await prisma.researchBrief.create({
      data: {
        siteId,
        version,
        content: JSON.parse(JSON.stringify(brief)),
        model: "cached",
        provider: "preview-cache",
        durationMs: Date.now() - startTime,
      },
    });

    return { briefId: record.id, brief, durationMs: Date.now() - startTime };
  }

  // No valid cache — run Research phase normally
  return runResearchPhase(siteId, data);
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

  // --- Phase 1: Research (with preview cache support) ---
  await updatePipelinePhase(siteId, "research");

  let researchResult: ResearchPhaseResult;
  try {
    researchResult = await resolveResearchPhase(siteId, data);
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

  // Generate impact summary bullets and store in blueprint payload (TASK-420)
  try {
    const briefContent = researchResult.brief as ResearchBrief;
    const planContent = planResult.plan as ContentPlan;
    const bullets = buildImpactBullets(
      briefContent,
      planContent,
      {
        industry: data.industry,
        audience: data.audience,
        tone: data.tone,
        pages: data.pages,
      }
    );
    if (bullets.length > 0) {
      const currentBlueprint = await prisma.blueprint.findUnique({
        where: { siteId },
        select: { payload: true },
      });
      if (currentBlueprint?.payload) {
        const payload = JSON.parse(JSON.stringify(currentBlueprint.payload));
        payload._impact = bullets;
        await prisma.blueprint.update({
          where: { siteId },
          data: { payload },
        });
      }
    }
  } catch (err) {
    // Impact bullets are non-critical — don't fail the pipeline
    console.warn("[pipeline] Failed to generate impact bullets:", err);
  }

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
