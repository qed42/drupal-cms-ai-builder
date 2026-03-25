import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/factory";
import { NextRequest, NextResponse } from "next/server";

const SUGGEST_PROMPT = `Based on this business/project idea, suggest 3 concise target audience descriptions.
Each should be a short phrase (under 60 characters) describing a specific audience segment.
Also infer 2-3 common pain points the target audience experiences related to this business/industry.

Idea: "{idea}"

Respond with JSON only:
{ "suggestions": ["audience 1", "audience 2", "audience 3"], "painPoints": ["pain point 1", "pain point 2"] }`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idea } = await req.json();
  if (!idea || typeof idea !== "string") {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  try {
    const provider = await getAIProvider();
    const content = await provider.generateText(
      SUGGEST_PROMPT.replace("{idea}", idea.slice(0, 500)),
      { temperature: 0.7 }
    );

    const result = JSON.parse(content);
    return NextResponse.json({
      suggestions: Array.isArray(result.suggestions)
        ? result.suggestions.slice(0, 3)
        : [],
      painPoints: Array.isArray(result.painPoints)
        ? result.painPoints.slice(0, 3)
        : [],
    });
  } catch {
    return NextResponse.json({ suggestions: [], painPoints: [] });
  }
}
