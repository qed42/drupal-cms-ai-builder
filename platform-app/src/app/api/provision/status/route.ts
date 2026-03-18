import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const STEP_PROGRESS: Record<string, number> = {
  pending: 0,
  site_metadata: 15,
  page_layouts: 45,
  content: 70,
  forms: 85,
  ready: 100,
  failed: -1,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await prisma.site.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { blueprint: true },
  });

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const blueprint = site.blueprint;
  const step = blueprint?.generationStep || "pending";
  const progress = STEP_PROGRESS[step] ?? 0;

  return NextResponse.json({
    siteId: site.id,
    siteStatus: site.status,
    blueprintStatus: blueprint?.status || "none",
    generationStep: step,
    progress,
    error: blueprint?.generationError || null,
  });
}
