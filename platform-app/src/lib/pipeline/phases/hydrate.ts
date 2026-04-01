/**
 * Content Hydration Phase (TASK-526).
 *
 * Runs between Generate and Enhance. Replaces generic placeholder content
 * in code component props with real, contextual content from the ContentPlan,
 * ResearchBrief, and OnboardingData.
 *
 * Two-tier strategy:
 * 1. Direct mapping — pattern-match prop names to known content plan data
 * 2. AI fallback — generate contextual content for remaining unresolved props
 */

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAIProvider, resolveModel } from "@/lib/ai/factory";
import { generateValidatedJSON } from "@/lib/ai/validation";
import type { AIProvider } from "@/lib/ai/provider";
import YAML from "yaml";
import type {
  BlueprintBundle,
  PageSection,
  OnboardingData,
} from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface HydratePhaseResult {
  propsHydrated: number;
  propsDirectMapped: number;
  propsAiGenerated: number;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Direct-mapping patterns (snake_case from TASK-528)
// ---------------------------------------------------------------------------

const HEADING_RE = /^(heading|title|section_title|main_title|section_heading)$/;
const SUBHEADING_RE = /^(subheading|subtitle|section_desc|section_description|tagline|sub_text|description)$/;
const CTA_TEXT_RE = /^(cta_text|button_text|action_text|cta_label|btn_text)$/;
const CTA_URL_RE = /^(cta_url|button_url|action_url|cta_link|btn_url)$/;
const BRAND_NAME_RE = /^(brand_name|company_name|site_name|business_name|brand|logo_text)$/;

// Numbered card/item patterns for services, features, testimonials, team
const CARD_TITLE_RE = /^(?:card|feature|service|item)_(\d+)_(?:title|name|heading)$/;
const CARD_DESC_RE = /^(?:card|feature|service|item)_(\d+)_(?:desc|description|text|body)$/;
const QUOTE_RE = /^quote_(\d+)$/;
const AUTHOR_RE = /^author_(\d+)$/;
const AUTHOR_ROLE_RE = /^role_(\d+)$/;
const MEMBER_NAME_RE = /^(?:name|member_name|member)_(\d+)$/;
const MEMBER_ROLE_RE = /^(?:role|member_role|position|member_role)_(\d+)$/;

// ---------------------------------------------------------------------------
// Placeholder detection
// ---------------------------------------------------------------------------

/** Known generic placeholder patterns that should be replaced. */
const PLACEHOLDER_PATTERNS = [
  /^(section|feature|card|item)\s+(title|heading|description)/i,
  /^(first|second|third|fourth)\s+(feature|card|item|testimonial)/i,
  /^(main|hero)\s+(headline|heading|title)/i,
  /^(your|my|our)\s+(title|heading|description)/i,
  /^(description|text|content)\s+(here|goes here)/i,
  /^placeholder/i,
  /^lorem ipsum/i,
  /^sample\s/i,
  /^example\s/i,
  /^default\s/i,
];

/**
 * Check if a string value looks like a generic placeholder that should be
 * replaced with real content.
 */
export function isPlaceholderValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value === "") return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value));
}

// ---------------------------------------------------------------------------
// Section type → content source mapping
// ---------------------------------------------------------------------------

/** Section types that use globalContent.services for numbered cards. */
const SERVICE_SECTION_TYPES = new Set([
  "features",
  "services",
  "pricing",
  "stats",
]);

/** Section types that use globalContent.testimonials. */
const TESTIMONIAL_SECTION_TYPES = new Set(["testimonials"]);

/** Section types that use globalContent.teamMembers. */
const TEAM_SECTION_TYPES = new Set(["team"]);

// ---------------------------------------------------------------------------
// CTA text by section type
// ---------------------------------------------------------------------------

const CTA_TEXT_BY_SECTION: Record<string, string> = {
  hero: "Get Started",
  cta: "Contact Us",
  services: "Learn More",
  features: "Explore Features",
  about: "Our Story",
  contact: "Get in Touch",
  pricing: "Choose a Plan",
  faq: "Still Have Questions?",
};

