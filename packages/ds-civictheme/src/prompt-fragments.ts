import type { ComponentDefinition, PropDefinition, SlotDefinition } from "@ai-builder/ds-types";
import manifest from "./manifest.json";

/**
 * Build a concise prop reference for commonly used CivicTheme components.
 *
 * CRITICAL: This instructs the AI to use pre-composed organisms, not
 * grid primitives. CivicTheme does NOT have a generic container+grid system.
 */
export function buildPromptComponentReference(): string {
  const commonComponents = [
    // Heroes
    "civictheme:banner",
    "civictheme:campaign",
    // Key organism
    "civictheme:promo",
    // CTA
    "civictheme:callout",
    // Layout
    "civictheme:list",
    "civictheme:slider",
    "civictheme:carousel",
    "civictheme:accordion",
    // Cards
    "civictheme:navigation-card",
    "civictheme:promo-card",
    "civictheme:event-card",
    "civictheme:publication-card",
    "civictheme:service-card",
    "civictheme:price-card",
    "civictheme:snippet",
    "civictheme:accordion-panel",
    // Atoms
    "civictheme:heading",
    "civictheme:paragraph",
    "civictheme:button",
    "civictheme:content-link",
    "civictheme:figure",
    "civictheme:icon",
  ];

  const components = manifest as ComponentDefinition[];

  const lines: string[] = [];
  for (const compId of commonComponents) {
    const comp = components.find((c: ComponentDefinition) => c.id === compId);
    if (!comp) continue;

    const stringProps = comp.props
      .filter((p: PropDefinition) => p.type === "string" && !p.enum)
      .map((p: PropDefinition) => p.name);

    const slots = comp.slots
      ?.filter((s: SlotDefinition) => s.name)
      .map((s: SlotDefinition) => s.name) ?? [];

    const parts: string[] = [];
    if (stringProps.length > 0) {
      const example = stringProps.map((p: string) => `"${p}":"..."`).join(", ");
      parts.push(`string props = [${stringProps.join(", ")}] -> props_json: '{${example}}'`);
    } else {
      parts.push(`no string content props (layout-only)`);
    }

    if (slots.length > 0) {
      parts.push(`slots = [${slots.join(", ")}]`);
    }

    lines.push(`- ${compId}: ${parts.join(" | ")}`);
  }

  return lines.join("\n");
}

/**
 * Build accessibility rules for AI prompt injection.
 */
export function buildPromptAccessibilityRules(): string {
  return [
    "## Accessibility & Contrast (WCAG AA)",
    "- CivicTheme uses theme: 'light' | 'dark' per component — ensure text is readable",
    "- Light theme = dark text on light background (default, best for readability)",
    "- Dark theme = light text on dark background (use for heroes, CTAs, accent sections)",
    "- Do NOT use dark theme on more than 2 consecutive sections",
    "- Hero banners and CTA callouts should typically use theme: 'dark'",
    "- Content sections (promo, list) should default to theme: 'light'",
    "",
    "## Heading Hierarchy (Semantic HTML)",
    "- Hero title = h1 (the ONLY h1 on the page)",
    "- Section headings = h2 (via heading component with level: 2)",
    "- Card titles / subsections = h3 or h4",
    "- Never skip heading levels (no h1 -> h3 without h2 in between)",
    "",
    "## Icon Validation",
    "- CivicTheme uses its own icon set — use semantic icon names",
    "- Safe values: email, phone, location, clock, calendar, search, menu, close, arrow-right, arrow-left, download, external, facebook, twitter, linkedin, instagram",
  ].join("\n");
}

/**
 * Build design guidance rules for AI prompt injection.
 *
 * CRITICAL: This is the most important fragment — it tells the AI to
 * use pre-composed organisms instead of grid primitives.
 */
export function buildPromptDesignGuidance(): string {
  return [
    "## CivicTheme Composition Model (MUST FOLLOW)",
    "",
    "### CRITICAL: Organism-First Architecture",
    "CivicTheme does NOT have a generic container or grid component.",
    "DO NOT try to compose sections from container + grid + atoms.",
    "Instead, select the correct PRE-COMPOSED ORGANISM for each content type:",
    "",
    "| Content Need | Use This Organism | NOT This |",
    "|---|---|---|",
    "| Text + Image side-by-side | civictheme:promo | container + grid + heading + text + image |",
    "| Feature highlights grid | civictheme:list + navigation-cards | container + grid + icon + heading |",
    "| Testimonials | civictheme:slider + snippets | container + grid + quote |",
    "| Team members | civictheme:list + promo-cards | container + grid + user-card |",
    "| FAQ | civictheme:accordion + accordion-panels | container + collapsible items |",
    "| CTA banner | civictheme:callout | container + heading + button |",
    "| Blog/articles grid | civictheme:list + publication-cards | container + grid + cards |",
    "| Contact info | civictheme:list + service-cards | container + grid + contact-card |",
    "| Pricing | civictheme:list + price-cards | container + grid + price items |",
    "| Full-width text | civictheme:callout (simple) | container + paragraph |",
    "",
    "### Theme Alternation",
    "- Alternate theme: 'light' and theme: 'dark' between sections for visual rhythm",
    "- Heroes and CTAs should use theme: 'dark'",
    "- Content sections should primarily use theme: 'light'",
    "- Never use theme: 'dark' on more than 2 consecutive sections",
    "",
    "### Section Structure",
    "- Each content section maps to exactly ONE organism (promo, list, callout, slider, accordion)",
    "- Cards go inside civictheme:list items slot or civictheme:slider slides slot",
    "- Buttons go inside civictheme:callout cta slot",
    "- Paragraphs/buttons go inside civictheme:banner content slot or civictheme:campaign content slot",
    "",
    "### Anti-Monotony",
    "- NEVER use the same organism type in two consecutive sections",
    "- For multiple text+image sections, alternate promo layouts",
    "- Mix card types (navigation-card, promo-card, service-card) across sections",
    "",
    "### Component-Specific Rules",
    "- **civictheme:promo**: The workhorse organism for text+image. Set title, content (HTML), image, and optional url.",
    "- **civictheme:callout**: For CTA sections. Put button children in the 'cta' slot.",
    "- **civictheme:list**: For card grids. Set column_count (2, 3, or 4) and put cards in 'items' slot.",
    "- **civictheme:snippet**: For testimonials. Set quote, author, and author_image.",
    "- **civictheme:paragraph**: Content prop accepts HTML. Wrap in <p> tags.",
    "- **civictheme:accordion-panel**: Set title (question) and content (answer HTML).",
    "- **Images**: Each component with an image prop should describe a unique, contextually relevant image.",
  ].join("\n");
}
