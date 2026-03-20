import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { z } from "zod";
import type { ContentPlanPageSchema } from "@/lib/pipeline/schemas";
import { getManifestComponent } from "../../blueprint/component-validator";
import { formatRulesForGeneration, classifyPageType, getRule } from "../page-design-rules";

type ContentPlanPage = z.infer<typeof ContentPlanPageSchema>;

/**
 * Build a concise prop reference for the most commonly used components,
 * derived from the Space DS manifest. This ensures the AI only uses
 * valid props for each component.
 */
function buildComponentPropReference(): string[] {
  const commonComponents = [
    // Heroes
    "space_ds:space-hero-banner-style-02",
    "space_ds:space-hero-banner-with-media",
    "space_ds:space-detail-page-hero-banner",
    "space_ds:space-video-banner",
    // CTA
    "space_ds:space-cta-banner-type-1",
    // Organisms
    "space_ds:space-accordion",
    "space_ds:space-slider",
    // Molecules (used as section content)
    "space_ds:space-section-heading",
    "space_ds:space-testimony-card",
    "space_ds:space-stats-kpi",
    "space_ds:space-user-card",
    "space_ds:space-imagecard",
    "space_ds:space-dark-bg-imagecard",
    "space_ds:space-contact-card",
    "space_ds:space-content-detail",
    "space_ds:space-logo-section",
    "space_ds:space-videocard",
    "space_ds:space-accordion-item",
    // Atoms (for content within flexi grids)
    "space_ds:space-heading",
    "space_ds:space-text",
    "space_ds:space-button",
    "space_ds:space-image",
    "space_ds:space-icon",
    "space_ds:space-link",
  ];

  const lines: string[] = [];
  for (const compId of commonComponents) {
    const comp = getManifestComponent(compId);
    if (!comp) continue;

    // Show string/HTML props (content props the AI should fill)
    const stringProps = comp.props
      .filter((p) => p.type === "string" && !p.enum)
      .map((p) => p.name);

    // Show slots (where child components go) — cast to access slot data from manifest
    const compAny = comp as unknown as { slots?: Array<{ name: string }> };
    const slots = compAny.slots
      ?.filter((s) => s.name)
      .map((s) => s.name) ?? [];

    const parts: string[] = [];
    if (stringProps.length > 0) {
      const example = stringProps.map((p) => `"${p}":"..."`).join(", ");
      parts.push(`string props = [${stringProps.join(", ")}] → props_json: '{${example}}'`);
    } else {
      parts.push(`no string content props (layout-only)`);
    }

    if (slots.length > 0) {
      parts.push(`slots = [${slots.join(", ")}]`);
    }

    lines.push(`- ${compId}: ${parts.join(" | ")}`);
  }

  return lines;
}

/**
 * Build a per-page generation prompt using the research brief, content plan,
 * and onboarding context. Each page gets its own AI call with full context.
 */
