import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/factory";
import { NextRequest, NextResponse } from "next/server";

const VALIDATE_PROMPT = `You are an input quality evaluator for a website builder onboarding flow.
The user was asked: "What's the big idea? In a few lines, tell us what this is all about."

Evaluate whether this input is meaningful and specific enough to generate a quality website.

User input: "{idea}"

Respond with JSON only:
{
  "quality": "good" | "vague" | "nonsense",
  "suggestion": "A short, helpful suggestion to improve the input (only if quality is not good, otherwise null)"
}

Rules:
- "good": Clearly describes a business, project, or purpose. Mentions what it does or who it's for.
- "vague": Too generic (e.g., "a website", "something cool", "my business"). Needs specifics.
- "nonsense": Random characters, gibberish, or completely unrelated to building a website.
- Keep suggestion under 60 characters.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idea } = await req.json();
  if (!idea || typeof idea !== "string") {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  // Fast-path: very short inputs are automatically vague
  if (idea.trim().length < 20) {
    return NextResponse.json({
      quality: "vague",
      suggestion: "Tell us more about what your site will do",
    });
  }

  try {
    const provider = await getAIProvider();
    const content = await provider.generateText(
      VALIDATE_PROMPT.replace("{idea}", idea.slice(0, 500)),
      { temperature: 0.1 }
    );

    const result = JSON.parse(content);
    return NextResponse.json({
      quality: result.quality || "good",
      suggestion: result.suggestion || null,
    });
  } catch {
    // On AI failure, allow the user through
    return NextResponse.json({ quality: "good", suggestion: null });
  }
}
