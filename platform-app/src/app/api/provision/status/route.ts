import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  buildResearchSummary,
  buildPlanSummary,
  buildGenerateProgressSummary,
  buildCompletionSummary,
} from "@/lib/transparency/summary-templates";

// Blueprint generation steps (0-85%).
const GENERATION_STEP_PROGRESS: Record<string, number> = {
  pending: 0,
  site_metadata: 10,
  page_layouts: 25,
  content: 40,
  forms: 50,
  ready: 55,
  failed: -1,
};

// Site status progress (55-100%).
const SITE_STATUS_PROGRESS: Record<string, number> = {
  onboarding: 0,
  generating: 5,
  blueprint_ready: 55,
  review: 60,
  provisioning: 70,
  live: 100,
  provisioning_failed: -1,
};

// Pipeline phase progress mapping (used when v2 pipeline is active).
const PIPELINE_PHASE_PROGRESS: Record<string, number> = {
  research: 5,
  research_complete: 15,
  plan: 20,
  plan_complete: 30,
  generate: 35,
  generate_complete: 50,
  enhance: 52,
  enhance_complete: 55,
  research_failed: -1,
  plan_failed: -1,
  generate_failed: -1,
  enhance_failed: -1,
};

interface PipelinePhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
  messages?: string[];
  artifacts?: Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept optional ?siteId= to query a specific site (with ownership check).
  const siteId = req.nextUrl.searchParams.get("siteId");

  const site = await prisma.site.findFirst({
    where: {
      userId: session.user.id,
      ...(siteId ? { id: siteId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { blueprint: true },
  });

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const blueprint = site.blueprint;
  const generationStep = blueprint?.generationStep || "pending";
  const pipelinePhase = site.pipelinePhase;

  // Calculate overall progress — prefer pipeline phase if active.
  let progress: number;
  let provisioningProgress: { currentStep: number; totalSteps: number; stepLabel: string } | null = null;

  if (site.status === "provisioning" && pipelinePhase?.startsWith("provision:")) {
    // Parse provisioning step progress: "provision:5/12:Adding website features"
    const match = pipelinePhase.match(/^provision:(\d+)\/(\d+):(.+)$/);
    if (match) {
      const current = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      const label = match[3];
      // Map provisioning steps to 70-99% range (100% = live).
      progress = 70 + Math.round((current / total) * 29);
      provisioningProgress = { currentStep: current, totalSteps: total, stepLabel: label };
    } else {
      progress = 70;
    }
  } else if (site.status === "review" || site.status === "provisioning" || site.status === "live" || site.status === "provisioning_failed") {
    progress = SITE_STATUS_PROGRESS[site.status] ?? 70;
  } else if (pipelinePhase && (pipelinePhase in PIPELINE_PHASE_PROGRESS || pipelinePhase.startsWith("generate:") || pipelinePhase.startsWith("enhance"))) {
    if (pipelinePhase.startsWith("generate:")) {
      // Per-page progress: "generate:2/6:Services" → interpolate between 35-50
      const match = pipelinePhase.match(/^generate:(\d+)\/(\d+):/);
      if (match) {
        const current = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        progress = 35 + Math.round((current / total) * 15);
      } else {
        progress = 35;
      }
    } else {
      progress = PIPELINE_PHASE_PROGRESS[pipelinePhase] ?? 0;
    }
  } else {
    progress = GENERATION_STEP_PROGRESS[generationStep] ?? 0;
  }

  // Fetch onboarding session for context-aware summaries
  const onboardingSession = await prisma.onboardingSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  const onboardingPages: string[] = (() => {
    try {
      const data = onboardingSession?.data as { pages?: Array<{ slug: string }> } | null;
      return data?.pages?.map((p) => p.slug) || [];
    } catch {
      return [];
    }
  })();

  // Build pipeline status object
  const pipelineMessages = (site as Record<string, unknown>).pipelineMessages as Record<string, string[]> | null;
  const pipelineArtifacts = (site as Record<string, unknown>).pipelineArtifacts as Record<string, Record<string, unknown>> | null;
  const pipeline = await buildPipelineStatus(site.id, pipelinePhase, site.pipelineError, onboardingPages, pipelineMessages, pipelineArtifacts);

  return NextResponse.json({
    siteId: site.id,
    siteName: site.name || "Untitled Site",
    siteStatus: site.status,
    blueprintStatus: blueprint?.status || "none",
    generationStep,
    pipelinePhase: pipelinePhase || null,
    progress,
    pipeline,
    provisioningProgress,
    error: blueprint?.generationError || site.pipelineError || null,
  });
}

/**
 * Build pipeline phase status from database records.
 */
async function buildPipelineStatus(
  siteId: string,
  currentPhase: string | null,
  pipelineError: string | null,
  onboardingPages: string[],
  pipelineMessages?: Record<string, string[]> | null,
  pipelineArtifacts?: Record<string, Record<string, unknown>> | null
): Promise<Record<string, PipelinePhaseStatus>> {
  // Fetch latest research brief and content plan for this site
  const [researchBrief, contentPlan] = await Promise.all([
    prisma.researchBrief.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
    }),
    prisma.contentPlan.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
    }),
  ]);

  // Determine research phase status — use rich template summaries (TASK-407)
  let researchSummary: string | undefined;
  try {
    researchSummary = researchBrief
      ? buildResearchSummary(researchBrief.content as Parameters<typeof buildResearchSummary>[0])
      : undefined;
  } catch {
    researchSummary = "Research brief generated";
  }
  const research: PipelinePhaseStatus = buildPhaseStatus(
    "research",
    currentPhase,
    pipelineError,
    researchBrief
      ? { durationMs: researchBrief.durationMs ?? undefined, summary: researchSummary }
      : undefined
  );

  // Determine plan phase status — use rich template summaries (TASK-407)
  let planSummary: string | undefined;
  try {
    planSummary = contentPlan
      ? buildPlanSummary(contentPlan.content as Parameters<typeof buildPlanSummary>[0], onboardingPages)
      : undefined;
  } catch {
    planSummary = "Content plan generated";
  }
  const plan: PipelinePhaseStatus = buildPhaseStatus(
    "plan",
    currentPhase,
    pipelineError,
    contentPlan
      ? { durationMs: contentPlan.durationMs ?? undefined, summary: planSummary }
      : undefined
  );

  // Generate phase status — check blueprint for completion or parse per-page progress (TASK-407)
  const generate: PipelinePhaseStatus = buildGeneratePhaseStatus(
    currentPhase,
    pipelineError,
    researchBrief !== null && contentPlan !== null,
    contentPlan?.content as { pages?: Array<{ title: string; targetKeywords?: string[] }> } | null
  );

  // Enhance phase status (stock images)
  const enhance: PipelinePhaseStatus = buildEnhancePhaseStatus(currentPhase, pipelineError);

  // Attach messages and artifacts to each phase
  const phases = { research, plan, generate, enhance };
  for (const [key, phase] of Object.entries(phases)) {
    if (pipelineMessages?.[key]?.length) {
      phase.messages = pipelineMessages[key];
    }
    if (pipelineArtifacts?.[key]) {
      phase.artifacts = pipelineArtifacts[key];
    }
  }

  return phases;
}

