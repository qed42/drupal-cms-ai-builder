/**
 * POST /api/blueprint/[siteId]/regenerate-page
 *
 * Regenerates all sections of a single page using the research brief
 * and content plan for consistency. Validates output against manifest.
 *
 * TASK-234: Per-Page Regeneration
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { PageLayoutSchema } from "@/lib/pipeline/schemas";
import { buildPageGenerationPrompt } from "@/lib/ai/prompts/page-generation";
import { validateSections } from "@/lib/blueprint/component-validator";
import { safeParsePropsJson } from "@/lib/ai/safe-parse-props";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import { loadPipelineContext } from "@/lib/blueprint/load-pipeline-context";
import type { PageSection } from "@/lib/blueprint/types";
import type { z } from "zod";

type GeneratedPage = z.infer<typeof PageLayoutSchema>;

interface RegeneratePageBody {
  pageIndex: number;
  guidance?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;
  const body: RegeneratePageBody = await req.json();

  if (typeof body.pageIndex !== "number") {
    return NextResponse.json({ error: "pageIndex is required" }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: { blueprint: true },
  });

  if (!site?.blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  if (site.status !== "review") {
    return NextResponse.json(
      { error: "Regeneration is only allowed during review" },
      { status: 403 }
    );
  }

  const payload = site.blueprint.payload as Record<string, unknown>;
  const pages = payload.pages as Array<Record<string, unknown>>;

  if (!pages || body.pageIndex >= pages.length || body.pageIndex < 0) {
    return NextResponse.json({ error: "Invalid page index" }, { status: 400 });
  }

  const currentPage = pages[body.pageIndex];

  // Load research and plan from database
  const { research, plan } = await loadPipelineContext(siteId, payload);

  // Find matching plan page or build a minimal one
  const planPage = plan.pages.find((p) => p.slug === currentPage.slug) ?? {
    slug: currentPage.slug as string,
    title: currentPage.title as string,
    purpose: "",
    targetKeywords: [],
    sections: [],
  };

  // Build onboarding data from blueprint
  const siteData = (payload.site ?? {}) as Record<string, unknown>;
  const onboardingData = {
    name: (siteData.name as string) ?? "",
    idea: "",
    audience: (siteData.audience as string) ?? "",
    industry: (siteData.industry as string) ?? "",
    tone: (siteData.tone as string) ?? "",
  };

  // Generate replacement page
  const provider = await getAIProvider("generate");
  let prompt = buildPageGenerationPrompt(planPage, onboardingData, research, plan);

  if (body.guidance) {
    prompt += `\n\n## Additional Instructions\n${body.guidance}`;
  }

  const generated = await generateValidatedJSON<GeneratedPage>(
    provider,
    prompt,
    PageLayoutSchema,
    { phase: "generate", temperature: 0.5, maxTokens: 4000 }
  );

  // Parse props_json with safe recovery and validate
  let sections: PageSection[] = generated.sections.map((s) => ({
    component_id: s.component_id,
    props: safeParsePropsJson(s.props_json, s.component_id),
  }));

  const validation = validateSections(sections);
  sections = validation.sanitizedSections;

  if (validation.issues.length > 0) {
    console.warn(
      `[regenerate-page] Validation issues:`,
      validation.issues.map((i) => i.message).join("; ")
    );
  }

  const componentTree = buildComponentTree(sections);

  const newPage = {
    slug: generated.slug,
    title: generated.title,
    seo: generated.seo,
    sections,
    component_tree: componentTree,
  };

  // Update the blueprint
  const updatedPages = JSON.parse(JSON.stringify(pages));
  updatedPages[body.pageIndex] = newPage;

  await prisma.blueprint.update({
    where: { id: site.blueprint.id },
    data: { payload: JSON.parse(JSON.stringify({ ...payload, pages: updatedPages })) },
  });

  return NextResponse.json({
    success: true,
    page: newPage,
    validationIssues: validation.issues,
  });
}
