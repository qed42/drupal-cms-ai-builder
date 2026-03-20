import componentManifest from "@/lib/ai/space-component-manifest.json";

// Show ALL components grouped by category for compositional layout prompts.
// In the v2 model, sections are composed from organisms, molecules, and atoms in flexi grids.
function getManifestContext(): string {
  const categories = ["organism", "molecule", "atom", "base"] as const;
  return categories
    .map((cat) => {
      const components = componentManifest.filter(
        (c) => c.category === cat
      );
      if (components.length === 0) return "";
      const heading =
        cat.charAt(0).toUpperCase() + cat.slice(1) + "s";
      const entries = components
        .map((c) => {
          const propsSummary = c.props
            .filter(
              (p: { name: string; type: string }) =>
                p.type === "string"
            )
            .map(
              (p: {
                name: string;
                type: string;
                required: boolean;
                enum?: (string | number)[];
              }) =>
                `${p.name}${p.enum ? ` (${p.enum.join("|")})` : ""}${p.required ? " [req]" : ""}`
            )
            .join(", ");
          const slotsSummary = c.slots
            .map(
              (s: { name: string; title: string }) => s.name
            )
            .join(", ");
          return `- ${c.id}: ${(c as Record<string, unknown>).description || c.name}${propsSummary ? ` | Props: ${propsSummary}` : ""}${slotsSummary ? ` | Slots: ${slotsSummary}` : ""}`;
        })
        .join("\n");
      return `### ${heading}\n${entries}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export const PAGE_LAYOUT_PROMPT = `You are a web designer who creates page layouts using the Space DS v2 compositional component model for a Drupal CMS site. Design layouts for a {industry} business website.

## Available Components (Space DS v2)
Sections are composed from organisms, molecules, and atoms placed in flexi grid slots.

{component_manifest}

## Composition Model
- **Organism sections** (heroes, CTAs, accordions, sliders) are placed directly as full-width page sections
- **Composed sections** use a space-container + space-flexi grid with atoms/molecules placed in column slots
- Common patterns:
  - "text-image-split-50-50": flexi with two columns (text in column_one, image in column_two)
  - "three-card-grid": flexi with three columns, each holding a card molecule
  - "stats-row": flexi with four columns, each holding a space-stats-kpi
  - "testimonial-slider": space-slider organism with space-testimony-card children in slide_item slot

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
     - "component_id": organism ID (e.g., "space_ds:space-hero-banner-style-02")
     - "props": object matching the component's prop types
     - "children": (optional) array of child components for slots

  B. **Composed section** (text+image, features, stats, team, cards):
     - "pattern": composition pattern name
     - "section_heading": { "label": string, "title": string, "description": string }
     - "container_background": background color (transparent|white|base-brand|option-1..option-10)
     - "children": array of atom/molecule components with slot assignments

## LAYOUT RULES (MUST FOLLOW)

### Container & Width Rules
- Every section MUST be wrapped in a space-container (heroes and CTA banners are self-contained full-width organisms and are the only exceptions)
- Use "boxed-width" for all content sections (default). Use "full-width" ONLY for heroes and CTA banners
- Add padding_top: "large" and padding_bottom: "large" on every container for proper section spacing

### Background Variety
- Alternate container backgrounds for visual rhythm: transparent → option-1 → white → option-2
- Never use the same background color on two consecutive sections

### Flexi Column Matching
- The number of columns in column_width MUST match the number of children in the flexi grid
- Example: column_width "33-33-33" means exactly 3 children in column_one, column_two, column_three
- Example: column_width "50-50" means exactly 2 children in column_one, column_two

### Anti-Monotony Rules
- NEVER use the same composition pattern in two consecutive sections
- When two text+image sections appear near each other, alternate image position (e.g., "text-image-split-50-50" then "image-text-split-33-66")

### Heading Hierarchy (Semantic HTML)
- Hero title = h1 (only ONE h1 per page)
- Section headings = h2
- Subsection headings within content = h3
- Never skip heading levels (e.g., no h1 → h3 without h2)

### Icon Validation
- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)
- Safe icon names: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-line, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe

## Content Rules
- Homepage should have 4-6 sections: start with a hero banner, add feature/service sections, testimonials, and end with a CTA banner
- Inner pages should have 2-4 sections
- Always start pages with a hero banner organism (space-hero-banner-style-02 for homepage, space-hero-banner-with-media or space-detail-page-hero-banner for inner pages)
- Always end with space-cta-banner-type-1 except contact pages
- Use space-accordion organism for FAQ sections, with space-accordion-item children in the items slot
- Use composed sections with space-user-card molecules in a flexi grid for team/about pages
- Use composed sections with space-imagecard or space-content-detail for feature/service listings
- For text+image sections, use a two-column flexi with space-text + space-image atoms
- Every non-hero, non-CTA section should include a space-section-heading
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
  let compliance = "";
  if (data.compliance_flags.includes("hipaa")) {
    compliance +=
      '\n- Add a composed section with a space-text atom containing a HIPAA compliance notice to healthcare-related pages (use container_background: "option-1" for visibility)';
  }
  if (data.compliance_flags.includes("attorney_advertising")) {
    compliance +=
      '\n- Add a composed section with a space-text atom containing an attorney advertising disclaimer to the homepage (use container_background: "option-1" for visibility)';
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
