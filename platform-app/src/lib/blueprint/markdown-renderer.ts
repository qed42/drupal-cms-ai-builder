import type { PageLayout, PageSection } from "./types";

/**
 * Friendly labels for Space DS component IDs.
 */
const COMPONENT_LABELS: Record<string, string> = {
  // Organisms
  "space_ds:space-hero-banner-style-02": "Hero Banner",
  "space_ds:space-hero-banner-with-media": "Hero Banner (Media)",
  "space_ds:space-detail-page-hero-banner": "Detail Page Hero",
  "space_ds:space-video-banner": "Video Banner",
  "space_ds:space-cta-banner-type-1": "Call to Action",
  "space_ds:space-accordion": "Accordion / FAQ",
  "space_ds:space-slider": "Slider",
  // Molecules
  "space_ds:space-section-heading": "Section Heading",
  "space_ds:space-testimony-card": "Testimonial",
  "space_ds:space-stats-kpi": "Statistics / KPIs",
  "space_ds:space-user-card": "User Card",
  "space_ds:space-imagecard": "Image Card",
  "space_ds:space-dark-bg-imagecard": "Dark Image Card",
  "space_ds:space-contact-card": "Contact Card",
  "space_ds:space-content-detail": "Content Detail",
  "space_ds:space-logo-section": "Logo Section",
  "space_ds:space-videocard": "Video Card",
  "space_ds:space-accordion-item": "Accordion Item",
  "space_ds:space-breadcrumb": "Breadcrumb",
  // Atoms
  "space_ds:space-heading": "Heading",
  "space_ds:space-text": "Text",
  "space_ds:space-button": "Button",
  "space_ds:space-image": "Image",
  "space_ds:space-icon": "Icon",
  "space_ds:space-link": "Link",
  "space_ds:space-input-submit": "Input Submit",
  // Layout
  "space_ds:space-container": "Container",
  "space_ds:space-flexi": "Flexi Layout",
  "space_ds:space-pagination": "Pagination",
  // Global
  "space_ds:space-header": "Header",
  "space_ds:space-footer": "Footer",
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
