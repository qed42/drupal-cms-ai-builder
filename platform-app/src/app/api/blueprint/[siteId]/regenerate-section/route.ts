/**
 * POST /api/blueprint/[siteId]/regenerate-section
 *
 * Regenerates a single section within a page using AI, with research brief
 * and content plan context for consistency. Validates output against
 * Space DS component manifest.
 *
 * TASK-233: Per-Section AI Regeneration
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import { PageSectionSchema } from "@/lib/pipeline/schemas";
import { buildSectionRegenerationPrompt } from "@/lib/ai/prompts/section-regeneration";
import { validateSections } from "@/lib/blueprint/component-validator";
import { safeParsePropsJson } from "@/lib/ai/safe-parse-props";
import { buildComponentTree } from "@/lib/blueprint/component-tree-builder";
import { loadPipelineContext } from "@/lib/blueprint/load-pipeline-context";
import type { PageSection } from "@/lib/blueprint/types";

interface RegenerateBody {
  pageIndex: number;
  sectionIndex: number;
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
  const body: RegenerateBody = await req.json();

  if (typeof body.pageIndex !== "number" || typeof body.sectionIndex !== "number") {
    return NextResponse.json(
      { error: "pageIndex and sectionIndex are required" },
      { status: 400 }
    );
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
  const pages = payload.pages as Array<{
    slug: string;
    title: string;
    sections: Array<{ component_id: string; props: Record<string, unknown> }>;
    component_tree?: unknown[];
    [key: string]: unknown;
  }>;

  if (!pages || body.pageIndex >= pages.length || body.pageIndex < 0) {
    return NextResponse.json({ error: "Invalid page index" }, { status: 400 });
  }

  const page = pages[body.pageIndex];
  if (!page.sections || body.sectionIndex >= page.sections.length || body.sectionIndex < 0) {
    return NextResponse.json({ error: "Invalid section index" }, { status: 400 });
  }

  // Load research and plan from database
  const { research, plan } = await loadPipelineContext(siteId, payload);

  // Save previous section for undo
  const previousSection = { ...page.sections[body.sectionIndex] };

  // Build surrounding sections (exclude current)
  const surroundingSections: PageSection[] = page.sections
    .filter((_, idx) => idx !== body.sectionIndex)
    .map((s) => ({ component_id: s.component_id, props: s.props }));

  // Build regeneration prompt
  const prompt = buildSectionRegenerationPrompt({
    siteName: (payload.site as Record<string, unknown>)?.name as string ?? "",
    pageTitle: page.title,
    pageSlug: page.slug,
    sectionIndex: body.sectionIndex,
    currentSection: {
      component_id: page.sections[body.sectionIndex].component_id,
      props: page.sections[body.sectionIndex].props,
    },
    surroundingSections,
    research,
    plan,
    guidance: body.guidance,
  });

  // Generate new section content
  const provider = await getAIProvider("generate");
  const generated = await generateValidatedJSON(
    provider,
    prompt,
    PageSectionSchema,
    { phase: "generate", temperature: 0.5, maxTokens: 2000 }
  );

  // Parse props_json with safe recovery
  const newSection: PageSection = {
    component_id: generated.component_id,
    props: safeParsePropsJson(generated.props_json, generated.component_id),
  };

  // Validate against manifest
  const validation = validateSections([newSection]);
  const validatedSection = validation.sanitizedSections[0];

  // Update the blueprint
  const updatedPages = JSON.parse(JSON.stringify(pages));
  updatedPages[body.pageIndex].sections[body.sectionIndex] = validatedSection;

  // Rebuild component tree for the page
  const updatedComponentTree = buildComponentTree(
    updatedPages[body.pageIndex].sections.map((s: { component_id: string; props: Record<string, unknown> }) => ({
      component_id: s.component_id,
      props: s.props,
    }))
  );
  updatedPages[body.pageIndex].component_tree = updatedComponentTree;

  await prisma.blueprint.update({
    where: { id: site.blueprint.id },
    data: { payload: JSON.parse(JSON.stringify({ ...payload, pages: updatedPages })) },
  });

  return NextResponse.json({
    success: true,
    section: validatedSection,
    previousSection,
    validationIssues: validation.issues,
  });
}
