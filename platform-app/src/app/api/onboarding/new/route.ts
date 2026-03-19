import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create a new site for this user
    const site = await prisma.site.create({
      data: {
        userId: session.user.id,
        status: "onboarding",
      },
    });

    // Create trial subscription for the new site
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await prisma.subscription.create({
      data: {
        siteId: site.id,
        plan: "trial",
        status: "active",
        trialEndsAt,
      },
    });

    // Create a fresh onboarding session
    const onboardingSession = await prisma.onboardingSession.create({
      data: {
        userId: session.user.id,
        siteId: site.id,
        step: "start",
        data: {},
      },
    });

    return NextResponse.json(
      {
        sessionId: onboardingSession.id,
        siteId: site.id,
        redirectUrl: `/onboarding/start?siteId=${site.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating new onboarding session:", error);
    return NextResponse.json(
      { error: "Failed to create new website" },
      { status: 500 }
    );
  }
}
