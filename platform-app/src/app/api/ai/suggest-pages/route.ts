import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient } from "@/lib/ai/client";
import { SUGGEST_PAGES_PROMPT, getDefaultPages } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

interface PageSuggestion {
  slug: string;
  title: string;
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
    const client = getOpenAIClient();
    const prompt = SUGGEST_PAGES_PROMPT
      .replace("{industry}", industry)
      .replace("{idea}", idea)
      .replace("{audience}", audience || "general audience");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    pages = Array.isArray(parsed) ? parsed : parsed.pages || getDefaultPages(industry);

    // Ensure minimum structure
    if (!Array.isArray(pages) || pages.length < 3) {
      pages = getDefaultPages(industry);
    }
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
