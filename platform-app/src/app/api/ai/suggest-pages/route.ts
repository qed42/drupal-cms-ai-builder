import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/factory";
import { SUGGEST_PAGES_PROMPT, getDefaultPages } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

interface PageSuggestion {
  slug: string;
  title: string;
  description: string;
  required: boolean;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { industry, idea, audience } = await req.json();
  if (!industry || !idea) {
    return NextResponse.json(
      { error: "industry and idea are required" },
      { status: 400 }
    );
  }

  let pages: PageSuggestion[];

  try {
    const provider = await getAIProvider();
    const prompt = SUGGEST_PAGES_PROMPT
      .replace("{industry}", industry)
      .replace("{idea}", idea)
      .replace("{audience}", audience || "general audience");

    const content = await provider.generateText(prompt, {
      temperature: 0.3,
    });

    const parsed = JSON.parse(content);
    pages = Array.isArray(parsed) ? parsed : parsed.pages || getDefaultPages(industry);

    // Ensure minimum structure and descriptions exist
    if (!Array.isArray(pages) || pages.length < 3) {
      pages = getDefaultPages(industry);
    }

    // Ensure every page has a description fallback
    pages = pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description || `Content and information about ${p.title.toLowerCase()}`,
      required: p.required,
    }));
  } catch {
    pages = getDefaultPages(industry);
  }

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
          suggested_pages: JSON.parse(JSON.stringify(pages)),
        },
      },
    });
  }

  return NextResponse.json({ pages });
}