function buildPhaseStatus(
  phaseName: string,
  currentPhase: string | null,
  pipelineError: string | null,
  completedData?: { durationMs?: number; summary?: string }
): PipelinePhaseStatus {
  if (completedData) {
    return {
      status: "complete",
      durationMs: completedData.durationMs,
      summary: completedData.summary,
    };
  }

  if (currentPhase === phaseName) {
    return { status: "in_progress" };
  }

  if (currentPhase === `${phaseName}_failed`) {
    return {
      status: "failed",
      error: pipelineError || `${phaseName} phase failed`,
    };
  }

  return { status: "pending" };
}


function buildGeneratePhaseStatus(
  currentPhase: string | null,
  pipelineError: string | null,
  prerequisitesComplete: boolean,
  planContent?: { pages?: Array<{ title: string; targetKeywords?: string[] }> } | null
): PipelinePhaseStatus {
  if (currentPhase === "generate_complete") {
    const pageCount = planContent?.pages?.length ?? 0;
    const summary = pageCount > 0
      ? `Generated ${pageCount} page${pageCount === 1 ? "" : "s"} with full content`
      : "All pages generated";
    return { status: "complete", summary };
  }

  if (currentPhase === "generate_failed") {
    return {
      status: "failed",
      error: pipelineError || "Generate phase failed",
    };
  }

  // Per-page progress: "generate:2/6:Services" — use rich template (TASK-407)
  if (currentPhase?.startsWith("generate:")) {
    const match = currentPhase.match(/^generate:(\d+)\/(\d+):(.+)$/);
    if (match) {
      const pageIndex = parseInt(match[1], 10);
      const totalPages = parseInt(match[2], 10);
      const pageName = match[3];
      // Look up target keywords for current page from content plan
      const keywords = planContent?.pages?.find(
        (p) => p.title === pageName
      )?.targetKeywords;
      return {
        status: "in_progress",
        summary: buildGenerateProgressSummary(pageName, pageIndex, totalPages, keywords),
      };
    }
    return { status: "in_progress" };
  }

  if (currentPhase === "generate") {
    return { status: "in_progress" };
  }

  // If prerequisites are done but generate hasn't started, it's pending
  if (prerequisitesComplete && currentPhase === "plan_complete") {
    return { status: "pending" };
  }

  return { status: "pending" };
}

function buildEnhancePhaseStatus(
  currentPhase: string | null,
  pipelineError: string | null
): PipelinePhaseStatus {
  if (currentPhase === "enhance_complete") {
    return { status: "complete", summary: "Images added to pages" };
  }

  if (currentPhase === "enhance_failed") {
    // Enhance failures are non-fatal, show as complete with note
    return { status: "complete", summary: "Completed (some images skipped)" };
  }

  if (currentPhase === "enhance") {
    return { status: "in_progress", summary: "Adding images to your pages..." };
  }

  // Enhance starts after generate_complete
  if (currentPhase === "generate_complete") {
    return { status: "pending" };
  }

  return { status: "pending" };
}

