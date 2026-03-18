import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient } from "@/lib/ai/client";
import { ANALYZE_PROMPT } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

interface AnalyzeResult {
  industry: string;
  keywords: string[];
  compliance_flags: string[];
  tone: string;
}

const VALID_INDUSTRIES = [
  "healthcare", "legal", "real_estate", "restaurant",
  "professional_services", "education", "ecommerce", "nonprofit", "other",
];

function getFallbackResult(idea: string): AnalyzeResult {
  const lower = idea.toLowerCase();
  let industry = "other";
  const compliance_flags: string[] = [];

  if (/health|medical|clinic|hospital|doctor|patient|wellness/i.test(lower)) {
    industry = "healthcare";
    compliance_flags.push("hipaa", "ada");
  } else if (/law|legal|attorney|lawyer|litigation|court/i.test(lower)) {
    industry = "legal";
    compliance_flags.push("attorney_advertising");
  } else if (/real estate|property|housing|realtor|realty/i.test(lower)) {
    industry = "real_estate";
    compliance_flags.push("fair_housing");
  } else if (/restaurant|food|dining|cafe|bar|kitchen|menu/i.test(lower)) {
    industry = "restaurant";
  } else if (/school|university|education|learning|student|teach/i.test(lower)) {
    industry = "education";
    compliance_flags.push("ferpa");
  } else if (/shop|store|ecommerce|product|retail|buy|sell/i.test(lower)) {
    industry = "ecommerce";
    compliance_flags.push("pci_dss");
  } else if (/nonprofit|charity|donation|volunteer|foundation/i.test(lower)) {
    industry = "nonprofit";
  } else if (/consult|service|agency|firm|solution|professional/i.test(lower)) {
    industry = "professional_services";
  }

  return {
    industry,
    keywords: idea.split(/\s+/).filter((w) => w.length > 3).slice(0, 7),
    compliance_flags,
    tone: "professional_warm",
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idea, audience } = await req.json();
  if (!idea) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  let result: AnalyzeResult;

  try {
    const client = getOpenAIClient();
    const prompt = ANALYZE_PROMPT
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

    result = JSON.parse(content) as AnalyzeResult;

    // Validate industry
    if (!VALID_INDUSTRIES.includes(result.industry)) {
      result.industry = "other";
    }
  } catch {
    result = getFallbackResult(idea);
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
          industry: result.industry,
          keywords: result.keywords,
          compliance_flags: result.compliance_flags,
          tone: result.tone,
        },
      },
    });
  }

  return NextResponse.json(result);
}