export function buildPageGenerationPrompt(
  page: ContentPlanPage,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan
): string {
  const sections: string[] = [
    `You are a professional website copywriter generating content for a specific page.`,
    ``,
    `## Site Context`,
    `- **Business:** ${data.name || plan.siteName}`,
    `- **Industry:** ${research.industry}`,
    `- **Audience:** ${research.targetAudience.primary}`,
    `- **Tone:** ${research.toneGuidance.primary}`,
    `- **Tagline:** ${plan.tagline}`,
    `- **Key Messages:** ${research.keyMessages.join("; ")}`,
  ];

  if (data.differentiators) {
    sections.push(`- **Differentiators:** ${data.differentiators}`);
  }

  if (research.complianceNotes && research.complianceNotes.length > 0) {
    sections.push(`- **Compliance:** ${research.complianceNotes.join("; ")}`);
  }

  // Tone guidance
  sections.push(
    ``,
    `## Tone Guidelines`,
    `- Style: ${research.toneGuidance.primary}`,
    `- Avoid: ${research.toneGuidance.avoid.join(", ") || "N/A"}`,
    `- Example sentences: ${research.toneGuidance.examples.join(" | ") || "N/A"}`
  );

  // Page-specific plan with section count requirement
  const pageType = classifyPageType(page.slug, page.title);
  const designRule = getRule(pageType);

  sections.push(
    ``,
    `## Page: ${page.title} (/${page.slug})`,
    `- **Purpose:** ${page.purpose}`,
    `- **SEO Keywords:** ${page.targetKeywords.join(", ")}`,
    `- **REQUIRED SECTION COUNT:** ${designRule.sectionCountRange[0]}-${designRule.sectionCountRange[1]} sections (you MUST generate at least ${designRule.sectionCountRange[0]} sections for this ${pageType} page)`,
    ``,
    `## Sections to Generate`
  );

  for (const section of page.sections) {
    const wordTarget = section.estimatedWordCount
      ? ` (~${section.estimatedWordCount} words)`
      : "";
    sections.push(
      `### ${section.heading} (type: ${section.type})${wordTarget}`,
      `Brief: ${section.contentBrief}`,
      section.componentSuggestion
        ? `Component: ${section.componentSuggestion}`
        : "",
      ``
    );
  }

  // Available services/team/testimonials from plan
  if (plan.globalContent.services.length > 0) {
    sections.push(
      `## Available Services`,
      ...plan.globalContent.services.map(
        (s) => `- **${s.title}:** ${s.briefDescription}`
      ),
      ``
    );
  }

  if (plan.globalContent.teamMembers && plan.globalContent.teamMembers.length > 0) {
    sections.push(
      `## Team Members`,
      ...plan.globalContent.teamMembers.map((t) => `- ${t.name}, ${t.role}`),
      ``
    );
  }

  if (plan.globalContent.testimonials && plan.globalContent.testimonials.length > 0) {
    sections.push(
      `## Testimonials`,
      ...plan.globalContent.testimonials.map(
        (t) => `- "${t.quote}" — ${t.authorName}${t.authorRole ? `, ${t.authorRole}` : ""}`
      ),
      ``
    );
  }

  sections.push(
    `## Output Format`,
    `Return JSON with:`,
    `- "slug": "${page.slug}"`,
    `- "title": "${page.title}"`,
    `- "seo": { "meta_title": string (50-60 chars, include primary keyword), "meta_description": string (150-160 chars) }`,
    `- "sections": Array. Each section is ONE of:`,
    ``,
    `  A. **Organism section** (hero, CTA, accordion, slider):`,
    `     - "component_id": organism component ID (e.g., "space_ds:space-hero-banner-style-02", "space_ds:space-cta-banner-type-1")`,
    `     - "props_json": JSON-encoded STRING of props`,
    `     - "children": (optional) array of child components for slots, each with:`,
    `       - "component_id": child component ID`,
    `       - "slot": slot name (e.g., "slide_item", "content", "items")`,
    `       - "props_json": JSON-encoded STRING of child props`,
    ``,
    `  B. **Composed section** (text+image, features, stats, team, cards):`,
    `     - "pattern": composition pattern name (e.g., "text-image-split-50-50")`,
    `     - "section_heading": { "label": string, "title": string, "description": string } (optional)`,
    `     - "container_background": background color for container (transparent|white|black|base-brand|option-1..option-10)`,
    `     - "children": array of child components, each with:`,
    `       - "component_id": atom/molecule component ID`,
    `       - "slot": target slot in flexi (column_one, column_two, column_three, column_four, content)`,
    `       - "props_json": JSON-encoded STRING of props`,
    ``,
    `    - IMPORTANT: props_json must be a valid JSON string, not an object`,
    `    - Use REAL, specific content — not placeholder text`,
    ``,
    `## Component Prop Reference (ONLY use props listed here)`,
    ``,
    ...buildComponentPropReference(),
    ``,
    ...formatRulesForGeneration(page.slug, page.title),
    ``,
    `IMPORTANT: Choose the most appropriate component or composition pattern for each section. Use organisms (type A) for heroes, CTAs, accordions, sliders. Use composed sections (type B) for content areas with text, images, cards, stats.`,
    ``,
    `## Layout Rules (MUST FOLLOW)`,
    ``,
    `### Container & Width`,
    `- Hero banners and CTA banners are full-width organisms — output them as type A sections`,
    `- All other content sections use composition patterns (type B) wrapped in space-container with boxed-width`,
    `- Every container must have padding_top: "large" and padding_bottom: "large"`,
    ``,
    `### Section Structure`,
    `- Every non-hero, non-CTA section should have a section_heading introducing it`,
    `- Alternate container backgrounds for visual rhythm: transparent → option-1 → white → option-2`,
    `- Never use the same background on consecutive sections`,
    ``,
    `### Flexi Column Matching`,
    `- column_width segments MUST equal the number of children: "33-33-33" = 3 children, "50-50" = 2 children, "25-25-25-25" = 4 children`,
    ``,
    `### Anti-Monotony`,
    `- NEVER use the same composition pattern in two consecutive sections`,
    `- For text+image sections, alternate the column order (text-left/image-right then image-left/text-right)`,
    ``,
    `### Heading Hierarchy (Semantic HTML)`,
    `- Hero title uses h1 — only ONE h1 per page`,
    `- Section headings use h2`,
    `- Subsection headings use h3`,
    `- Never skip heading levels`,
    ``,
    `### Icon Validation`,
    `- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)`,
    `- Safe values: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-line, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe`,
    ``,
    `Guidelines:`,
    `- CRITICAL: Only use props that are listed in the Component Prop Reference above. Do NOT use props that don't exist on a component.`,
    `- Write REAL content, not lorem ipsum or placeholders`,
    `- CTAs must be specific to the business (not "Get started" or "Learn more")`,
    `- Include SEO keywords naturally in headings and body text`,
    `- Match the tone guidelines exactly`,
    `- Meet the word count targets for each section`,
    ``,
    `Return ONLY valid JSON.`
  );

  return sections.filter(Boolean).join("\n");
}
