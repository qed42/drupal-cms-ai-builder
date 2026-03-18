import componentManifest from "@/lib/ai/space-component-manifest.json";

// Filter to organism-level components (page sections) for layout prompts.
// Atoms and molecules are internal building blocks, not directly placed on pages.
function getManifestContext(): string {
  const organisms = componentManifest.filter(
    (c) => c.category === "organism"
  );

  return organisms
    .map((c) => {
      const propsSummary = c.props
        .map(
          (p: { name: string; type: string; required: boolean; enum?: (string | number)[] }) =>
            `${p.name}: ${p.type}${p.enum ? ` (${p.enum.join("|")})` : ""}${p.required ? " [required]" : ""}`
        )
        .join(", ");
      const slotsSummary = c.slots
        .map((s: { name: string; title: string }) => s.name)
        .join(", ");
      return `- ${c.id} [${c.group}]: ${c.usage_hint}${propsSummary ? ` | Props: ${propsSummary}` : ""}${slotsSummary ? ` | Slots: ${slotsSummary}` : ""}`;
    })
    .join("\n");
}

export const PAGE_LAYOUT_PROMPT = `You are a web designer who creates page layouts using pre-built Space DS components for a Drupal CMS site. Design layouts for a {industry} business website.

## Available Page-Level Components (Organisms)
These are the components you can place on pages. Each has props you can set and slots where child components go.

{component_manifest}

## Business Context
- Name: {name}
- Industry: {industry}
- Tone: {tone}
- Audience: {audience}

## Content Available
{content_summary}

## Pages to Design
{pages_list}

For EACH page, generate a layout as a JSON object with:
- "slug": the page slug
- "title": page title
- "seo": { "meta_title": "Page Title | {name}", "meta_description": "150 chars max" }
- "sections": array of component instances, each with:
  - "component_id": must be one of the component IDs listed above (e.g., "space_ds:space-hero-banner-style-01")
  - "props": object matching the component's prop types

Rules:
- Homepage should have 4-6 sections: start with a hero banner, add feature/service sections, testimonials, and end with a CTA banner
- Inner pages should have 2-4 sections
- Always start pages with a hero banner component (pick an appropriate space-hero-banner-style variant)
- Always end with a CTA banner component (space-cta-banner-type-1/2/3) except contact pages
- Use space-team-section variants for team/about pages
- Use space-accordion for FAQ sections
- Use space-text-media variants for content sections with text and images
- Make all text content specific to the business, not generic placeholder text
- Keep CTA URLs as relative paths (e.g., "/contact", "/services")
- Choose hero banner styles that match the page purpose (e.g., style-01 for homepage, style-03 for inner pages)
{compliance_sections}

Return a JSON object with a "pages" key containing an array of page layout objects. Return ONLY valid JSON, no markdown.`;

export function buildPageLayoutPrompt(data: {
  name: string;
  industry: string;
  tone: string;
  audience: string;
  pages: Array<{ slug: string; title: string }>;
  contentSummary: string;
  compliance_flags: string[];
}): string {
  let compliance = "";
  if (data.compliance_flags.includes("hipaa")) {
    compliance +=
      '\n- Add a "space_ds:space-notification-banner" component with a HIPAA compliance notice to healthcare-related pages';
  }
  if (data.compliance_flags.includes("attorney_advertising")) {
    compliance +=
      '\n- Add a "space_ds:space-notification-banner" component with an attorney advertising disclaimer to the homepage';
  }

  const pagesList = data.pages
    .map((p) => `- ${p.slug}: ${p.title}`)
    .join("\n");

  return PAGE_LAYOUT_PROMPT.replace("{component_manifest}", getManifestContext())
    .replace(/\{name\}/g, data.name)
    .replace(/\{industry\}/g, data.industry)
    .replace("{tone}", data.tone)
    .replace("{audience}", data.audience)
    .replace("{content_summary}", data.contentSummary)
    .replace("{pages_list}", pagesList)
    .replace(
      "{compliance_sections}",
      compliance ? `\nCompliance layout requirements:${compliance}` : ""
    );
}
