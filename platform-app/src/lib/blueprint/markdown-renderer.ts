import type { PageLayout, PageSection } from "./types";

/**
 * Friendly labels for Space DS component IDs.
 */
const COMPONENT_LABELS: Record<string, string> = {
  "space_ds:space-hero-banner-style-01": "Hero Banner",
  "space_ds:space-hero-banner-style-02": "Hero Banner (Style 2)",
  "space_ds:space-hero-banner-style-03": "Hero Banner (Style 3)",
  "space_ds:space-hero-banner-style-04": "Hero Banner (Style 4)",
  "space_ds:space-hero-banner-style-05": "Hero Banner (Style 5)",
  "space_ds:space-hero-banner-style-06": "Hero Banner (Style 6)",
  "space_ds:space-hero-banner-style-07": "Hero Banner (Style 7)",
  "space_ds:space-hero-banner-style-08": "Hero Banner (Style 8)",
  "space_ds:space-hero-banner-style-09": "Hero Banner (Style 9)",
  "space_ds:space-hero-banner-style-10": "Hero Banner (Style 10)",
  "space_ds:space-hero-banner-style-11": "Hero Banner (Style 11)",
  "space_ds:space-text-media-default": "Text & Media",
  "space_ds:space-text-media-type-02": "Text & Media (Type 2)",
  "space_ds:space-text-media-type-03": "Text & Media (Type 3)",
  "space_ds:space-text-media-type-04": "Text & Media (Type 4)",
  "space_ds:space-text-media-type-05": "Text & Media (Type 5)",
  "space_ds:space-cta-banner-type-1": "Call to Action",
  "space_ds:space-cta-banner-type-2": "Call to Action (Type 2)",
  "space_ds:space-cta-banner-type-3": "Call to Action (Type 3)",
  "space_ds:space-features": "Features",
  "space_ds:space-accordion": "Accordion / FAQ",
  "space_ds:space-team-section-type-1": "Team Section",
  "space_ds:space-team-section-type-2": "Team Section (Type 2)",
  "space_ds:space-team-section-type-3": "Team Section (Type 3)",
  "space_ds:space-team-section-type-4": "Team Section (Type 4)",
  "space_ds:space-team-section-type-5": "Team Section (Type 5)",
  "space_ds:space-testimony-card": "Testimonial",
  "space_ds:space-pricing-card": "Pricing Card",
  "space_ds:space-stats-kpi": "Statistics / KPIs",
  "space_ds:space-logo-grid": "Logo Grid",
  "space_ds:space-icon-card": "Icon Card",
  "space_ds:space-imagecard": "Image Card",
  "space_ds:space-video": "Video",
  "space_ds:space-video-card": "Video Card",
  "space_ds:space-container": "Container",
  "space_ds:space-section-heading": "Section Heading",
  "space_ds:space-footer": "Footer",
  "space_ds:space-people-card-type-1": "People Card",
  "space_ds:space-people-card-type-2": "People Card (Type 2)",
  "space_ds:space-people-card-type-3": "People Card (Type 3)",
  "space_ds:space-people-card-type-4": "People Card (Type 4)",
  "space_ds:space-people-card-type-5": "People Card (Type 5)",
  "space_ds:space-quicklink-card": "Quick Link Card",
};

/**
 * Get a friendly label for a component ID.
 * Falls back to deriving a label from the ID string.
 */
export function getComponentLabel(componentId: string): string {
  if (COMPONENT_LABELS[componentId]) {
    return COMPONENT_LABELS[componentId];
  }
  // Derive from ID: "space_ds:space-hero-banner-style-01" → "Hero Banner Style 01"
  const name = componentId.split(":")[1] ?? componentId;
  return name
    .replace(/^space-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract human-readable text content from a section's props.
 * Returns lines of text suitable for markdown rendering.
 */
function extractSectionContent(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  // Title / heading
  const title = (props.title ?? props.heading) as string | undefined;
  if (title) {
    lines.push(`### ${title}`);
  }

  // Subtitle / sub-headline
  const subtitle = (props.sub_headline ?? props.subtitle ?? props.subheading) as string | undefined;
  if (subtitle) {
    lines.push(`*${subtitle}*`);
  }

  // Description / body text
  const description = (props.description ?? props.body ?? props.text ?? props.content) as string | undefined;
  if (description) {
    lines.push("", description);
  }

  // Button / CTA text
  const buttonText = (props.button_text ?? props.cta_text ?? props.button_label) as string | undefined;
  const buttonUrl = (props.button_url ?? props.cta_url ?? props.button_link) as string | undefined;
  if (buttonText) {
    lines.push("", `**[${buttonText}]${buttonUrl ? `(${buttonUrl})` : ""}**`);
  }

  // List items (features, benefits, etc.)
  const items = (props.items ?? props.features ?? props.list ?? props.cards) as unknown[] | undefined;
  if (Array.isArray(items) && items.length > 0) {
    lines.push("");
    for (const item of items) {
      if (typeof item === "string") {
        lines.push(`- ${item}`);
      } else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const itemTitle = (obj.title ?? obj.heading ?? obj.name) as string | undefined;
        const itemDesc = (obj.description ?? obj.text ?? obj.body) as string | undefined;
        if (itemTitle && itemDesc) {
          lines.push(`- **${itemTitle}** — ${itemDesc}`);
        } else if (itemTitle) {
          lines.push(`- **${itemTitle}**`);
        } else if (itemDesc) {
          lines.push(`- ${itemDesc}`);
        }
      }
    }
  }

  // Quote (testimonials)
  const quote = props.quote as string | undefined;
  const authorName = (props.author_name ?? props.author ?? props.name) as string | undefined;
  const authorRole = (props.author_role ?? props.role ?? props.position) as string | undefined;
  if (quote) {
    lines.push("", `> ${quote}`);
    if (authorName) {
      lines.push(`> — **${authorName}**${authorRole ? `, ${authorRole}` : ""}`);
    }
  }

  // Form fields
  const fields = props.fields as Array<{ label?: string; type?: string; required?: boolean }> | undefined;
  if (Array.isArray(fields) && fields.length > 0) {
    lines.push("", "**Form Fields:**");
    for (const field of fields) {
      const req = field.required ? " *(required)*" : "";
      lines.push(`- ${field.label ?? field.type ?? "Field"}${req}`);
    }
  }

  return lines;
}

/**
 * Render a single page section as markdown.
 */
export function sectionToMarkdown(section: PageSection, sectionIndex: number): string {
  const label = getComponentLabel(section.component_id);
  const lines: string[] = [];

  lines.push(`## Section ${sectionIndex + 1}: ${label}`);
  lines.push("");

  const content = extractSectionContent(section.props);
  if (content.length > 0) {
    lines.push(...content);
  } else {
    lines.push("*No text content*");
  }

  return lines.join("\n");
}

/**
 * Render a full blueprint page as human-readable markdown.
 */
export function blueprintPageToMarkdown(page: PageLayout): string {
  const lines: string[] = [];

  // Page header
  lines.push(`# ${page.title}`);
  lines.push("");

  // SEO metadata
  if (page.seo) {
    lines.push(`**SEO Title:** ${page.seo.meta_title}`);
    lines.push(`**Meta Description:** ${page.seo.meta_description}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // Render each section
  for (let i = 0; i < page.sections.length; i++) {
    lines.push(sectionToMarkdown(page.sections[i], i));
    if (i < page.sections.length - 1) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Render the full blueprint (all pages) as markdown.
 */
export function blueprintToMarkdown(pages: PageLayout[]): string {
  return pages
    .map((page) => blueprintPageToMarkdown(page))
    .join("\n\n---\n\n");
}
