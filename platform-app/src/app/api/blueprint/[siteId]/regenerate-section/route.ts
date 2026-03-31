/**
 * POST /api/blueprint/[siteId]/regenerate-section
 *
 * Regenerates a single section within a page using AI, with research brief
 * and content plan context for consistency. Validates output against
 * Space DS component manifest for SDC sections, or uses Designer Agent
 * for code component sections.
 *
 * TASK-233: Per-Section AI Regeneration
 * TASK-507: Code component regeneration support
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
import { wrapAsCanvasTreeNode } from "@/lib/code-components/config-builder";
import { generateCodeComponent } from "@/lib/code-components/designer-agent";
import { loadPipelineContext } from "@/lib/blueprint/load-pipeline-context";
import type { PageSection } from "@/lib/blueprint/types";
import type { SectionDesignBrief } from "@/lib/code-components/types";

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

  const currentSection = page.sections[body.sectionIndex];
  const isCodeComponent = currentSection.component_id.startsWith("js.");

  let validatedSection: PageSection;
  let validationIssues: unknown[] = [];

  if (isCodeComponent) {
    // TASK-507: Code component regeneration via Designer Agent
    const siteData = payload.site as Record<string, unknown>;
    const brandData = payload.brand as Record<string, string> | undefined;
    const meta = (currentSection as PageSection)._meta;

    const brief: SectionDesignBrief = {
      heading: (currentSection.props.heading as string) || page.title,
      contentBrief: meta?.contentBrief || body.guidance || `Regenerate the ${meta?.codeComponent?.machineName || "section"} section`,
      sectionType: meta?.codeComponent?.machineName?.replace(/^[a-z]+_/, "") || "section",
      position: body.sectionIndex,
      brandTokens: {
        colors: (brandData as Record<string, string>) || {},
        fonts: { heading: "Inter", body: "Inter" },
      },
      toneGuidance: (siteData?.tone as string) || research.toneGuidance?.primary || "professional",
      animationLevel: "moderate",
      visualStyle: "minimal",
      previousSectionSummary: body.sectionIndex > 0
        ? `Previous: ${page.sections[body.sectionIndex - 1].component_id}`
        : undefined,
      targetKeywords: meta?.targetKeywords,
    };

    const previousSections = page.sections
      .filter((_, idx) => idx !== body.sectionIndex)
      .filter((s) => s.component_id.startsWith("js."))
      .map((s) => ({
        machineName: s.component_id.replace("js.", ""),
        sectionType: (s as PageSection)._meta?.codeComponent?.machineName?.replace(/^[a-z]+_/, "") || "section",
      }));

    const result = await generateCodeComponent(brief, previousSections, page.slug);

    validatedSection = {
      component_id: `js.${result.output.machineName}`,
      props: Object.fromEntries(
        result.output.props.map((p) => {
          if (p.default !== null && p.default !== undefined) return [p.name, p.default];
          if (p.required) return [p.name, p.description || p.name];
          return [p.name, undefined];
        }).filter(([, v]) => v !== undefined)
      ),
      _meta: {
        contentBrief: meta?.contentBrief,
        targetKeywords: meta?.targetKeywords,
        codeComponent: {
          machineName: result.output.machineName,
          generatedAt: new Date().toISOString(),
          validationPassed: result.validationResult.valid,
          retryCount: result.retryCount,
        },
      },
    };

    // Update _codeComponents configs in the payload
    const codeComponents = (payload._codeComponents as {
      configs: Record<string, string>;
      metadata: Array<Record<string, unknown>>;
    }) || { configs: {}, metadata: [] };

    // Remove old config if machine name changed
    const oldMachineName = meta?.codeComponent?.machineName;
    if (oldMachineName && oldMachineName !== result.output.machineName) {
      delete codeComponents.configs[oldMachineName];
    }
    codeComponents.configs[result.output.machineName] = result.configYaml;
    payload._codeComponents = codeComponents;
  } else {
    // SDC section regeneration (existing flow)
    const surroundingSections: PageSection[] = page.sections
      .filter((_, idx) => idx !== body.sectionIndex)
      .map((s) => ({ component_id: s.component_id, props: s.props }));

    const prompt = buildSectionRegenerationPrompt({
      siteName: (payload.site as Record<string, unknown>)?.name as string ?? "",
      pageTitle: page.title,
      pageSlug: page.slug,
      sectionIndex: body.sectionIndex,
      currentSection: {
        component_id: currentSection.component_id,
        props: currentSection.props,
      },
      surroundingSections,
      research,
      plan,
      guidance: body.guidance,
    });

    const provider = await getAIProvider("generate");
    const generated = await generateValidatedJSON(
      provider,
      prompt,
      PageSectionSchema,
      { phase: "generate", temperature: 0.5, maxTokens: 2000 }
    );

    const newSection: PageSection = {
      component_id: generated.component_id,
      props: safeParsePropsJson(generated.props_json, generated.component_id),
    };

    const validation = validateSections([newSection]);
    validatedSection = validation.sanitizedSections[0];
    validationIssues = validation.issues;
  }

  // Update the blueprint
  const updatedPages = JSON.parse(JSON.stringify(pages));
  updatedPages[body.pageIndex].sections[body.sectionIndex] = validatedSection;

  // Rebuild component tree for the page
  if (isCodeComponent) {
    updatedPages[body.pageIndex].component_tree = updatedPages[body.pageIndex].sections
      .filter((s: { component_id: string }) => s.component_id.startsWith("js.") && !s.component_id.startsWith("js.failed_"))
      .map((s: { component_id: string; props: Record<string, unknown> }) => {
        const machineName = s.component_id.replace("js.", "");
        return wrapAsCanvasTreeNode(machineName, s.props);
      });
  } else {
    updatedPages[body.pageIndex].component_tree = buildComponentTree(
      updatedPages[body.pageIndex].sections.map((s: { component_id: string; props: Record<string, unknown> }) => ({
        component_id: s.component_id,
        props: s.props,
      }))
    );
  }

  await prisma.blueprint.update({
    where: { id: site.blueprint.id },
    data: { payload: JSON.parse(JSON.stringify({ ...payload, pages: updatedPages })) },
  });

  return NextResponse.json({
    success: true,
    section: validatedSection,
    previousSection,
    validationIssues,
  });
}
