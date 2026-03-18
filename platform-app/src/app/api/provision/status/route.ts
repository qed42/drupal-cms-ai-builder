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

  // Calculate overall progress based on current phase.
  let progress: number;
  if (site.status === "provisioning" || site.status === "live" || site.status === "provisioning_failed") {
    // In provisioning phase — use site status progress.
    progress = SITE_STATUS_PROGRESS[site.status] ?? 70;
  } else {
    // In blueprint generation phase — use generation step progress.
    progress = GENERATION_STEP_PROGRESS[generationStep] ?? 0;
  }

  return NextResponse.json({
    siteId: site.id,
    siteName: site.name || "Untitled Site",
    siteStatus: site.status,
    blueprintStatus: blueprint?.status || "none",
    generationStep,
    progress,
    error: blueprint?.generationError || null,
  });
}
