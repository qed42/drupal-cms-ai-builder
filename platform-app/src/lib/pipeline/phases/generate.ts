import { prisma } from "@/lib/prisma";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { PageLayoutSchema } from "@/lib/pipeline/schemas";
import { buildPageGenerationPrompt } from "@/lib/ai/prompts/page-generation";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import type { OnboardingData, BlueprintBundle, PageLayout, FormField } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { z } from "zod";

type GeneratedPage = z.infer<typeof PageLayoutSchema>;

export interface GeneratePhaseResult {
  blueprint: BlueprintBundle;
  durationMs: number;
  pagesGenerated: number;
}

export interface GenerateProgressCallback {
  (pageName: string, pageIndex: number, totalPages: number): Promise<void>;
}

/**
 * Execute the Generate phase of the content pipeline.
 * Iterates over each page in the content plan and generates full content
 * via per-page AI calls. Assembles results into a BlueprintBundle.
 */
export async function runGeneratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  onProgress?: GenerateProgressCallback
): Promise<GeneratePhaseResult> {
  const startTime = Date.now();
  const provider = await getAIProvider("generate");
  const pages: PageLayout[] = [];

  // Generate each page sequentially (ADR-006)
  for (let i = 0; i < plan.pages.length; i++) {
    const planPage = plan.pages[i];

    if (onProgress) {
      await onProgress(planPage.title, i, plan.pages.length);
    }

    const prompt = buildPageGenerationPrompt(planPage, data, research, plan);

    const generated = await generateValidatedJSON<GeneratedPage>(
      provider,
      prompt,
      PageLayoutSchema,
      {
        phase: "generate",
        temperature: 0.4,
        maxTokens: 4000,
      }
    );

    // Build Canvas component tree from sections
    const componentTree = buildComponentTree(generated.sections);

    pages.push({
      slug: generated.slug,
      title: generated.title,
      seo: generated.seo,
      sections: generated.sections,
      component_tree: componentTree,
    });
  }

  const durationMs = Date.now() - startTime;

  // Extract global content from plan
  const content = {
    services: plan.globalContent.services.map((s) => ({
      title: s.title,
      description: s.briefDescription,
    })),
    team_members: plan.globalContent.teamMembers?.map((t) => ({
      title: t.name,
      role: t.role,
    })),
    testimonials: plan.globalContent.testimonials?.map((t) => ({
      title: t.authorName,
      quote: t.quote,
      author_name: t.authorName,
      author_role: t.authorRole,
    })),
  };

  // Default contact form fields
  const formFields: FormField[] = [
    { name: "name", type: "text", label: "Your Name", required: true },
    { name: "email", type: "email", label: "Email Address", required: true },
    { name: "phone", type: "tel", label: "Phone Number", required: false },
    { name: "message", type: "textarea", label: "Message", required: true },
  ];

  // Assemble into BlueprintBundle
  const blueprint: BlueprintBundle = {
    site: {
      name: data.name || plan.siteName,
      tagline: plan.tagline,
      industry: research.industry,
      audience: research.targetAudience.primary,
      compliance_flags: research.complianceNotes || [],
      tone: research.toneGuidance.primary,
    },
    brand: {
      colors: data.colors || {},
      fonts: data.fonts || { heading: "Inter", body: "Inter" },
      logo_url: data.logo_url,
    },
    pages,
    content,
    forms: {
      contact: { fields: formFields },
    },
  };

  // Save blueprint to database
  await prisma.blueprint.update({
    where: { siteId },
    data: {
      payload: JSON.parse(JSON.stringify(blueprint)),
      status: "ready",
      generationStep: "ready",
    },
  });

  return { blueprint, durationMs, pagesGenerated: pages.length };
}
