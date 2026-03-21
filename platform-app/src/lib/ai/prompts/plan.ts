import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief } from "@/lib/pipeline/schemas";
import { formatRulesForPlan, classifyPageType, getRule } from "../page-design-rules";

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
    `    - "type": Section type (hero, features, testimonials, cta, text, gallery, faq, team, pricing, stats)`,
    `    - "contentBrief": 2-3 sentences describing what content to generate for this section`,
    `    - "estimatedWordCount": Target word count for this section (e.g., hero: 30-50, text: 150-300, features: 100-200)`,
    `    - "componentSuggestion": Optional Space DS component suggestion`,
    `- "globalContent": Shared content used across pages:`,
    `  - "services": Array of { "title": string, "briefDescription": string } — 3-5 services`,
    `  - "teamMembers": Optional array of { "name": string, "role": string } — 2-4 members`,
    `  - "testimonials": Optional array of { "quote": string, "authorName": string, "authorRole": string } — 2-3 testimonials`,
    ``,
    ...formatRulesForPlan(pages),
    ``,
    `## Content Guidelines`,
    `- Use the research brief's tone guidance and key messages throughout`,
    `- Each section's contentBrief should be specific and actionable, not vague`,
    `- Include SEO keywords naturally in section briefs`,
    `- Every content section MUST have an estimatedWordCount that meets the word count range specified in the page requirements above`,
    ``,
    `## FINAL CHECK — Minimum Section Counts (your output will be REJECTED if any page falls below)`,
    ...pages.map((p) => {
      const pageType = classifyPageType(p.slug, p.title);
      const rule = getRule(pageType);
      return `- ${p.title} (/${p.slug}): MINIMUM ${rule.sectionCountRange[0]} sections`;
    }),
    ``,
    `Return ONLY valid JSON.`
  );

  return sections.join("\n");
}