// ---------------------------------------------------------------------------
// Direct mapping
// ---------------------------------------------------------------------------

export interface DirectMapContext {
  sectionType: string;
  planHeading: string;
  planBrief: string;
  siteName: string;
  tagline: string;
  industry: string;
  tone: string;
  pageSlug: string;
  services: Array<{ title: string; briefDescription: string }>;
  testimonials: Array<{ quote: string; authorName: string; authorRole: string }>;
  teamMembers: Array<{ name: string; role: string }>;
}

/**
 * Attempt to directly map a prop to known content plan data.
 * Returns the mapped value, or undefined if no mapping is found.
 */
export function directMapProp(
  propName: string,
  propType: string,
  currentValue: unknown,
  ctx: DirectMapContext
): unknown | undefined {
  // Skip non-string types (images, videos, booleans, numbers handled elsewhere)
  if (propType === "image" || propType === "video" || propType === "boolean") {
    return undefined;
  }

  // --- Heading / subheading ---
  if (HEADING_RE.test(propName)) {
    return ctx.planHeading;
  }
  if (SUBHEADING_RE.test(propName) && ctx.sectionType === "hero") {
    return ctx.tagline;
  }

  // --- Brand name ---
  if (BRAND_NAME_RE.test(propName)) {
    return ctx.siteName;
  }

  // --- CTA text ---
  if (CTA_TEXT_RE.test(propName)) {
    return CTA_TEXT_BY_SECTION[ctx.sectionType] || "Learn More";
  }

  // --- CTA URL ---
  if (CTA_URL_RE.test(propName)) {
    if (ctx.sectionType === "hero" || ctx.sectionType === "cta") {
      return "/contact";
    }
    return `/${ctx.pageSlug !== "home" ? ctx.pageSlug : "contact"}`;
  }

  // --- Service/feature cards ---
  if (SERVICE_SECTION_TYPES.has(ctx.sectionType)) {
    let match = CARD_TITLE_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.services[idx]) return ctx.services[idx].title;
    }
    match = CARD_DESC_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.services[idx]) return ctx.services[idx].briefDescription;
    }
  }

  // --- Testimonials ---
  if (TESTIMONIAL_SECTION_TYPES.has(ctx.sectionType)) {
    let match = QUOTE_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.testimonials[idx]) return ctx.testimonials[idx].quote;
    }
    match = AUTHOR_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.testimonials[idx]) return ctx.testimonials[idx].authorName;
    }
    match = AUTHOR_ROLE_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.testimonials[idx]) return ctx.testimonials[idx].authorRole;
    }
  }

  // --- Team members ---
  if (TEAM_SECTION_TYPES.has(ctx.sectionType)) {
    let match = MEMBER_NAME_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.teamMembers[idx]) return ctx.teamMembers[idx].name;
    }
    match = MEMBER_ROLE_RE.exec(propName);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (ctx.teamMembers[idx]) return ctx.teamMembers[idx].role;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// AI fallback schema & prompt
// ---------------------------------------------------------------------------

/**
 * Build the AI prompt for hydrating remaining unresolved props.
 */
function buildHydrationPrompt(
  unresolvedProps: Array<{ name: string; type: string; currentValue: unknown; description?: string }>,
  ctx: DirectMapContext
): string {
  const propLines = unresolvedProps.map((p) => {
    const desc = p.description ? ` (${p.description})` : "";
    const current = typeof p.currentValue === "string" ? p.currentValue : JSON.stringify(p.currentValue);
    return `- "${p.name}" (type: ${p.type}${desc}): current = "${current}"`;
  }).join("\n");

  return `You are writing website content for a ${ctx.industry} business called "${ctx.siteName}".
Tone: ${ctx.tone}

## Section Context
- Type: ${ctx.sectionType}
- Heading: "${ctx.planHeading}"
- Content brief: ${ctx.planBrief}

## Props to Populate
Replace generic placeholder content with real, contextual content for this ${ctx.sectionType} section.

${propLines}

## Rules
- String props: Write real, specific content matching the business and tone (not generic filler)
- formatted_text props: Return a short HTML paragraph (<p>...</p>)
- list:text props: Return an array of 3-5 real items
- link props: Use contextual page paths like "/contact", "/services", "/about"
- integer/number props: Keep current value unless it's clearly wrong
- DO NOT change image or video prop values (those are handled separately)

Return a JSON object mapping prop names to their new values.`;
}

