import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeInputHash } from "@/lib/transparency/input-hash";
import { runResearchPhase } from "@/lib/pipeline/phases/research";
import type { ResearchBrief } from "@/lib/pipeline/schemas";
import type { OnboardingData } from "@/lib/blueprint/types";
import type {
  ResearchPreview,
  ResearchPreviewResponse,
  ResearchPreviewError,
} from "@/lib/transparency/types";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_TIMEOUT_MS = 25_000;

/**
 * Transform a full ResearchBrief into the user-facing preview shape.
 * Sanitizes competitor names to avoid displaying real business names.
 */
function transformToPreview(
  brief: ResearchBrief,
  pages: OnboardingData["pages"]
): ResearchPreview {
  return {
    industry: brief.industry,
    targetAudience: {
      primary: brief.targetAudience.primary,
      demographics: brief.targetAudience.demographics,
      painPoints: brief.targetAudience.painPoints,
    },
    toneGuidance: {
      primary: brief.toneGuidance.primary,
      avoid: brief.toneGuidance.avoid,
      examples: brief.toneGuidance.examples,
    },
    seoKeywords: brief.seoKeywords,
    // Sanitize competitor info into positioning statements
    competitivePositioning: brief.competitors.map(
      (c) =>
        `Typical ${brief.industry} websites focus on ${c.strengths.slice(0, 2).join(" and ")}` +
        (c.weaknesses.length > 0
          ? `, but often miss ${c.weaknesses[0]}`
          : "")
    ),
    pageStrategy: (pages || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      purpose: p.description || `${p.title} page for your website`,
    })),
  };
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<ResearchPreviewResponse | ResearchPreviewError>> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json(
      { success: false, error: "siteId is required" },
      { status: 400 }
    );
  }

  // Verify the site belongs to this user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) {
    return NextResponse.json(
      { success: false, error: "Site not found" },
      { status: 404 }
    );
  }

  // Load onboarding session
  const onboarding = await prisma.onboardingSession.findFirst({
    where: { userId: session.user.id, siteId },
    orderBy: { createdAt: "desc" },
  });
  if (!onboarding) {
    return NextResponse.json(
      { success: false, error: "No onboarding session found" },
      { status: 404 }
    );
  }

  const data = (onboarding.data as Record<string, unknown>) || {};
  const currentHash = computeInputHash(data);

  // Cache hit: return stored preview
  if (
    onboarding.previewInputHash === currentHash &&
    onboarding.researchPreview
  ) {
    return NextResponse.json({
      success: true,
      data: onboarding.researchPreview as unknown as ResearchPreview,
      cached: true,
    });
  }

  // Cache miss: run Research phase with timeout
  try {
    const result = await Promise.race([
      runResearchPhase(siteId, data as OnboardingData),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Research preview timed out")),
          PREVIEW_TIMEOUT_MS
        )
      ),
    ]);

    const preview = transformToPreview(
      result.brief,
      (data as OnboardingData).pages
    );

    // Cache the preview on the onboarding session
    await prisma.onboardingSession.update({
      where: { id: onboarding.id },
      data: {
        researchPreview: JSON.parse(JSON.stringify(preview)),
        previewInputHash: currentHash,
      },
    });

    return NextResponse.json({
      success: true,
      data: preview,
      cached: false,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Research preview failed";
    console.error(`[research-preview] Failed for site ${siteId}: ${message}`);
    return NextResponse.json(
      { success: false, error: message },
      { status: 200 } // Graceful degradation — not a 500
    );
  }
}
