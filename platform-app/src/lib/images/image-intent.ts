/**
 * Extract image search intents from generated sections.
 * Maps component types + section content → stock image search queries.
 * TASK-280c: Image Intent Extraction
 */

import type { PageSection, PageLayout } from "@/lib/blueprint/types";

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
 * Component ID → image prop mappings.
 * Only components that benefit from stock photos (not icons/SVGs).
 */
const IMAGE_PROP_MAP: Record<string, { props: string[]; orientation: "landscape" | "portrait" | "square"; width: number; height: number }> = {
  // Hero banners
  "space_ds:space-hero-banner-style-01": { props: ["background_image"], orientation: "landscape", width: 1920, height: 1080 },
  "space_ds:space-hero-banner-style-02": { props: ["background_image"], orientation: "landscape", width: 1920, height: 1080 },
  "space_ds:space-hero-banner-style-03": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-04": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-05": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-06": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-07": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-08": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-10": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },
  "space_ds:space-hero-banner-style-11": { props: ["image_1"], orientation: "landscape", width: 1200, height: 800 },

  // Text-media sections
  "space_ds:space-text-media-default": { props: ["image_1"], orientation: "landscape", width: 800, height: 600 },
  "space_ds:space-text-media-with-checklist": { props: ["image_1"], orientation: "landscape", width: 800, height: 600 },
  "space_ds:space-text-media-with-images": { props: ["image_1"], orientation: "landscape", width: 800, height: 600 },
  "space_ds:space-text-media-with-link": { props: ["image_1"], orientation: "landscape", width: 800, height: 600 },
  "space_ds:space-text-media-with-stats": { props: ["image_1"], orientation: "landscape", width: 800, height: 600 },

  // Cards with images
  "space_ds:space-featured-card": { props: ["image"], orientation: "landscape", width: 600, height: 400 },
  "space_ds:space-imagecard": { props: ["image"], orientation: "landscape", width: 600, height: 400 },
  "space_ds:space-quicklink-card": { props: ["image"], orientation: "landscape", width: 600, height: 400 },
  "space_ds:space-testimony-card": { props: ["image"], orientation: "square", width: 400, height: 400 },

  // CTA banners
  "space_ds:space-cta-banner-type-2": { props: ["image"], orientation: "landscape", width: 800, height: 600 },
  "space_ds:space-cta-banner-type-3": { props: ["image"], orientation: "landscape", width: 800, height: 600 },

  // People / team sections
  "space_ds:space-people-card-people-with-image": { props: ["image"], orientation: "square", width: 400, height: 400 },
  "space_ds:space-people-card-people-with-image-bio": { props: ["image"], orientation: "square", width: 400, height: 400 },
  "space_ds:space-people-card-testimony-with-image": { props: ["image"], orientation: "square", width: 400, height: 400 },
  "space_ds:space-people-card-people-with-avatar": { props: ["image"], orientation: "square", width: 400, height: 400 },
  "space_ds:space-people-card-people-with-avatar-bio": { props: ["image"], orientation: "square", width: 400, height: 400 },
  "space_ds:space-people-card-testimony-with-avatar": { props: ["image"], orientation: "square", width: 400, height: 400 },

  // Accordion with image
  "space_ds:space-accordion-with-image-item": { props: ["image"], orientation: "landscape", width: 600, height: 400 },
  "space_ds:space-accordion-with-image-variation-4-image": { props: ["image"], orientation: "landscape", width: 600, height: 400 },
};

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

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx];

    for (let secIdx = 0; secIdx < page.sections.length; secIdx++) {
      const section = page.sections[secIdx];
      const mapping = IMAGE_PROP_MAP[section.component_id];

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
          targetWidth: mapping.width,
          targetHeight: mapping.height,
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
  if (componentId.includes("hero-banner")) return "professional";
  if (componentId.includes("people-card") || componentId.includes("testimony")) return "portrait person";
  if (componentId.includes("text-media")) return "office workspace";
  if (componentId.includes("cta-banner")) return "business";
  if (componentId.includes("featured-card") || componentId.includes("imagecard")) return "";
  if (componentId.includes("accordion")) return "";
  return "";
}
