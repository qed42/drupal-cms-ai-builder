import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step, data } = await req.json();

  const onboarding = await prisma.onboardingSession.findFirst({
    where: { userId: session.user.id, completed: false },
    orderBy: { createdAt: "desc" },
  });

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
    },
  });

  return NextResponse.json({ ok: true, step, data: mergedData });
}
