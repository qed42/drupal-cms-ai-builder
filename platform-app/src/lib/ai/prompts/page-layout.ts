import { getDefaultAdapter } from "@/lib/design-systems/setup";

/**
 * Build a component manifest context string from the active adapter.
 * Shows all components grouped by category for layout prompts.
 */
function getManifestContext(): string {
  const adapter = getDefaultAdapter();
  const manifest = adapter.getManifest();
  const categories = ["organism", "molecule", "atom", "base"] as const;

  return categories
    .map((cat) => {
      const components = manifest.filter((c) => c.category === cat);
      if (components.length === 0) return "";
      const heading = cat.charAt(0).toUpperCase() + cat.slice(1) + "s";
      const entries = components
        .map((c) => {
          const propsSummary = c.props
            .filter((p) => p.type === "string")
            .map(
              (p) =>
                `${p.name}${p.enum ? ` (${(p.enum as string[]).join("|")})` : ""}${p.required ? " [req]" : ""}`
            )
            .join(", ");
          const slotsSummary = (c.slots || []).map((s) => s.name).join(", ");
          return `- ${c.id}: ${c.description || c.name}${propsSummary ? ` | Props: ${propsSummary}` : ""}${slotsSummary ? ` | Slots: ${slotsSummary}` : ""}`;
        })
        .join("\n");
      return `### ${heading}\n${entries}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export const PAGE_LAYOUT_PROMPT = `You are a web designer who creates page layouts using a compositional component model for a Drupal CMS site. Design layouts for a {industry} business website.

## Available Components ({ds_name})
Sections are composed from organisms, molecules, and atoms placed in layout grid slots.

{component_manifest}

## Composition Model
- **Organism sections** (heroes, CTAs, accordions, sliders) are placed directly as full-width page sections
- **Composed sections** use a container + layout grid with atoms/molecules placed in column slots
- Common patterns:
  - "text-image-split-50-50": two columns (text in column_one, image in column_two)
  - "three-card-grid": three columns, each holding a card molecule
  - "stats-row": four columns, each holding a stats/KPI component
  - "testimonial-slider": slider organism with testimonial card children

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
- "sections": array where each section is ONE of:

  A. **Organism section** (hero, CTA, accordion, slider):
     - "component_id": organism ID from the component manifest above
     - "props": object matching the component's prop types
     - "children": (optional) array of child components for slots

  B. **Composed section** (text+image, features, stats, team, cards):
     - "pattern": composition pattern name
     - "section_heading": { "label": string, "title": string, "description": string }
     - "container_background": background color (transparent|white|base-brand|option-1..option-10)
     - "children": array of atom/molecule components with slot assignments

{design_guidance}

## Content Rules
- Homepage should have 4-6 sections: start with a hero banner, add feature/service sections, testimonials, and end with a CTA banner
- Inner pages should have 2-4 sections
- Always start pages with a hero banner organism
- Always end with a CTA banner except contact pages
- Use accordion organisms for FAQ sections with accordion-item children
- Use composed sections with user-card molecules in a layout grid for team/about pages
- Use composed sections with card components for feature/service listings
- For text+image sections, use a two-column layout with text + image atoms
- Every non-hero, non-CTA section should include a section heading
- Make all text content specific to the business, not generic placeholder text
- Keep CTA URLs as relative paths (e.g., "/contact", "/services")
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
  const adapter = getDefaultAdapter();

  let compliance = "";
  if (data.compliance_flags.includes("hipaa")) {
    compliance +=
      '\n- Add a composed section with a text atom containing a HIPAA compliance notice to healthcare-related pages (use container_background: "option-1" for visibility)';
  }
  if (data.compliance_flags.includes("attorney_advertising")) {
    compliance +=
      '\n- Add a composed section with a text atom containing an attorney advertising disclaimer to the homepage (use container_background: "option-1" for visibility)';
  }

  const pagesList = data.pages
    .map((p) => `- ${p.slug}: ${p.title}`)
    .join("\n");

  return PAGE_LAYOUT_PROMPT.replace("{component_manifest}", getManifestContext())
    .replace("{ds_name}", adapter.name)
    .replace("{design_guidance}", adapter.buildPromptDesignGuidance())
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
