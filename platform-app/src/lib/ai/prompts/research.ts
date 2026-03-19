import type { OnboardingData } from "@/lib/blueprint/types";

/**
 * Build the research phase prompt from onboarding data.
 * Produces a ResearchBrief with industry analysis, audience insights,
 * competitor positioning, tone guidance, and SEO opportunities.
 */
export function buildResearchPrompt(data: OnboardingData): string {
  const sections: string[] = [
    `You are a senior content strategist researching a new website project.`,
    `Analyze the following business information and produce a structured research brief.`,
    ``,
    `## Business Details`,
    `- **Business Name:** ${data.name || "Unnamed Business"}`,
    `- **Business Idea:** ${data.idea || "Not provided"}`,
    `- **Industry:** ${data.industry || "other"}`,
    `- **Target Audience:** ${data.audience || "general audience"}`,
    `- **Brand Tone:** ${data.tone || "professional_warm"}`,
  ];

  if (data.differentiators) {
    sections.push(`- **Differentiators:** ${data.differentiators}`);
  }

  if (data.followUpAnswers && Object.keys(data.followUpAnswers).length > 0) {
    sections.push(``, `## Industry-Specific Details`);
    for (const [question, answer] of Object.entries(data.followUpAnswers)) {
      sections.push(`- **${question}:** ${answer}`);
    }
  }

  if (data.pages && data.pages.length > 0) {
    sections.push(
      ``,
      `## Planned Pages`,
      ...data.pages.map(
        (p) =>
          `- **${p.title}** (/${p.slug})${p.description ? `: ${p.description}` : ""}`
      )
    );
  }

  if (data.referenceUrls && data.referenceUrls.length > 0) {
    sections.push(
      ``,
      `## Reference Websites`,
      ...data.referenceUrls.map((url) => `- ${url}`)
    );
  }

  if (data.existingCopy) {
    sections.push(
      ``,
      `## Existing Brand Copy`,
      `\`\`\``,
      data.existingCopy.slice(0, 2000),
      `\`\`\``
    );
  }

  if (data.keywords && data.keywords.length > 0) {
    sections.push(
      `- **Pre-analyzed Keywords:** ${data.keywords.join(", ")}`
    );
  }

  if (data.compliance_flags && data.compliance_flags.length > 0) {
    sections.push(
      ``,
      `## Compliance Requirements`,
      `The following compliance flags apply: ${data.compliance_flags.join(", ")}`
    );
  }

  sections.push(
    ``,
    `## Instructions`,
    `Based on the above, produce a research brief as JSON with these fields:`,
    `- "industry": Industry classification string`,
    `- "targetAudience": { "primary": string, "demographics": string[], "painPoints": string[] }`,
    `- "competitors": Array of { "name": string, "strengths": string[], "weaknesses": string[] } — 2-4 typical competitors in this space`,
    `- "keyMessages": Array of 3-5 core value propositions for this business`,
    `- "toneGuidance": { "primary": string describing the tone, "avoid": string[] of things to avoid, "examples": string[] of 2-3 sample sentences in the right tone }`,
    `- "seoKeywords": Array of 8-12 SEO keywords relevant to this business`,
    `- "complianceNotes": Array of compliance considerations (empty array if none apply)`,
    ``,
    `Make the research specific to THIS business, not generic. Use industry terminology.`,
    `Return ONLY valid JSON.`
  );

  return sections.join("\n");
}
