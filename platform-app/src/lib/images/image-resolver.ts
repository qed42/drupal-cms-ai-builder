/**
 * Resolve stock images for a page's sections before component tree building.
 * Fetches from Pexels and injects Canvas-compatible image objects into
 * section props (and child props for composed sections).
 * TASK-388: Image Resolver Service
 */

import type { PageSection, PageLayout } from "@/lib/blueprint/types";
import { getDefaultAdapter } from "@/lib/design-systems/setup";
import { buildSearchQuery } from "@/lib/images/image-intent";
import { searchStockImage } from "@/lib/images/stock-image-service";
import { downloadStockImage } from "@/lib/images/image-downloader";

interface CanvasImageObject {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Resolve stock images for all sections in a page.
 * Mutates section.props (and section.children[].props) in place with
 * Canvas-compatible image objects. Failures are non-fatal — sections
 * without images fall back to placeholders in tree-builders.
 */
export async function resolveImagesForSections(
  siteId: string,
  sections: PageSection[],
  pageTitle: string,
  industry: string,
  audience: string
): Promise<{ imagesAdded: number; imagesFailed: number; queriesBySection: Map<number, string> }> {
  const adapter = getDefaultAdapter();
  let imagesAdded = 0;
  let imagesFailed = 0;
  const queriesBySection = new Map<number, string>();

  // Build a minimal PageLayout for buildSearchQuery context
  const pageContext: PageLayout = {
    slug: pageTitle.toLowerCase().replace(/\s+/g, "-"),
    title: pageTitle,
    seo: { meta_title: pageTitle, meta_description: "" },
    sections,
  };

  for (let secIdx = 0; secIdx < sections.length; secIdx++) {
    const section = sections[secIdx];
    // Top-level section image props
    const mapping = adapter.getImageMapping(section.component_id);
    if (mapping) {
      for (const propName of mapping.props) {
        if (isImagePopulated(section.props[propName])) continue;

        const query = buildSearchQuery(section, pageContext, industry, audience);
        const result = await fetchAndDownload(
          siteId,
          query,
          mapping.orientation,
          mapping.dimensions.width,
          mapping.dimensions.height
        );

        if (result) {
          section.props[propName] = result;
          // Store the image query in section _meta (TASK-411)
          if (!section._meta) section._meta = {};
          section._meta.imageQuery = query;
          queriesBySection.set(secIdx, query);
          imagesAdded++;
        } else {
          imagesFailed++;
        }
      }
    }

    // Children in composed sections (e.g., cards in a grid)
    if (section.children) {
      for (const child of section.children) {
        const childMapping = adapter.getImageMapping(child.component_id);
        if (!childMapping) continue;

        for (const propName of childMapping.props) {
          if (isImagePopulated(child.props[propName])) continue;

          const query = buildSearchQuery(section, pageContext, industry, audience);
          const result = await fetchAndDownload(
            siteId,
            query,
            childMapping.orientation,
            childMapping.dimensions.width,
            childMapping.dimensions.height
          );

          if (result) {
            child.props[propName] = result;
            // Store query on parent section _meta for composed sections (TASK-411)
            if (!section._meta) section._meta = {};
            section._meta.imageQuery = query;
            queriesBySection.set(secIdx, query);
            imagesAdded++;
          } else {
            imagesFailed++;
          }
        }
      }
    }
  }

  return { imagesAdded, imagesFailed, queriesBySection };
}

/**
 * Check if an image prop is already populated with a valid object.
 */
function isImagePopulated(val: unknown): boolean {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  const obj = val as Record<string, unknown>;
  return typeof obj.src === "string" && obj.src.length > 0;
}

/**
 * Search Pexels and download the image locally.
 * Returns a Canvas-compatible image object or null on failure.
 */
async function fetchAndDownload(
  siteId: string,
  query: string,
  orientation: "landscape" | "portrait" | "square",
  width: number,
  height: number
): Promise<CanvasImageObject | null> {
  try {
    const searchResult = await searchStockImage(query, { orientation });
    if (!searchResult) return null;

    const downloaded = await downloadStockImage(
      searchResult.url,
      siteId,
      searchResult.alt,
      width,
      height
    );
    if (!downloaded) return null;

    return {
      src: downloaded.localPath,
      alt: downloaded.alt,
      width,
      height,
    };
  } catch (err) {
    console.warn(`[image-resolver] Failed for query "${query}":`, err);
    return null;
  }
}