// ---------------------------------------------------------------------------
// YAML examples updater
// ---------------------------------------------------------------------------

/**
 * Update the `examples` values in a Canvas component config YAML string
 * to match the hydrated prop values.
 */
export function updateConfigYamlExamples(
  yamlContent: string,
  hydratedProps: Record<string, unknown>
): string {
  try {
    const config = YAML.parse(yamlContent);
    if (!config?.props) return yamlContent;

    for (const [propName, value] of Object.entries(hydratedProps)) {
      if (config.props[propName] && value !== undefined && value !== null) {
        // Skip image/video objects — enhance phase handles those
        if (typeof value === "object" && !Array.isArray(value)) continue;
        config.props[propName].examples = [value];
      }
    }

    return YAML.stringify(config, { lineWidth: 0, defaultKeyType: "PLAIN" });
  } catch {
    // If YAML parsing fails, return unchanged
    return yamlContent;
  }
}

// ---------------------------------------------------------------------------
// Per-section hydration
// ---------------------------------------------------------------------------

interface PropMeta {
  name: string;
  type: string;
  description?: string;
}

/**
 * Extract prop metadata from a Canvas component config YAML.
 * Returns prop name + type/description for mapping.
 */
export function extractPropMeta(yamlContent: string): PropMeta[] {
  try {
    const config = YAML.parse(yamlContent);
    if (!config?.props) return [];

    return Object.entries(config.props).map(([name, schema]) => {
      const s = schema as Record<string, unknown>;
      let type = "string";
      if (s.format === "uri") type = "link";
      else if (s["$ref"] && String(s["$ref"]).includes("image")) type = "image";
      else if (s["$ref"] && String(s["$ref"]).includes("video")) type = "video";
      else if (s.contentMediaType === "text/html") type = "formatted_text";
      else if (s.type === "boolean") type = "boolean";
      else if (s.type === "integer") type = "integer";
      else if (s.type === "number") type = "number";
      return { name, type, description: s.title as string | undefined };
    });
  } catch {
    return [];
  }
}

/**
 * Hydrate a single section's props using direct mapping + AI fallback.
 * Returns the count of props mapped directly and via AI.
 */
