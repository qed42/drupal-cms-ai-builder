import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { z } from "zod";
import type { ContentPlanPageSchema } from "@/lib/pipeline/schemas";

type ContentPlanPage = z.infer<typeof ContentPlanPageSchema>;

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
    `  - "props_json": A JSON-encoded STRING of the component props object. You MUST stringify the props object. Common props:`,
    `    - hero: '{"title":"...","sub_headline":"...","description":"..."}'`,
    `    - text-media: '{"title":"...","description":"..."}' (description is the full paragraph content)`,
    `    - cta-banner: '{"title":"...","description":"..."}'`,
    `    - Use REAL, specific content — not placeholder text`,
    `    - IMPORTANT: props_json must be a valid JSON string, not an object`,
    ``,
    `Component ID mapping:`,
    `- hero → "space_ds:space-hero-banner-style-01" or "space_ds:space-hero-banner-style-03"`,
    `- text/features/about → "space_ds:space-text-media-default"`,
    `- cta → "space_ds:space-cta-banner-type-1"`,
    `- testimonials → "space_ds:space-text-media-default" (with testimonial content)`,
    `- team → "space_ds:space-text-media-default" (with team bios)`,
    `- faq → "space_ds:space-text-media-default" (with Q&A format)`,
    `- gallery → "space_ds:space-text-media-default"`,
    `- stats → "space_ds:space-text-media-default"`,
    ``,
    `Guidelines:`,
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
