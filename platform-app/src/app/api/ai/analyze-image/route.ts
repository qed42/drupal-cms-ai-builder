/**
 * POST /api/ai/analyze-image — TASK-439
 *
 * Analyzes an uploaded image using Claude Vision, returning a marketing-aware
 * description, semantic tags, dominant colors, subject type, and orientation.
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeImage } from "@/lib/images/image-description-service";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imagePath, siteId } = await req.json();

  if (!imagePath || typeof imagePath !== "string") {
    return NextResponse.json(
      { error: "imagePath is required" },
      { status: 400 }
    );
  }
  if (!siteId || typeof siteId !== "string") {
    return NextResponse.json(
      { error: "siteId is required" },
      { status: 400 }
    );
  }

  // Authorization: verify the user owns this site's onboarding session
  const onboarding = await prisma.onboardingSession.findFirst({
    where: { userId: session.user.id, siteId },
    orderBy: { createdAt: "desc" },
  });

  if (!onboarding) {
    return NextResponse.json(
      { error: "No onboarding session found for this site" },
      { status: 404 }
    );
  }

  // Extract business context from session data
  const data = (onboarding.data as Record<string, unknown>) || {};
  const businessContext = {
    idea: (data.idea as string) || "",
    industry: (data.industry as string) || "",
    audience: (data.audience as string) || "",
  };

  // Resolve image path to absolute
  const absolutePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(process.cwd(), "public", imagePath);

  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json(
      { error: "Image file not found" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeImage(absolutePath, businessContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "[analyze-image] Analysis failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Image analysis failed" },
      { status: 500 }
    );
  }
}
