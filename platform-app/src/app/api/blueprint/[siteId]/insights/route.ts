import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/blueprint/[siteId]/insights
 * Returns ResearchBrief, ContentPlan, and review scores for section-level
 * transparency tooltips. Lazy-loaded on first info-icon click.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;

  // Validate ownership
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    select: { id: true },
  });

  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch research brief, content plan, and blueprint review data in parallel
  const [researchBrief, contentPlan, blueprint] = await Promise.all([
    prisma.researchBrief.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
      select: { content: true },
    }),
    prisma.contentPlan.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
      select: { content: true },
    }),
    prisma.blueprint.findUnique({
      where: { siteId },
      select: { payload: true },
    }),
  ]);

  // Extract review scores from blueprint payload
  const payload = blueprint?.payload as Record<string, unknown> | null;
  const reviewScores = payload?._review as Array<{
    page: string;
    review?: { score: number; passed: boolean };
  }> | undefined;

  // Project only needed fields from research brief
  const brief = researchBrief?.content as {
    industry?: string;
    targetAudience?: {
      primary?: string;
      painPoints?: string[];
    };
    toneGuidance?: {
      primary?: string;
      avoid?: string[];
    };
    seoKeywords?: string[];
    complianceNotes?: string[];
  } | null;

  // Project content plan pages with sections
  const plan = contentPlan?.content as {
    pages?: Array<{
      slug: string;
      title: string;
      targetKeywords?: string[];
      sections?: Array<{
        heading: string;
        type: string;
        contentBrief: string;
      }>;
    }>;
  } | null;

  const data = {
    research: brief
      ? {
          industry: brief.industry,
          audience: brief.targetAudience?.primary,
          painPoints: brief.targetAudience?.painPoints || [],
          tone: brief.toneGuidance?.primary,
          toneAvoid: brief.toneGuidance?.avoid || [],
          seoKeywords: brief.seoKeywords || [],
          complianceNotes: brief.complianceNotes || [],
        }
      : null,
    contentPlan: plan
      ? {
          pages: (plan.pages || []).reduce(
            (acc, p) => {
              acc[p.slug] = {
                title: p.title,
                targetKeywords: p.targetKeywords || [],
                sections: (p.sections || []).map((s) => ({
                  heading: s.heading,
                  type: s.type,
                  contentBrief: s.contentBrief,
                })),
              };
              return acc;
            },
            {} as Record<
              string,
              {
                title: string;
                targetKeywords: string[];
                sections: Array<{
                  heading: string;
                  type: string;
                  contentBrief: string;
                }>;
              }
            >
          ),
        }
      : null,
    reviewScores: reviewScores
      ? reviewScores.reduce(
          (acc, r) => {
            if (r.review) acc[r.page] = { score: r.review.score, passed: r.review.passed };
            return acc;
          },
          {} as Record<string, { score: number; passed: boolean }>
        )
      : null,
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=3600",
    },
  });
}
