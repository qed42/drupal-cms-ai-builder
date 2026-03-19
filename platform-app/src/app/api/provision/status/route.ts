import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
  research_failed: -1,
  plan_failed: -1,
  generate_failed: -1,
};

interface PipelinePhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
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
  if (site.status === "provisioning" || site.status === "live" || site.status === "provisioning_failed") {
    progress = SITE_STATUS_PROGRESS[site.status] ?? 70;
  } else if (pipelinePhase && pipelinePhase in PIPELINE_PHASE_PROGRESS) {
    progress = PIPELINE_PHASE_PROGRESS[pipelinePhase] ?? 0;
  } else {
    progress = GENERATION_STEP_PROGRESS[generationStep] ?? 0;
  }

  // Build pipeline status object
  const pipeline = await buildPipelineStatus(site.id, pipelinePhase, site.pipelineError);

  return NextResponse.json({
    siteId: site.id,
    siteName: site.name || "Untitled Site",
    siteStatus: site.status,
    blueprintStatus: blueprint?.status || "none",
    generationStep,
    pipelinePhase: pipelinePhase || null,
    progress,
    pipeline,
    error: blueprint?.generationError || site.pipelineError || null,
  });
}

/**
 * Build pipeline phase status from database records.
 */
async function buildPipelineStatus(
  siteId: string,
  currentPhase: string | null,
  pipelineError: string | null
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

  // Determine research phase status
  const research: PipelinePhaseStatus = buildPhaseStatus(
    "research",
    currentPhase,
    pipelineError,
    researchBrief
      ? {
          durationMs: researchBrief.durationMs ?? undefined,
          summary: summarizeResearchBrief(researchBrief.content),
        }
      : undefined
  );

  // Determine plan phase status
  const plan: PipelinePhaseStatus = buildPhaseStatus(
    "plan",
    currentPhase,
    pipelineError,
    contentPlan
      ? {
          durationMs: contentPlan.durationMs ?? undefined,
          summary: summarizeContentPlan(contentPlan.content),
        }
      : undefined
  );

  // Generate phase — placeholder for Sprint 12
  const generate: PipelinePhaseStatus = { status: "pending" };

  return { research, plan, generate };
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

function summarizeResearchBrief(content: unknown): string {
  try {
    const brief = content as {
      seoKeywords?: string[];
      complianceNotes?: string[];
      keyMessages?: string[];
      targetAudience?: { painPoints?: string[] };
    };
    const keywords = brief.seoKeywords?.length ?? 0;
    const compliance = brief.complianceNotes?.length ?? 0;
    const messages = brief.keyMessages?.length ?? 0;
    const painPoints = brief.targetAudience?.painPoints?.length ?? 0;
    return `${keywords} SEO keywords, ${messages} key messages, ${painPoints} pain points, ${compliance} compliance notes`;
  } catch {
    return "Research brief generated";
  }
}

function summarizeContentPlan(content: unknown): string {
  try {
    const plan = content as {
      pages?: { title: string; sections?: unknown[] }[];
      globalContent?: { services?: unknown[] };
    };
    const pageCount = plan.pages?.length ?? 0;
    const totalSections = (plan.pages ?? []).reduce(
      (sum, p) => sum + (p.sections?.length ?? 0),
      0
    );
    const services = plan.globalContent?.services?.length ?? 0;
    return `${pageCount} pages, ${totalSections} sections, ${services} services planned`;
  } catch {
    return "Content plan generated";
  }
}