async function hydrateSection(
  section: PageSection,
  ctx: DirectMapContext,
  propMetas: PropMeta[],
  provider: AIProvider,
  model: string | undefined
): Promise<{ directMapped: number; aiGenerated: number }> {
  let directMapped = 0;
  let aiGenerated = 0;

  const currentProps = section.props;
  const unresolvedForAI: Array<{ name: string; type: string; currentValue: unknown; description?: string }> = [];

  // Phase 1: Direct mapping
  for (const meta of propMetas) {
    const currentValue = currentProps[meta.name];

    // Skip types handled by other phases
    if (meta.type === "image" || meta.type === "video" || meta.type === "boolean") {
      continue;
    }

    const mapped = directMapProp(meta.name, meta.type, currentValue, ctx);
    if (mapped !== undefined) {
      currentProps[meta.name] = mapped;
      directMapped++;
      continue;
    }

    // Check if current value looks like a placeholder that needs AI
    if (isPlaceholderValue(currentValue)) {
      unresolvedForAI.push({
        name: meta.name,
        type: meta.type,
        currentValue,
        description: meta.description,
      });
    }
  }

  // Phase 2: AI fallback for remaining unresolved props
  if (unresolvedForAI.length > 0) {
    try {
      const prompt = buildHydrationPrompt(unresolvedForAI, ctx);
      const schema = z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())]));

      const result = await generateValidatedJSON(
        provider,
        prompt,
        schema,
        { model, maxTokens: 2000, temperature: 0.5, phase: "hydrate" }
      );

      for (const [propName, value] of Object.entries(result)) {
        if (currentProps[propName] !== undefined && value !== undefined) {
          currentProps[propName] = value;
          aiGenerated++;
        }
      }
    } catch (err) {
      // AI fallback is non-fatal — keep existing values
      console.warn(`[hydrate] AI fallback failed for ${ctx.sectionType}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return { directMapped, aiGenerated };
}

// ---------------------------------------------------------------------------
// Main phase function
// ---------------------------------------------------------------------------

/**
 * Run the Content Hydration phase.
 *
 * Loads the saved blueprint, hydrates code component props with contextual
 * content from the ContentPlan, and saves the updated blueprint back.
 */
export async function runHydratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan
): Promise<HydratePhaseResult> {
  const startTime = Date.now();

  // Load the saved blueprint
  const blueprintRecord = await prisma.blueprint.findUnique({
    where: { siteId },
    select: { payload: true },
  });

  if (!blueprintRecord?.payload) {
    return { propsHydrated: 0, propsDirectMapped: 0, propsAiGenerated: 0, durationMs: Date.now() - startTime };
  }

  const blueprint = blueprintRecord.payload as unknown as BlueprintBundle;

  // Only hydrate code component blueprints
  if (!blueprint._codeComponents?.configs) {
    return { propsHydrated: 0, propsDirectMapped: 0, propsAiGenerated: 0, durationMs: Date.now() - startTime };
  }

  const provider = await getAIProvider();
  const model = resolveModel("hydrate");

  let totalDirectMapped = 0;
  let totalAiGenerated = 0;

  // Reference to configs for in-place YAML updates
  const configs = blueprint._codeComponents.configs;

  for (const page of blueprint.pages) {
    // Find the matching plan page
    const planPage = plan.pages.find((p) => p.slug === page.slug);
    if (!planPage) continue;

    for (let secIdx = 0; secIdx < page.sections.length; secIdx++) {
      const section = page.sections[secIdx];
      const planSection = planPage.sections[secIdx];
      if (!planSection) continue;

      // Extract machine name from component_id (js.{machineName})
      const machineName = section.component_id.replace("js.", "");
      const configYaml = configs[machineName];
      if (!configYaml) continue;

      // Get prop metadata from the YAML config
      const propMetas = extractPropMeta(configYaml);
      if (propMetas.length === 0) continue;

      const ctx: DirectMapContext = {
        sectionType: planSection.type,
        planHeading: planSection.heading,
        planBrief: planSection.contentBrief,
        siteName: data.name || plan.siteName,
        tagline: plan.tagline,
        industry: research.industry || data.industry || "",
        tone: research.toneGuidance?.primary || data.tone || "professional",
        pageSlug: page.slug,
        services: plan.globalContent.services,
        testimonials: plan.globalContent.testimonials || [],
        teamMembers: plan.globalContent.teamMembers || [],
      };

      const result = await hydrateSection(section, ctx, propMetas, provider, model);
      totalDirectMapped += result.directMapped;
      totalAiGenerated += result.aiGenerated;

      // Sync component tree inputs with hydrated props
      if (page.component_tree) {
        const treeNode = page.component_tree.find(
          (node) => node.component_id === section.component_id
        );
        if (treeNode) {
          treeNode.inputs = { ...section.props };
        }
      }

      // Update YAML config examples with hydrated values
      const updatedYaml = updateConfigYamlExamples(configYaml, section.props);
      if (updatedYaml !== configYaml) {
        configs[machineName] = updatedYaml;
      }
    }
  }

  // Save the updated blueprint back to the database
  const totalHydrated = totalDirectMapped + totalAiGenerated;
  if (totalHydrated > 0) {
    await prisma.blueprint.update({
      where: { siteId },
      data: {
        payload: JSON.parse(JSON.stringify(blueprint)),
      },
    });
  }

  const durationMs = Date.now() - startTime;
  console.log(
    `[hydrate] Complete: ${totalHydrated} props hydrated (${totalDirectMapped} direct, ${totalAiGenerated} AI) in ${durationMs}ms`
  );

  return {
    propsHydrated: totalHydrated,
    propsDirectMapped: totalDirectMapped,
    propsAiGenerated: totalAiGenerated,
    durationMs,
  };
}
