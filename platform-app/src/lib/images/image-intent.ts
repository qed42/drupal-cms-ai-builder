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
 * contextually relevant search queries.
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
      const mapping = adapter.getImageMapping(section.component_id);

      if (!mapping) continue;

      for (const propName of mapping.props) {
        // Skip if the section already has an image for this prop
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
  }

  return intents;
}

/**
 * Build a search query from section content, page context, and business info.
 */
function buildSearchQuery(
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

function getComponentTypeHint(componentId: string): string {
  if (componentId.includes("hero")) return "professional";
  if (componentId.includes("user-card") || componentId.includes("testimon")) return "portrait person";
  if (componentId.includes("cta")) return "business";
  if (componentId.includes("image") || componentId.includes("video")) return "";
  return "";
}
