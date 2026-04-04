import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief } from "@/lib/pipeline/schemas";
import { formatRulesForPlan, formatCodeComponentPlanRules, classifyPageType, getRule, buildSectionSkeleton } from "../page-design-rules";

/**
 * Build the plan phase prompt from research brief + onboarding data.
 * Produces a ContentPlan with per-page section outlines, word count targets,
 * SEO keywords, and CTA strategy.
 */
export function buildPlanPrompt(
  data: OnboardingData,
  research: ResearchBrief
): string {
  const pages = data.pages || [
    { slug: "home", title: "Home" },
    { slug: "about", title: "About Us" },
    { slug: "contact", title: "Contact" },
  ];

  const isCodeComponents = data.generationMode === "code_components";

  const componentSuggestionDesc = isCodeComponents
    ? `Visual treatment description — describe the desired layout, animation style, and visual approach (e.g., "bento grid with staggered reveal", "full-bleed parallax hero with gradient overlay")`
    : `Optional Space DS component suggestion`;

  const sectionTypeDesc = isCodeComponents
    ? `Section type — use standard types (hero, features, testimonials, cta, text, gallery, faq, team, pricing, stats) OR invent descriptive types that fit the narrative (e.g., "scroll-timeline", "bento-showcase", "process-flow", "comparison-table")`
    : `Section type (hero, features, testimonials, cta, text, gallery, faq, team, pricing, stats)`;

  const sections: string[] = [
    `You are a senior content planner creating a detailed content plan for a website.`,
    `Use the research brief and business details below to produce a structured plan.`,
    ``,
    `## Business Overview`,
    `- **Name:** ${data.name || "Unnamed Business"}`,
    `- **Industry:** ${research.industry}`,
    `- **Target Audience:** ${research.targetAudience.primary}`,
    `- **Pain Points:** ${research.targetAudience.painPoints.join(", ")}`,
    `- **Tone:** ${research.toneGuidance.primary}`,
    `- **Key Messages:** ${research.keyMessages.join("; ")}`,
    `- **SEO Keywords:** ${research.seoKeywords.join(", ")}`,
  ];

  if (research.complianceNotes && research.complianceNotes.length > 0) {
    sections.push(
      `- **Compliance Notes:** ${research.complianceNotes.join("; ")}`
    );
  }

  if (data.differentiators) {
    sections.push(`- **Differentiators:** ${data.differentiators}`);
  }

  sections.push(
    ``,
    `## Pages to Plan`,
    ...pages.map(
      (p) =>
        `- **${p.title}** (/${p.slug})${p.description ? ` — ${p.description}` : ""}`
    ),
    ``,
    `## Instructions`,
    `Create a content plan as JSON with these fields:`,
    `- "siteName": The business name`,
    `- "tagline": A compelling tagline for the business (10-15 words)`,
    `- "pages": Array of page plans, one per page listed above. Each page has:`,
    `  - "slug": URL slug`,
    `  - "title": Page title`,
    `  - "purpose": One sentence explaining the page's goal`,
    `  - "targetKeywords": 2-3 SEO keywords for this page`,
    `  - "sections": Array of content sections, each with:`,
    `    - "heading": Section heading text`,
    `    - "type": ${sectionTypeDesc}`,
    `    - "contentBrief": 2-3 sentences describing what content to generate for this section`,
    `    - "estimatedWordCount": Target word count for this section (e.g., hero: 30-50, text: 150-300, features: 100-200)`,
    `    - "componentSuggestion": ${componentSuggestionDesc}`,
    `- "globalContent": Shared content used across pages:`,
    `  - "services": Array of { "title": string, "briefDescription": string } — 3-5 services`,
    `  - "teamMembers": Optional array of { "name": string, "role": string } — 2-4 members`,
    `  - "testimonials": Optional array of { "quote": string, "authorName": string, "authorRole": string } — 2-3 testimonials`,
    ``,
    ...(isCodeComponents ? formatCodeComponentPlanRules(pages) : formatRulesForPlan(pages)),
    ``,
    `## Hero Headline Quality (CRITICAL — applies to EVERY hero section heading)`,
    `- The hero section "heading" field is the h1 of the page — it MUST be a compelling, marketing-grade headline`,
    `- ABSOLUTELY FORBIDDEN: "Welcome", "Welcome to [Business Name]", "Home", "About Us", "About Our Company", or any generic/boilerplate text`,
    `- The hero heading MUST communicate the business's core value proposition using the research brief's key messages and SEO keywords`,
    `- Target 5-12 words — punchy, benefit-driven, audience-aware`,
    `- Good examples: "Expert Family Dental Care — Smiles That Last a Lifetime", "Portland's Trusted Home Renovation Specialists", "Transform Your Space With Award-Winning Interior Design"`,
    `- Bad examples: "Welcome to Smith Dental", "Welcome", "About Our Company", "Our Services", "Home Page", "Contact Us"`,
    `- Every page's hero heading must be UNIQUE and tailored to that page's purpose and keywords`,
    ``,
    `## Content Guidelines`,
    `- ALL text content (headings, briefs, descriptions) MUST be contextual to the business details provided during onboarding — never use generic filler text`,
    `- Use the research brief's tone guidance and key messages throughout`,
    `- Each section's contentBrief should be specific and actionable, not vague`,
    `- Include SEO keywords naturally in section briefs`,
    `- Every content section MUST have an estimatedWordCount that meets the word count range specified in the page requirements above`,
  );

  // SDC mode: strict skeleton enforcement. Code components: soft guidance.
  if (isCodeComponents) {
    sections.push(
      ``,
      `## Suggested Section Flow (flexible — you may reorder or substitute non-hero sections)`,
      ``,
      `For each page below, the suggested sections are a starting point. You MUST include a hero section`,
      `at the opening. Beyond that, choose sections that best serve the page's purpose and business narrative.`,
      `You may reorder non-hero sections, substitute types, or introduce novel section types.`,
      ``,
      ...pages.flatMap((p) => {
        const pageType = classifyPageType(p.slug, p.title);
        const rule = getRule(pageType);
        const relaxedMin = Math.max(3, rule.sectionCountRange[0] - 2);
        const required = rule.sections.filter((s) => s.required);
        const optional = rule.sections.filter((s) => !s.required);
        return [
          `### ${p.title} (/${p.slug}) — at least ${relaxedMin} sections:`,
          `  1. type: "hero" (REQUIRED — opening)`,
          ...required.filter((s) => s.type !== "hero").map((s, i) =>
            `  ${i + 2}. type: "${s.type}" (recommended)`
          ),
          ...optional.map((s) =>
            `  - type: "${s.type}" (optional)`
          ),
          `  - Or: any creative section type that serves the narrative`,
          ``,
        ];
      }),
      `Aim for variety and storytelling impact over rigid structure.`,
      ``,
      `Return ONLY valid JSON.`
    );
  } else {
    sections.push(
      ``,
      `## EXACT SECTION SLOTS PER PAGE (CRITICAL — you MUST produce exactly these sections)`,
      ``,
      `For each page below, produce EXACTLY the listed section types in the given order.`,
      `You fill in the "heading", "contentBrief", "estimatedWordCount", and "componentSuggestion" for each slot.`,
      `You may swap optional section types for another type of equal weight, but the TOTAL COUNT must match exactly.`,
      ``,
      ...pages.flatMap((p) => {
        const pageType = classifyPageType(p.slug, p.title);
        const skeleton = buildSectionSkeleton(pageType);
        return [
          `### ${p.title} (/${p.slug}) — EXACTLY ${skeleton.length} sections:`,
          ...skeleton.map((s, i) =>
            `  ${i + 1}. type: "${s.type}" ${s.required ? "(REQUIRED)" : "(optional — may swap type)"}`
          ),
          ``,
        ];
      }),
      `If you produce fewer sections than specified for ANY page, your output will be REJECTED.`,
      ``,
      `Return ONLY valid JSON.`
    );
  }

  return sections.join("\n");
}
