import { prisma } from "@/lib/prisma";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { ContentPlanSchema } from "@/lib/pipeline/schemas";
import { buildPlanPrompt } from "@/lib/ai/prompts/plan";
import { classifyPageType, getRule } from "@/lib/ai/page-design-rules";
import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";

interface PlanDepthValidation {
  valid: boolean;
  feedback: string[];
}

/**
 * Validate that each page in the content plan meets the minimum section count
 * defined in PAGE_DESIGN_RULES for its page type.
 */
function validatePlanDepth(plan: ContentPlan): PlanDepthValidation {
  const feedback: string[] = [];

  for (const page of plan.pages) {
    const pageType = classifyPageType(page.slug, page.title);
    const rule = getRule(pageType);
    const min = rule.sectionCountRange[0];
    const actual = page.sections.length;

    if (actual < min) {
      // Check which required section types are missing
      const requiredTypes = rule.sections
        .filter((s) => s.required)
        .map((s) => s.type);
      const presentTypes = page.sections.map((s) => s.type);
      const missingTypes = requiredTypes.filter((t) => !presentTypes.includes(t));

      const missingNote = missingTypes.length > 0
        ? ` Missing required section types: ${missingTypes.join(", ")}.`
        : "";

      feedback.push(
        `Page "${page.title}" (/${page.slug}) has ${actual} sections but REQUIRES at least ${min} for a ${pageType} page.${missingNote} Add more sections.`
      );

      console.log(
        `[plan] Page "${page.title}" (${pageType}) section count: ${actual}/${min} — FAIL`
      );
    } else {
      console.log(
        `[plan] Page "${page.title}" (${pageType}) section count: ${actual}/${min} — PASS`
      );
    }
  }

  return { valid: feedback.length === 0, feedback };
}

export interface PlanPhaseResult {
  planId: string;
  plan: ContentPlan;
  durationMs: number;
}

/**
 * Execute the Plan phase of the content pipeline.
 * Uses the ResearchBrief + onboarding data to produce a validated ContentPlan,
 * stored in the content_plans table.
 */
export async function runPlanPhase(
  siteId: string,
  researchBriefId: string,
  research: ResearchBrief,
  data: OnboardingData
): Promise<PlanPhaseResult> {
  const startTime = Date.now();

  const provider = await getAIProvider("plan");
  const model = resolveModel("plan") || "default";
  const basePrompt = buildPlanPrompt(data, research);

  // Scale token budget based on number of pages — more pages need more planning tokens
  const pageCount = data.pages?.length ?? 3;
  const planTokenBudget = Math.min(6000 + pageCount * 1500, 16000);

  // Generate plan with depth validation + max 1 retry (ADR-012)
  let plan = await generateValidatedJSON<ContentPlan>(
    provider,
    basePrompt,
    ContentPlanSchema,
    {
      phase: "plan",
      temperature: 0.3,
      maxTokens: planTokenBudget,
    }
  );

  const depthCheck = validatePlanDepth(plan);
  console.log(JSON.stringify({ event: "pipeline_validation", phase: "plan", attempt: 1, valid: depthCheck.valid, pages: plan.pages.map((p) => ({ slug: p.slug, sections: p.sections.length })) }));
  if (!depthCheck.valid) {
    console.log(`[plan] Depth validation failed. Retrying with feedback...`);
    const retryPrompt = `${basePrompt}\n\n--- SECTION COUNT VALIDATION ERROR ---\nYour previous plan was rejected because it did not meet minimum section count requirements:\n${depthCheck.feedback.map((f) => `- ${f}`).join("\n")}\n\nYou MUST produce a plan where every page meets its minimum section count. This is a hard requirement.`;

    plan = await generateValidatedJSON<ContentPlan>(
      provider,
      retryPrompt,
      ContentPlanSchema,
      {
        phase: "plan",
        temperature: 0.3,
        maxTokens: planTokenBudget,
      }
    );

    const retryCheck = validatePlanDepth(plan);
    console.log(JSON.stringify({ event: "pipeline_validation", phase: "plan", attempt: 2, valid: retryCheck.valid, pages: plan.pages.map((p) => ({ slug: p.slug, sections: p.sections.length })) }));
    if (!retryCheck.valid) {
      console.warn(
        `[plan] Depth validation still failing after retry. Using best-effort plan.`,
        retryCheck.feedback
      );
    }
  }

  const durationMs = Date.now() - startTime;

  // Determine next version number
  const lastPlan = await prisma.contentPlan.findFirst({
    where: { siteId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (lastPlan?.version ?? 0) + 1;

  // Store in database
  const record = await prisma.contentPlan.create({
    data: {
      siteId,
      researchBriefId,
      version,
      content: JSON.parse(JSON.stringify(plan)),
      model,
      provider: provider.name,
      durationMs,
    },
  });

  return { planId: record.id, plan, durationMs };
}
