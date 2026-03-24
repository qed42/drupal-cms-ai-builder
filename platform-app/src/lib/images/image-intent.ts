/**
 * Extract image search intents from generated sections.
 * Maps component types + section content → stock image search queries.
 * TASK-280c: Image Intent Extraction
 */

import type { PageSection, PageLayout } from "@/lib/blueprint/types";
import { getDefaultAdapter } from "@/lib/design-systems/setup";

export interface ImageIntent {
  /** Index of the page in the pages array */
  pageIndex: number;
  /** Index of the section within the page */
  sectionIndex: number;
  /** Index of the child within a composed section (undefined for top-level) */
  childIndex?: number;
  /** The prop name to inject the image into (e.g., "image", "background_image", "image_1") */
  propName: string;
  /** Search query for stock image API */
  query: string;
  /** Recommended orientation */
  orientation: "landscape" | "portrait" | "square";
  /** Recommended dimensions */
  targetWidth: number;
  targetHeight: number;
}

/**
 * Extract image intents from all pages in a blueprint.
 * Analyzes each section's component type and text content to generate
 * contextually relevant search queries. Also scans section children
 * (composed sections) for image-capable components like cards.
 */
export function extractImageIntents(
  pages: PageLayout[],
  industry: string,
  audience: string
): ImageIntent[] {
  const intents: ImageIntent[] = [];
  const adapter = getDefaultAdapter();

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx];

    for (let secIdx = 0; secIdx < page.sections.length; secIdx++) {
      const section = page.sections[secIdx];

      // Top-level section image props
      const mapping = adapter.getImageMapping(section.component_id);
      if (mapping) {
        for (const propName of mapping.props) {
          if (section.props[propName]) continue;

          const query = buildSearchQuery(section, page, industry, audience);
          intents.push({
            pageIndex: pageIdx,
            sectionIndex: secIdx,
            propName,
            query,
            orientation: mapping.orientation,
            targetWidth: mapping.dimensions.width,
            targetHeight: mapping.dimensions.height,
          });
        }
      }

      // Children in composed sections (e.g., cards in a grid)
      if (section.children) {
        for (let childIdx = 0; childIdx < section.children.length; childIdx++) {
          const child = section.children[childIdx];
          const childMapping = adapter.getImageMapping(child.component_id);
          if (!childMapping) continue;

          for (const propName of childMapping.props) {
            if (child.props[propName]) continue;

            const query = buildSearchQuery(section, page, industry, audience);
            intents.push({
              pageIndex: pageIdx,
              sectionIndex: secIdx,
              childIndex: childIdx,
              propName,
              query,
              orientation: childMapping.orientation,
              targetWidth: childMapping.dimensions.width,
              targetHeight: childMapping.dimensions.height,
            });
          }
        }
      }
    }
  }

  return intents;
}

/**
 * Build a search query from section content, page context, and business info.
 */
export function buildSearchQuery(
  section: PageSection,
  page: PageLayout,
  industry: string,
  audience: string
): string {
  const props = section.props;
  const componentId = section.component_id;

  // Extract text content from props for contextual search
  const textParts: string[] = [];

  if (typeof props.title === "string" && props.title) {
    textParts.push(props.title);
  }
  if (typeof props.sub_headline === "string" && props.sub_headline) {
    textParts.push(props.sub_headline);
  }
  if (typeof props.heading === "string" && props.heading) {
    textParts.push(props.heading);
  }

  // Page-level context
  const pageContext = page.title.toLowerCase();

  // Component-type hints
  const typeHint = getComponentTypeHint(componentId);

  // Combine: industry + content context + type hint
  // Keep query concise (Pexels works best with 2-4 word queries)
  if (textParts.length > 0) {
    // Use the most descriptive text + industry
    const contentSnippet = textParts[0].split(/\s+/).slice(0, 4).join(" ");
    return `${industry} ${contentSnippet}`.trim();
  }

  // Fallback: industry + page context + type hint
  return `${industry} ${pageContext} ${typeHint}`.trim();
}

export function getComponentTypeHint(componentId: string): string {
  if (componentId.includes("hero")) return "professional";
  if (componentId.includes("user-card") || componentId.includes("testimon")) return "portrait person";
  if (componentId.includes("cta")) return "business";
  if (componentId.includes("image") || componentId.includes("video")) return "";
  return "";
}
