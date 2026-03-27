import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveStepSlug } from "@/lib/onboarding-steps";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteId = req.nextUrl.searchParams.get("siteId");

  const where: Record<string, unknown> = {
    userId: session.user.id,
    completed: false,
  };
  if (siteId) {
    where.siteId = siteId;
  }

  let onboarding = await prisma.onboardingSession.findFirst({
    where,
    orderBy: { createdAt: "desc" },
  });

  // If siteId was provided but no incomplete session found,
  // fall back to the most recent session for that site (even if completed).
  // This handles the case where generation failed and the session was
  // already marked completed.
  if (!onboarding && siteId) {
    onboarding = await prisma.onboardingSession.findFirst({
      where: { userId: session.user.id, siteId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!onboarding) {
    return NextResponse.json({ step: "start", data: {} });
  }

  return NextResponse.json({
    step: resolveStepSlug(onboarding.step),
    data: onboarding.data,
    siteId: onboarding.siteId,
  });
}
