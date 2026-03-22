import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSubdomain, spawnProvisioning } from "@/lib/provisioning";
import { getAdapter } from "@/lib/design-systems/setup";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Accept optional siteId from request body (used by review page approve flow).
    const body = await req.json().catch(() => ({}));
    const requestedSiteId = (body as { siteId?: string }).siteId;

    // Find the user's latest site eligible for provisioning.
    // "review" status is now valid — users approve from the review page.
    const site = await prisma.site.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["blueprint_ready", "review", "provisioning_failed"] },
        ...(requestedSiteId ? { id: requestedSiteId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { blueprint: true },
    });

    if (!site) {
      return NextResponse.json(
        { error: "No site eligible for provisioning found" },
        { status: 404 }
      );
    }

    if (!site.blueprint || site.blueprint.status !== "ready") {
      return NextResponse.json(
        { error: "Blueprint is not ready for provisioning" },
        { status: 400 }
      );
    }

    const blueprintPayload = site.blueprint.payload as Record<string, unknown>;
    const siteData = blueprintPayload.site as Record<string, string> | undefined;
    const subdomain = generateSubdomain(site.name || "site");

    // Update site status to provisioning and clear any previous error state.
    await prisma.site.update({
      where: { id: site.id },
      data: {
        status: "provisioning",
        subdomain,
        pipelineError: null,
        pipelinePhase: null,
      },
    });

    // Resolve the design system theme from the onboarding session.
    const onboarding = await prisma.onboardingSession.findFirst({
      where: { siteId: site.id },
      orderBy: { createdAt: "desc" },
      select: { data: true },
    });
    const onboardingData = (onboarding?.data as Record<string, unknown>) || {};
    const designSystemId = (onboardingData.designSystemId as string) || "space_ds";
    const adapter = getAdapter(designSystemId);

    // Spawn the provisioning engine.
    await spawnProvisioning({
      siteId: site.id,
      siteName: site.name || "My Site",
      email: session.user.email,
      industry: siteData?.industry || "professional_services",
      subdomain,
      blueprintPayload,
      designSystemTheme: adapter.themeName,
    });

    return NextResponse.json({
      siteId: site.id,
      subdomain,
      status: "provisioning",
    });
  } catch (error) {
    console.error("Provision start error:", error);
    return NextResponse.json(
      { error: "Failed to start provisioning" },
      { status: 500 }
    );
  }
}
