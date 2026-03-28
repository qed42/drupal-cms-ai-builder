import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { previewRelevantFieldsChanged } from "@/lib/transparency/input-hash";
import { Prisma } from "@prisma/client";
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

  // Fall back to any session (completed or not) — handles re-entry after generation
  if (!onboarding) {
    onboarding = await prisma.onboardingSession.findFirst({
      where: {
        userId: session.user.id,
        ...(siteId ? { siteId } : {}),
      },
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

  // Save core onboarding data first — this must never fail
  const updatePayload: Record<string, unknown> = {
    step,
    data: mergedData,
    completed: false, // Re-open session if user is saving new data
  };

  // Persist generation mode and design preferences as dedicated columns (M26)
  if (data?.generationMode) {
    updatePayload.generationMode = data.generationMode;
  }
  if (data?.designPreferences) {
    updatePayload.designPreferences = data.designPreferences;
  }

  await prisma.onboardingSession.update({
    where: { id: onboarding.id },
    data: updatePayload,
  });

  // Invalidate research preview cache if preview-relevant fields changed.
  // Separate query so cache invalidation failures never block onboarding.
  const shouldInvalidatePreview = previewRelevantFieldsChanged(
    existingData,
    data
  );
  if (shouldInvalidatePreview) {
    try {
      await prisma.onboardingSession.update({
        where: { id: onboarding.id },
        data: {
          researchPreview: Prisma.DbNull,
          previewInputHash: null,
        },
      });
    } catch (err) {
      // Non-fatal: cache invalidation failure doesn't block onboarding
      console.warn("[save] Preview cache invalidation failed:", err);
    }
  }

  // Persist the project name to the Site record so the dashboard shows it
  if ((step === "name" || step === "describe") && data?.name && onboarding.siteId) {
    await prisma.site.update({
      where: { id: onboarding.siteId },
      data: { name: data.name },
    });
  }

  return NextResponse.json({ ok: true, step, data: mergedData });
}
