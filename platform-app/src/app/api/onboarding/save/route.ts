import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step, data, siteId } = await req.json();

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

  // Fall back to completed session for this site (failed generation scenario)
  if (!onboarding && siteId) {
    onboarding = await prisma.onboardingSession.findFirst({
      where: { userId: session.user.id, siteId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!onboarding) {
    return NextResponse.json(
      { error: "No onboarding session found" },
      { status: 404 }
    );
  }

  const existingData = (onboarding.data as Record<string, unknown>) || {};
  const mergedData = { ...existingData, ...data };

  await prisma.onboardingSession.update({
    where: { id: onboarding.id },
    data: {
      step,
      data: mergedData,
      completed: false, // Re-open session if user is saving new data
    },
  });

  return NextResponse.json({ ok: true, step, data: mergedData });
}
