import type { PageLayout, PageSection } from "./types";
import { getDefaultAdapter } from "@/lib/design-systems/setup";

export function getComponentLabel(componentId: string): string {
  return getDefaultAdapter().getLabel(componentId);
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
