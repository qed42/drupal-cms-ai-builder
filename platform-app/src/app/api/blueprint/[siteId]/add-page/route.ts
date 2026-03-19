/**
 * POST /api/blueprint/[siteId]/add-page
 *
 * Adds a new AI-generated page to the blueprint. Generates content using
 * the research brief and content plan for consistency.
 *
 * TASK-235: Page Add/Remove from Review
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

const MAX_PAGES = 15;

interface AddPageBody {
  title: string;
  description: string;
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
  const body: AddPageBody = await req.json();

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
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
      { error: "Adding pages is only allowed during review" },
      { status: 403 }
    );
  }

  const payload = site.blueprint.payload as Record<string, unknown>;
  const pages = (payload.pages ?? []) as Array<Record<string, unknown>>;

  if (pages.length >= MAX_PAGES) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_PAGES} pages allowed` },
      { status: 400 }
    );
  }

  // Load research and plan from database
  const { research, plan } = await loadPipelineContext(siteId, payload);

  // Build a plan page for the new page
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const planPage = {
    slug,
    title: body.title,
    purpose: body.description || `A ${body.title.toLowerCase()} page for the site.`,
    targetKeywords: research.seoKeywords?.slice(0, 3) ?? [],
    sections: [
      {
        heading: body.title,
        type: "hero",
        contentBrief: `Hero section for the ${body.title} page`,
        estimatedWordCount: 50,
        componentSuggestion: "space_ds:space-hero-banner-style-03",
      },
      {
        heading: "Content",
        type: "text",
        contentBrief: body.description || `Main content for the ${body.title} page`,
        estimatedWordCount: 200,
        componentSuggestion: "space_ds:space-text-media-default",
      },
    ],
  };

  const siteData = (payload.site ?? {}) as Record<string, unknown>;
  const onboardingData = {
    name: (siteData.name as string) ?? "",
    idea: "",
    audience: (siteData.audience as string) ?? "",
    industry: (siteData.industry as string) ?? "",
    tone: (siteData.tone as string) ?? "",
  };

  // Generate page content
  const provider = await getAIProvider("generate");
  const prompt = buildPageGenerationPrompt(planPage, onboardingData, research, plan);

  const generated = await generateValidatedJSON<GeneratedPage>(
    provider,
    prompt,
    PageLayoutSchema,
    { phase: "generate", temperature: 0.5, maxTokens: 4000 }
  );

  // Parse with safe recovery and validate
  let sections: PageSection[] = generated.sections.map((s) => ({
    component_id: s.component_id,
    props: safeParsePropsJson(s.props_json, s.component_id),
  }));

  const validation = validateSections(sections);
  sections = validation.sanitizedSections;

  const componentTree = buildComponentTree(sections);

  const newPage = {
    slug: generated.slug,
    title: generated.title,
    seo: generated.seo,
    sections,
    component_tree: componentTree,
  };

  // Append to blueprint
  const updatedPages = [...pages, newPage];

  await prisma.blueprint.update({
    where: { id: site.blueprint.id },
    data: { payload: JSON.parse(JSON.stringify({ ...payload, pages: updatedPages })) },
  });

  return NextResponse.json({
    success: true,
    page: newPage,
    pageIndex: updatedPages.length - 1,
  });
}
