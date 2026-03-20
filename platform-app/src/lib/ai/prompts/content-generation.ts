export const CONTENT_GENERATION_PROMPT = `You are a professional content writer for websites. Generate realistic, industry-appropriate content for a {industry} business website.

Business details:
- Name: {name}
- Description: {idea}
- Target audience: {audience}
- Tone: {tone}
- Pages: {pages}

Generate content items as a JSON object with these sections (include only what's relevant to the industry):

1. "services" — array of 3-6 services/offerings. Each: { "title", "description" (2-3 sentences), "icon" (emoji) }
2. "team_members" — array of 3-4 team members. Each: { "title" (name), "role", "bio" (1-2 sentences) }
3. "testimonials" — array of 3 testimonials. Each: { "title" (summary), "quote" (1-2 sentences), "author_name", "author_role", "rating" (1-5) }

Also generate:
4. "site_tagline" — a compelling tagline (under 10 words)
5. "site_description" — a 2-3 sentence site description for the homepage
6. "footer_description" — a 2-3 sentence company/brand description for the site footer
7. "footer_disclaimer" — a brief legal disclaimer appropriate for this industry (empty string if not needed)
8. "cta_text" — short call-to-action button text for the header (e.g., "Get Started", "Book Now", "Contact Us")

Rules:
- Content must be realistic and specific to the business type
- Use professional language matching the specified tone
- Names should be realistic but clearly fictional (not real people)
- Do NOT include any placeholder text like "Lorem ipsum"
{compliance_instructions}

Return ONLY valid JSON, no markdown or explanation.`;

export function buildContentPrompt(data: {
  name: string;
  idea: string;
  audience: string;
  industry: string;
  tone: string;
  pages: string[];
  compliance_flags: string[];
}): string {
  let compliance = "";
  if (data.compliance_flags.includes("hipaa")) {
    compliance +=
      "\n- Include a HIPAA compliance notice in any health-related content";
  }
  if (data.compliance_flags.includes("attorney_advertising")) {
    compliance +=
      '\n- Include "Attorney Advertising" disclaimer language where appropriate';
  }
  if (data.compliance_flags.includes("fair_housing")) {
    compliance += "\n- Include Fair Housing Act compliance language";
  }

  return CONTENT_GENERATION_PROMPT.replace("{industry}", data.industry)
    .replace("{name}", data.name)
    .replace("{idea}", data.idea)
    .replace("{audience}", data.audience)
    .replace("{tone}", data.tone)
    .replace("{pages}", data.pages.join(", "))
    .replace(
      "{compliance_instructions}",
      compliance ? `\nCompliance requirements:${compliance}` : ""
    );
}
