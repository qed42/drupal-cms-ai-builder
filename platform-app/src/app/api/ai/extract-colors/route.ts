import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractColorsFromImage,
  extractColorsWithVision,
} from "@/lib/ai/color-extraction";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filePath, type } = await req.json();
  if (!filePath) {
    return NextResponse.json({ error: "filePath is required" }, { status: 400 });
  }

  // Resolve to absolute path if relative
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), "public", filePath);

  // Choose extraction method
  const isPdf = absolutePath.endsWith(".pdf");
  const colors =
    isPdf || type === "palette"
      ? await extractColorsWithVision(absolutePath)
      : await extractColorsFromImage(absolutePath);

  // Save to onboarding session
  const onboarding = await prisma.onboardingSession.findFirst({
    where: { userId: session.user.id, completed: false },
    orderBy: { createdAt: "desc" },
  });

  if (onboarding) {
    const existingData = (onboarding.data as Record<string, unknown>) || {};
    await prisma.onboardingSession.update({
      where: { id: onboarding.id },
      data: {
        data: {
          ...existingData,
          colors: colors.reduce(
            (acc, c) => ({ ...acc, [c.role]: c.hex }),
            {}
          ),
        },
      },
    });
  }

  return NextResponse.json({ colors });
}
