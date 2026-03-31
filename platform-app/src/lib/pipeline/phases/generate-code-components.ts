/**
 * Code Component Generate Phase (M26 TASK-504).
 *
 * Alternative Generate phase that produces React/Preact code components
 * via the Designer Agent instead of mapping to SDC design system components.
 * Called when generationMode === "code_components".
 */

import { prisma } from "@/lib/prisma";
import { getDesignRules } from "@/lib/rules";
import type { DesignRuleSet } from "@/lib/rules";
import { generateCodeComponent, DesignerAgentError } from "@/lib/code-components/designer-agent";
import type { DesignerAgentResult } from "@/lib/code-components/designer-agent";
import { wrapAsCanvasTreeNode } from "@/lib/code-components/config-builder";
import type {
  OnboardingData,
  BlueprintBundle,
  PageLayout,
  PageSection,
  FormField,
  HeaderConfig,
  FooterConfig,
} from "@/lib/blueprint/types";
import type { SectionDesignBrief } from "@/lib/code-components/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { GeneratePhaseResult, GenerateProgressCallback } from "./generate";

/**
 * Build a SectionDesignBrief from a ContentPlan section and onboarding data.
 */
function buildSectionDesignBrief(
  planSection: { heading: string; type: string; contentBrief: string },
  position: number,
  data: OnboardingData,
  research: ResearchBrief,
  targetKeywords?: string[],
  previousSummary?: string
): SectionDesignBrief {
  const prefs = data.designPreferences || {
    animationLevel: "moderate" as const,
    visualStyle: "minimal" as const,
    interactivity: "static" as const,
  };

  return {
    heading: planSection.heading,
    contentBrief: planSection.contentBrief,
    sectionType: planSection.type,
    position,
    brandTokens: {
      colors: data.colors || {},
      fonts: data.fonts || { heading: "Inter", body: "Inter" },
    },
    toneGuidance: research.toneGuidance?.primary || "professional",
    animationLevel: prefs.animationLevel,
    visualStyle: prefs.visualStyle,
    previousSectionSummary: previousSummary,
    targetKeywords,
  };
}

/**
 * Build a SectionDesignBrief for the site header.
 */
function buildHeaderBrief(
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan
): SectionDesignBrief {
  const pageLinks = plan.pages.map((p) => `${p.title} (/${p.slug})`).join(", ");
  return {
    heading: data.name || plan.siteName,
    contentBrief: `Site header navigation with logo, menu links (${pageLinks}), and CTA button. Include mobile hamburger menu with useState toggle.`,
    sectionType: "header",
    position: 0,
    brandTokens: {
      colors: data.colors || {},
      fonts: data.fonts || { heading: "Inter", body: "Inter" },
    },
    toneGuidance: research.toneGuidance?.primary || "professional",
    animationLevel: "subtle", // Headers always subtle
    visualStyle: data.designPreferences?.visualStyle || "minimal",
  };
}

/**
 * Build a SectionDesignBrief for the site footer.
 */
function buildFooterBrief(
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan
): SectionDesignBrief {
  const pageLinks = plan.pages.map((p) => `${p.title} (/${p.slug})`).join(", ");
  return {
    heading: data.name || plan.siteName,
    contentBrief: `Site footer with brand name/logo, short business description ("${plan.tagline}"), navigation links (${pageLinks}), social media links, and copyright notice.`,
    sectionType: "footer",
    position: 0,
    brandTokens: {
      colors: data.colors || {},
      fonts: data.fonts || { heading: "Inter", body: "Inter" },
    },
    toneGuidance: research.toneGuidance?.primary || "professional",
    animationLevel: "subtle", // Footers always subtle
    visualStyle: data.designPreferences?.visualStyle || "minimal",
  };
}

/**
 * Execute the Code Component Generate phase.
 *
 * For each page in the content plan, generates React/Preact + Tailwind CSS
 * code components via the Designer Agent. Assembles the blueprint payload
 * with code component configs for Drupal provisioning.
 */
