import { prisma } from "@/lib/prisma";
import { runResearchPhase } from "./phases/research";
import { runPlanPhase } from "./phases/plan";
import { runGeneratePhase } from "./phases/generate";
import { runHydratePhase } from "./phases/hydrate";
import { runEnhancePhase } from "./phases/enhance";
import { setActiveAdapter } from "@/lib/design-systems/setup";
import { computeInputHash } from "@/lib/transparency/input-hash";
import {
  buildImpactBullets,
  buildResearchSummary,
  buildPlanSummary,
  buildCompletionSummary,
} from "@/lib/transparency/summary-templates";
import type { OnboardingData, BlueprintBundle } from "@/lib/blueprint/types";
import { ResearchBriefSchema } from "./schemas";
import type { ResearchBrief, ContentPlan } from "./schemas";
import type { ResearchPhaseResult } from "./phases/research";

export type PipelinePhase =
  | "research"
  | "research_complete"
  | "plan"
  | "plan_complete"
  | "generate"
  | "generate_complete"
  | "hydrate"
  | "hydrate_complete"
  | "hydrate_failed"
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

type PipelinePhaseName = "research" | "plan" | "generate" | "hydrate" | "enhance";

/**
 * Append a reasoning message to a pipeline phase's message list.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function emitMessage(
  siteId: string,
  phase: PipelinePhaseName,
  message: string
): Promise<void> {
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { pipelineMessages: true },
    });
    const messages = (site?.pipelineMessages as Record<string, string[]>) || {};
    if (!messages[phase]) messages[phase] = [];
    messages[phase].push(message);
    await prisma.site.update({
      where: { id: siteId },
      data: { pipelineMessages: JSON.parse(JSON.stringify(messages)) },
    });
  } catch (err) {
    console.warn(`[pipeline] emitMessage failed:`, err);
  }
}

/**
 * Merge structured artifacts into a pipeline phase's artifact object.
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function emitArtifact(
  siteId: string,
  phase: PipelinePhaseName,
  artifact: Record<string, unknown>
): Promise<void> {
  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { pipelineArtifacts: true },
    });
    const artifacts = (site?.pipelineArtifacts as Record<string, Record<string, unknown>>) || {};
    artifacts[phase] = { ...(artifacts[phase] || {}), ...artifact };
    await prisma.site.update({
      where: { id: siteId },
      data: { pipelineArtifacts: JSON.parse(JSON.stringify(artifacts)) },
    });
  } catch (err) {
    console.warn(`[pipeline] emitArtifact failed:`, err);
  }
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
    // Validate cached preview against schema — it may have been stored
    // by an older version or a preview endpoint that skipped validation.
    const parsed = ResearchBriefSchema.safeParse(onboarding.researchPreview);
    if (!parsed.success) {
      // Cached preview is stale or incomplete — run fresh research
      return runResearchPhase(siteId, data);
    }
    const brief = parsed.data;

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

  // Clear messages and artifacts from any previous run
  await prisma.site.update({
    where: { id: siteId },
    data: {
      pipelineMessages: JSON.parse("{}"),
      pipelineArtifacts: JSON.parse("{}"),
    },
  });

  // --- Phase 1: Research (with preview cache support) ---
  await updatePipelinePhase(siteId, "research");
  await emitMessage(siteId, "research", `Analyzing your ${data.industry || ""} business${data.audience ? ` targeting ${data.audience}` : ""}...`);

  let researchResult: ResearchPhaseResult;
  try {
    researchResult = await resolveResearchPhase(siteId, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research phase failed";
    await emitMessage(siteId, "research", `Research couldn't complete — ${message}`);
    await updatePipelinePhase(siteId, "research_failed", message);
    throw err;
  }

  // Emit input-aware research findings
  const brief = researchResult.brief as ResearchBrief;
  await emitMessage(siteId, "research", buildResearchSummary(brief));
  if (brief.keyMessages?.length) {
    await emitMessage(siteId, "research", `Key messages: ${brief.keyMessages.slice(0, 3).join(", ")}${brief.keyMessages.length > 3 ? "..." : ""}`);
  }
  if (brief.complianceNotes?.length) {
    await emitMessage(siteId, "research", `Compliance considerations: ${brief.complianceNotes.join(", ")}`);
  }
  await emitArtifact(siteId, "research", {
    industry: brief.industry,
    services: brief.keyMessages || [],
    complianceFlags: brief.complianceNotes || [],
  });

  await updatePipelinePhase(siteId, "research_complete");

  // --- Phase 2: Plan ---
  await updatePipelinePhase(siteId, "plan");
  await emitMessage(siteId, "plan", `Designing page structure for your ${brief.industry || data.industry || ""} site...`);

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
    await emitMessage(siteId, "plan", `Planning couldn't complete — ${message}`);
    await updatePipelinePhase(siteId, "plan_failed", message);
    throw err;
  }

  // Emit input-aware plan findings
  const plan = planResult.plan as ContentPlan;
  const pageNames = plan.pages.map((p) => p.title);
  const onboardingPageSlugs = data.pages?.map((p) => p.slug) || [];
  await emitMessage(siteId, "plan", buildPlanSummary(plan, onboardingPageSlugs));
  if (plan.tagline) {
    await emitMessage(siteId, "plan", `Site tagline: "${plan.tagline}"`);
  }
  await emitArtifact(siteId, "plan", { pages: pageNames });

  await updatePipelinePhase(siteId, "plan_complete");

  // --- Phase 3: Generate ---
  await updatePipelinePhase(siteId, "generate");

  const toneName = brief.toneGuidance?.primary || data.tone || "";

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
        const toneNote = toneName ? ` in your ${toneName} tone` : "";
        await emitMessage(siteId, "generate", `Writing ${pageName}${toneNote} (${pageIndex + 1} of ${totalPages})`);
        await emitArtifact(siteId, "generate", {
          currentPage: pageName,
          currentPageIndex: pageIndex,
          totalPages,
        });
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generate phase failed";
    await emitMessage(siteId, "generate", `Content generation couldn't complete — ${message}`);
    await updatePipelinePhase(siteId, "generate_failed", message);
    throw err;
  }

  await emitMessage(siteId, "generate", `All ${pageNames.length} pages written successfully`);
  await updatePipelinePhase(siteId, "generate_complete");

  // --- Phase 3.5: Hydrate (content enrichment for code components) ---
  if (data.generationMode === "code_components") {
    await updatePipelinePhase(siteId, "hydrate");
    await emitMessage(siteId, "hydrate", `Populating your ${brief.industry || "business"} content...`);

    try {
      const hydrateResult = await runHydratePhase(
        siteId,
        data,
        researchResult.brief as ResearchBrief,
        planResult.plan as ContentPlan
      );
      await emitMessage(
        siteId,
        "hydrate",
        `${hydrateResult.propsHydrated} content fields populated (${hydrateResult.propsDirectMapped} mapped, ${hydrateResult.propsAiGenerated} AI-generated)`
      );
      await emitArtifact(siteId, "hydrate", {
        propsHydrated: hydrateResult.propsHydrated,
        propsDirectMapped: hydrateResult.propsDirectMapped,
        propsAiGenerated: hydrateResult.propsAiGenerated,
      });
    } catch (err) {
      // Hydrate failures are non-fatal — site works with AI-generated defaults
      const message = err instanceof Error ? err.message : "Hydrate phase failed";
      console.warn(`[pipeline] Hydrate phase failed (non-fatal): ${message}`);
      await emitMessage(siteId, "hydrate", `Content enrichment had issues — using generated defaults. ${message}`);
      await updatePipelinePhase(siteId, "hydrate_failed");
      // Continue to Enhance — don't throw
    }

    await updatePipelinePhase(siteId, "hydrate_complete");
  }

  // --- Phase 4: Enhance (stock images) ---
  await updatePipelinePhase(siteId, "enhance");
  await emitMessage(siteId, "enhance", `Finding photos to match your ${brief.industry || "business"} content...`);

  let imagesPlaced = 0;

  try {
    // Load the saved blueprint for image enhancement
    const blueprintRecord = await prisma.blueprint.findUnique({
      where: { siteId },
      select: { payload: true },
    });

    if (blueprintRecord?.payload) {
      const blueprint = blueprintRecord.payload as unknown as BlueprintBundle;
      const enhanceResult = await runEnhancePhase(siteId, blueprint);
      imagesPlaced = enhanceResult.imagesAdded;
      await emitMessage(siteId, "enhance", `${enhanceResult.imagesAdded} images placed across all pages`);
      await emitArtifact(siteId, "enhance", {
        imagesPlaced: enhanceResult.imagesAdded,
        imagesTotal: enhanceResult.imagesAdded + enhanceResult.imagesFailed,
      });
    }
  } catch (err) {
    // Enhance failures are non-fatal — site works without images
    const message = err instanceof Error ? err.message : "Enhance phase failed";
    console.warn(`[pipeline] Enhance phase failed (non-fatal): ${message}`);
    await emitMessage(siteId, "enhance", `Image matching had issues — your site will work without images. ${message}`);
    await updatePipelinePhase(siteId, "enhance_failed");
    // Continue to review — don't throw
  }

  await updatePipelinePhase(siteId, "enhance_complete");

  // Emit pipeline completion summary with concrete metrics
  const totalSections = plan.pages.reduce(
    (sum, p) => sum + (p.sections?.length ?? 0),
    0
  );
  const totalKeywords = Array.isArray(brief.seoKeywords) ? brief.seoKeywords.length : 0;
  await emitMessage(
    siteId,
    "enhance",
    buildCompletionSummary(pageNames.length, totalSections, imagesPlaced, totalKeywords)
  );

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
