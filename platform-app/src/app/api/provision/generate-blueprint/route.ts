import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBlueprint } from "@/lib/blueprint/generator";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's active onboarding session
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

    // Get the user's site
    const site = await prisma.site.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!site) {
      return NextResponse.json({ error: "No site found" }, { status: 404 });
    }

    const sessionData = onboarding.data as Record<string, unknown>;
    const siteName =
      (typeof sessionData?.name === "string" ? sessionData.name : null) ||
      site.name;

    // Create or update blueprint record
    const blueprint = await prisma.blueprint.upsert({
      where: { siteId: site.id },
      create: {
        siteId: site.id,
        status: "generating",
        generationStep: "pending",
      },
      update: {
        status: "generating",
        generationStep: "pending",
        generationError: null,
      },
    });

    // Update site status
    await prisma.site.update({
      where: { id: site.id },
      data: { status: "generating", name: siteName },
    });

    // Mark onboarding as completed
    await prisma.onboardingSession.update({
      where: { id: onboarding.id },
      data: { completed: true, siteId: site.id },
    });

    // Run generation in background (don't await — client will poll for status)
    generateBlueprint(blueprint.id, site.id, sessionData).catch(async (err) => {
      console.error("Blueprint generation failed:", err);
      await prisma.blueprint.update({
        where: { id: blueprint.id },
        data: {
          status: "failed",
          generationStep: "failed",
          generationError:
            err instanceof Error ? err.message : "Unknown error",
        },
      });
      await prisma.site.update({
        where: { id: site.id },
        data: { status: "onboarding" },
      });
    });

    return NextResponse.json({
      blueprintId: blueprint.id,
      siteId: site.id,
      status: "generating",
    });
  } catch (err) {
    console.error("Generate blueprint route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