export async function runCodeComponentGeneratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  onProgress?: GenerateProgressCallback
): Promise<GeneratePhaseResult> {
  const startTime = Date.now();

  // Resolve design rules (feature-flagged via ENABLE_DESIGN_RULES)
  const designRulesResult = getDesignRules({
    generationMode: data.generationMode,
    industry: research.industry || data.industry,
    audience: data.audience,
    tone: data.tone,
  });
  const designRulesFragment = designRulesResult?.fragment;
  const resolvedDesignRules: DesignRuleSet | undefined = designRulesResult?.ruleset;
  if (designRulesFragment) {
    console.log(
      `[generate-code] Design rules active (layers: ${resolvedDesignRules?._meta.layers.join(" → ")})`
    );
  }

  const pages: PageLayout[] = [];
  const codeComponentConfigs: Record<string, string> = {};
  const codeComponentMetadata: Array<{
    machineName: string;
    name: string;
    sectionType: string;
    pageSlug: string;
    generatedAt: string;
  }> = [];

  // Support GENERATE_HOMEPAGE_ONLY for dev/test (matches SDC behavior)
  const genPages =
    process.env.GENERATE_HOMEPAGE_ONLY === "true"
      ? plan.pages.slice(0, 1)
      : plan.pages;

  for (let i = 0; i < genPages.length; i++) {
    const planPage = genPages[i];

    if (onProgress) {
      await onProgress(planPage.title, i, genPages.length);
    }

    const pageSections: PageSection[] = [];
    const previousSections: Array<{
      machineName: string;
      sectionType: string;
    }> = [];

    for (let secIdx = 0; secIdx < planPage.sections.length; secIdx++) {
      const planSection = planPage.sections[secIdx];
      const previousSummary =
        secIdx > 0
          ? `${planPage.sections[secIdx - 1].type}: ${planPage.sections[secIdx - 1].heading}`
          : undefined;

      const brief = buildSectionDesignBrief(
        planSection,
        secIdx,
        data,
        research,
        planPage.targetKeywords,
        previousSummary
      );

      let result: DesignerAgentResult;
      try {
        result = await generateCodeComponent(brief, previousSections, planPage.slug, designRulesFragment);
      } catch (err) {
        if (err instanceof DesignerAgentError) {
          console.error(
            `[generate-code] Failed to generate ${planSection.type} for "${planPage.title}": ${err.message}`
          );
          // Skip this section — add placeholder with error metadata
          pageSections.push({
            component_id: `js.failed_${planSection.type}`,
            props: {},
            _meta: {
              contentBrief: planSection.contentBrief,
              codeComponent: {
                machineName: `failed_${planSection.type}`,
                generatedAt: new Date().toISOString(),
                validationPassed: false,
                retryCount: -1,
              },
            },
          });
          continue;
        }
        throw err; // Re-throw non-DesignerAgent errors
      }

      // Accumulate config YAMLs
      codeComponentConfigs[result.output.machineName] = result.configYaml;
      codeComponentMetadata.push({
        machineName: result.output.machineName,
        name: result.output.name,
        sectionType: planSection.type,
        pageSlug: planPage.slug,
        generatedAt: new Date().toISOString(),
      });

      previousSections.push({
        machineName: result.output.machineName,
        sectionType: planSection.type,
      });

      // Build PageSection for blueprint compatibility.
      // Use prop defaults/examples as input values — Canvas requires non-empty
      // values for required props and rejects empty strings.
      pageSections.push({
        component_id: `js.${result.output.machineName}`,
        props: Object.fromEntries(
          result.output.props.map((p) => {
            // Use the AI-generated default if available
            if (p.default !== null && p.default !== undefined) return [p.name, p.default];
            // For required props, use type-appropriate placeholder values.
            // NEVER use description text — Canvas validates format:uri props
            // with strict RFC 3986 URI validation.
            if (p.required) {
              if (p.type === "link") return [p.name, "https://example.com"];
              if (p.type === "image") return [p.name, { src: "https://placehold.co/1200x800", alt: p.description || p.name, width: 1200, height: 800 }];
              return [p.name, p.description || p.name];
            }
            // Optional props can be omitted (don't send empty strings)
            return [p.name, undefined];
          }).filter(([, v]) => v !== undefined)
        ),
        _meta: {
          contentBrief: planSection.contentBrief,
          targetKeywords: planPage.targetKeywords,
          codeComponent: {
            machineName: result.output.machineName,
            generatedAt: new Date().toISOString(),
            validationPassed: result.validationResult.valid,
            retryCount: result.retryCount,
          },
        },
      });
    }

    pages.push({
      slug: planPage.slug,
      title: planPage.title,
      seo: {
        meta_title: planPage.title,
        meta_description: planPage.purpose,
      },
      sections: pageSections,
      component_tree: pageSections
        .filter((s) => !s.component_id.startsWith("js.failed_"))
        .map((s) => {
          const machineName = s.component_id.replace("js.", "");
          return wrapAsCanvasTreeNode(machineName, s.props);
        }),
    });
  }

  // Generate header as a code component
  let headerConfig: HeaderConfig = { region: "header", menu_align: "center" };
  try {
    const headerResult = await generateCodeComponent(
      buildHeaderBrief(data, research, plan),
      undefined,
      "_header",
      designRulesFragment
    );
    codeComponentConfigs[headerResult.output.machineName] =
      headerResult.configYaml;
    codeComponentMetadata.push({
      machineName: headerResult.output.machineName,
      name: headerResult.output.name,
      sectionType: "header",
      pageSlug: "_global",
      generatedAt: new Date().toISOString(),
    });
    headerConfig = {
      region: "header",
      menu_align: "center",
      component_tree: [headerResult.treeNode],
    };
  } catch (err) {
    console.error("[generate-code] Header generation failed:", err);
  }

  // Generate footer as a code component
  let footerConfig: FooterConfig = { region: "footer" };
  try {
    const footerResult = await generateCodeComponent(
      buildFooterBrief(data, research, plan),
      undefined,
      "_footer",
      designRulesFragment
    );
    codeComponentConfigs[footerResult.output.machineName] =
      footerResult.configYaml;
    codeComponentMetadata.push({
      machineName: footerResult.output.machineName,
      name: footerResult.output.name,
      sectionType: "footer",
      pageSlug: "_global",
      generatedAt: new Date().toISOString(),
    });
    footerConfig = {
      region: "footer",
      brand_description: plan.tagline,
      component_tree: [footerResult.treeNode],
    };
  } catch (err) {
    console.error("[generate-code] Footer generation failed:", err);
  }

  // Extract global content from plan (same as SDC path)
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

  // Default contact form fields (same as SDC path)
  const formFields: FormField[] = [
    { name: "name", type: "text", label: "Your Name", required: true },
    { name: "email", type: "email", label: "Email Address", required: true },
    { name: "phone", type: "tel", label: "Phone Number", required: false },
    { name: "message", type: "textarea", label: "Message", required: true },
  ];

  // Assemble BlueprintBundle
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
    header: headerConfig,
    footer: footerConfig,
    _codeComponents: {
      configs: codeComponentConfigs,
      metadata: codeComponentMetadata,
      ...(resolvedDesignRules ? { _designRules: resolvedDesignRules } : {}),
    },
  };

  // Save blueprint to database (JSON round-trip for Prisma JSON column compatibility)
  await prisma.blueprint.update({
    where: { siteId },
    data: {
      payload: JSON.parse(JSON.stringify(blueprint)),
      status: "ready",
      generationStep: "ready",
    },
  });

  const durationMs = Date.now() - startTime;

  return { blueprint, durationMs, pagesGenerated: pages.length };
}
