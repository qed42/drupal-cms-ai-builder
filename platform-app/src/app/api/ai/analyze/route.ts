import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai/factory";
import { ANALYZE_PROMPT, INDUSTRY_OPTIONS } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

interface AnalyzeResult {
  industry: string;
  keywords: string[];
  compliance_flags: string[];
  tone: string;
}

const VALID_INDUSTRIES: readonly string[] = INDUSTRY_OPTIONS;

// Legacy industry keys that should map to new keys
const INDUSTRY_MIGRATION: Record<string, string> = {
  restaurant: "food_and_beverage",
  ecommerce: "retail",
  wellness: "fitness_and_wellness",
  event_planning: "hospitality",
};

function getFallbackResult(idea: string): AnalyzeResult {
  const lower = idea.toLowerCase();
  let industry = "other";
  const compliance_flags: string[] = [];

  if (/software|tech|app|saas|platform|developer|coding|startup|digital|cloud|cyber/i.test(lower)) {
    industry = "technology";
  } else if (/health|medical|clinic|hospital|doctor|patient|pharma|dental|therapy/i.test(lower)) {
    industry = "healthcare";
    compliance_flags.push("hipaa", "ada");
  } else if (/law|legal|attorney|lawyer|litigation|court/i.test(lower)) {
    industry = "legal";
    compliance_flags.push("attorney_advertising");
  } else if (/restaurant|food|dining|cafe|bar|kitchen|menu|bakery|catering|coffee|pizza|bistro|brewery|winery/i.test(lower)) {
    industry = "food_and_beverage";
  } else if (/shop|store|ecommerce|retail|boutique|merchandise|buy|sell/i.test(lower)) {
    industry = "retail";
    compliance_flags.push("pci_dss");
  } else if (/school|university|education|learning|student|teach|tutor|academy|course|training/i.test(lower)) {
    industry = "education";
    compliance_flags.push("ferpa");
  } else if (/real estate|property|housing|realtor|realty|mortgage|broker/i.test(lower)) {
    industry = "real_estate";
    compliance_flags.push("fair_housing");
  } else if (/finance|bank|accounting|tax|invest|wealth|insurance|financial|cpa|bookkeep/i.test(lower)) {
    industry = "finance";
  } else if (/manufactur|factory|production|industrial|fabricat|assembly|warehouse/i.test(lower)) {
    industry = "manufacturing";
  } else if (/design|creative|photo|video|art|graphic|studio|film|music|animation|branding/i.test(lower)) {
    industry = "creative_and_design";
  } else if (/hotel|resort|bnb|bed and breakfast|hostel|lodge|inn|vacation rental|travel/i.test(lower)) {
    industry = "hospitality";
  } else if (/gym|fitness|yoga|pilates|personal train|wellness|spa|massage|meditat|crossfit/i.test(lower)) {
    industry = "fitness_and_wellness";
  } else if (/auto|car|vehicle|mechanic|dealer|garage|tire|motor|body shop/i.test(lower)) {
    industry = "automotive";
  } else if (/nonprofit|charity|donation|volunteer|foundation|ngo/i.test(lower)) {
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
    const provider = await getAIProvider();
    const prompt = ANALYZE_PROMPT
      .replace("{idea}", idea)
      .replace("{audience}", audience || "general audience");

    const content = await provider.generateText(prompt, {
      temperature: 0.3,
    });

    result = JSON.parse(content) as AnalyzeResult;

    // Migrate legacy industry keys
    if (INDUSTRY_MIGRATION[result.industry]) {
      result.industry = INDUSTRY_MIGRATION[result.industry];
    }

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
