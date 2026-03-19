import { prisma } from "@/lib/prisma";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { PageLayoutSchema } from "@/lib/pipeline/schemas";
import { buildPageGenerationPrompt } from "@/lib/ai/prompts/page-generation";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import { validateSections, formatValidationFeedback } from "@/lib/blueprint/component-validator";
import { safeParsePropsJson } from "@/lib/ai/safe-parse-props";
import type { OnboardingData, BlueprintBundle, PageLayout, PageSection, FormField } from "@/lib/blueprint/types";
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

    const basePrompt = buildPageGenerationPrompt(planPage, data, research, plan);

    // Generate with component prop validation and retry loop (max 2 retries)
    const MAX_PROP_RETRIES = 2;
    let sections: PageSection[] = [];
    let pageSlug = planPage.slug;
    let pageTitle = planPage.title;
    let pageSeo = { meta_title: "", meta_description: "" };
    let validationPassed = false;

    for (let attempt = 0; attempt <= MAX_PROP_RETRIES; attempt++) {
      const prompt = attempt === 0
        ? basePrompt
        : basePrompt; // Retry uses same base prompt — validation feedback is appended below

      let currentPrompt = prompt;
      if (attempt > 0 && sections.length > 0) {
        // Append validation feedback from previous attempt
        const prevResult = validateSections(sections);
        const feedback = formatValidationFeedback(prevResult.issues);
        if (feedback) {
          currentPrompt = `${prompt}\n\n--- COMPONENT PROP VALIDATION ERROR (attempt ${attempt}) ---\n${feedback}\n\nPlease return corrected JSON with only valid props for each component.`;
        }
      }

      const generated = await generateValidatedJSON<GeneratedPage>(
        provider,
        currentPrompt,
        PageLayoutSchema,
        {
          phase: "generate",
          temperature: 0.4,
          maxTokens: 4000,
        }
      );

      // Capture page metadata from generated output
      pageSlug = generated.slug;
      pageTitle = generated.title;
      pageSeo = generated.seo;

      // Parse props_json strings into props objects with robust error recovery.
      sections = generated.sections.map((s) => ({
        component_id: s.component_id,
        props: safeParsePropsJson(s.props_json, s.component_id),
      }));

      // Validate component props against manifest
      const validation = validateSections(sections);

      if (validation.issues.length > 0) {
        console.warn(
          `[generate] Page "${planPage.title}" prop validation (attempt ${attempt + 1}):`,
          validation.issues.map((i) => `${i.type}: ${i.message}`).join("; ")
        );
      }

      if (validation.valid) {
        // Use sanitized sections (invalid props stripped, defaults filled)
        sections = validation.sanitizedSections;
        validationPassed = true;
        break;
      }

      // If only warnings (no errors), use sanitized version
      const hasErrors = validation.issues.some((i) => i.type === "error");
      if (!hasErrors) {
        sections = validation.sanitizedSections;
        validationPassed = true;
        break;
      }

      // On final retry failure, use sanitized version anyway (best effort)
      if (attempt === MAX_PROP_RETRIES) {
        console.error(
          `[generate] Page "${planPage.title}" prop validation failed after ${MAX_PROP_RETRIES + 1} attempts. Using sanitized output.`
        );
        sections = validation.sanitizedSections;
      }
    }

    // Build Canvas component tree from validated sections
    const componentTree = buildComponentTree(sections);

    pages.push({
      slug: pageSlug,
      title: pageTitle,
      seo: pageSeo,
      sections,
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
