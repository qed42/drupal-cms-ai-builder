import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { z } from "zod";
import type { ContentPlanPageSchema } from "@/lib/pipeline/schemas";
import { getManifestComponent } from "../../blueprint/component-validator";

type ContentPlanPage = z.infer<typeof ContentPlanPageSchema>;

/**
 * Build a concise prop reference for the most commonly used components,
 * derived from the Space DS manifest. This ensures the AI only uses
 * valid props for each component.
 */
function buildComponentPropReference(): string[] {
  const commonComponents = [
    "space_ds:space-hero-banner-style-01",
    "space_ds:space-hero-banner-style-03",
    "space_ds:space-hero-banner-style-09",
    "space_ds:space-text-media-default",
    "space_ds:space-text-media-with-checklist",
    "space_ds:space-text-media-with-link",
    "space_ds:space-text-media-with-stats",
    "space_ds:space-text-media-with-images",
    "space_ds:space-cta-banner-type-1",
    "space_ds:space-cta-banner-type-2",
    "space_ds:space-cta-banner-type-3",
    "space_ds:space-accordion",
    "space_ds:space-team-section-image-card-1",
    "space_ds:space-team-section-simple-1",
    "space_ds:space-people-card-testimony-with-avatar",
    "space_ds:space-testimony-card",
    "space_ds:space-stats-kpi",
    "space_ds:space-pricing-card",
    "space_ds:space-pricing-featured-card",
    "space_ds:space-icon-card",
  ];

  const lines: string[] = [];
  for (const compId of commonComponents) {
    const comp = getManifestComponent(compId);
    if (!comp) continue;

    // Only show string props (content props the AI should fill)
    const stringProps = comp.props
      .filter((p) => p.type === "string" && !p.enum)
      .map((p) => p.name);

    if (stringProps.length > 0) {
      const example = stringProps.map((p) => `"${p}":"..."`).join(", ");
      lines.push(`- ${compId}: string props = [${stringProps.join(", ")}] → props_json: '{${example}}'`);
    } else {
      lines.push(`- ${compId}: no string content props (layout-only component)`);
    }
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

  // Page-specific plan
  sections.push(
    ``,
    `## Page: ${page.title} (/${page.slug})`,
    `- **Purpose:** ${page.purpose}`,
    `- **SEO Keywords:** ${page.targetKeywords.join(", ")}`,
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
    `- "sections": Array matching the sections above. Each section:`,
    `  - "component_id": Space DS component ID (e.g., "space_ds:space-hero-banner-style-01", "space_ds:space-text-media-default", "space_ds:space-cta-banner-type-1")`,
    `  - "props_json": A JSON-encoded STRING of the component props object. You MUST stringify the props object.`,
    `    - IMPORTANT: props_json must be a valid JSON string, not an object`,
    `    - Use REAL, specific content — not placeholder text`,
    ``,
    `## Component Prop Reference (ONLY use props listed here)`,
    ``,
    ...buildComponentPropReference(),
    ``,
    `Component ID mapping (use the BEST matching component for each section type):`,
    `- hero → "space_ds:space-hero-banner-style-01" (simple hero) or "space_ds:space-hero-banner-style-03" (hero with description) or "space_ds:space-hero-banner-style-09" (text-only hero)`,
    `- text/about → "space_ds:space-text-media-default" (text with optional image)`,
    `- features → "space_ds:space-text-media-with-checklist" (features with checklist) or "space_ds:space-text-media-with-stats" (features with stats)`,
    `- cta → "space_ds:space-cta-banner-type-1" or "space_ds:space-cta-banner-type-2" (with image) or "space_ds:space-cta-banner-type-3"`,
    `- testimonials → "space_ds:space-people-card-testimony-with-avatar" (single testimonial) or "space_ds:space-testimony-card" (testimonial card)`,
    `- team → "space_ds:space-team-section-image-card-1" (team with photos) or "space_ds:space-team-section-simple-1" (simple team list)`,
    `- faq → "space_ds:space-accordion" (collapsible Q&A)`,
    `- stats/kpi → "space_ds:space-stats-kpi" (key metrics display)`,
    `- gallery/images → "space_ds:space-text-media-with-images" (image gallery with text)`,
    `- links/resources → "space_ds:space-text-media-with-link" (content with links)`,
    `- pricing → "space_ds:space-pricing-card" (pricing tier) or "space_ds:space-pricing-featured-card" (featured pricing)`,
    ``,
    `IMPORTANT: Choose the most appropriate component for each section. Do NOT default everything to space-text-media-default — use specialized components when they match the content type.`,
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
