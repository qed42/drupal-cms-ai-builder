/**
 * Resolve images for a page's sections before component tree building.
 * Prioritizes user-uploaded images over Pexels stock photos when available.
 * TASK-388: Image Resolver Service
 * TASK-441: User image priority
 */

import type { PageSection, PageSectionChild, PageLayout } from "@/lib/blueprint/types";
import { getDefaultAdapter } from "@/lib/design-systems/setup";
import { buildSearchQuery } from "@/lib/images/image-intent";
import { searchStockImage } from "@/lib/images/stock-image-service";
import { downloadStockImage } from "@/lib/images/image-downloader";
import { rankImages } from "@/lib/images/image-matcher";
import type { UserImage } from "@/lib/images/image-matcher";
import type { ImageOrientation } from "@/lib/images/image-description-service";

interface CanvasImageObject {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface FetchResult {
  image: CanvasImageObject;
  photoId: string;
}

/** Minimum score for a user image to be used instead of stock. */
const MATCH_THRESHOLD = 0.25;

/**
 * Resolve images for all sections in a page.
 * When userImages is provided, tries user-uploaded images first and falls back
 * to Pexels stock photos when no match exceeds the threshold.
 * Mutates section.props (and section.children[].props) in place.
 */
export async function resolveImagesForSections(
  siteId: string,
  sections: PageSection[],
  pageTitle: string,
  industry: string,
  audience: string,
  userImages?: UserImage[]
): Promise<{ imagesAdded: number; imagesFailed: number; queriesBySection: Map<number, string> }> {
  const adapter = getDefaultAdapter();
  let imagesAdded = 0;
  let imagesFailed = 0;
  const queriesBySection = new Map<number, string>();
  const usedPhotoIds = new Set<string>();
  const usedUserImageIds = new Set<string>();

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

        // Try user images first
        const userMatch = tryUserImageMatch(
          userImages,
          query,
          section.component_id,
          mapping.orientation as ImageOrientation,
          pageTitle,
          mapping.dimensions.width,
          mapping.dimensions.height,
          usedUserImageIds
        );

        if (userMatch) {
          section.props[propName] = userMatch.image;
          usedUserImageIds.add(userMatch.imageId);
          if (!section._meta) section._meta = {};
          section._meta.imageQuery = query;
          section._meta.imageSource = "user";
          section._meta.imageMatchScore = userMatch.score;
          queriesBySection.set(secIdx, query);
          imagesAdded++;
          continue;
        }

        // Pexels fallback
        const result = await fetchAndDownload(
          siteId,
          query,
          mapping.orientation,
          mapping.dimensions.width,
          mapping.dimensions.height,
          Array.from(usedPhotoIds)
        );

        if (result) {
          section.props[propName] = result.image;
          usedPhotoIds.add(result.photoId);
          if (!section._meta) section._meta = {};
          section._meta.imageQuery = query;
          section._meta.imageSource = "stock";
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

          const query = buildSearchQuery(section, pageContext, industry, audience, child);

          // Try user images first
          const userMatch = tryUserImageMatch(
            userImages,
            query,
            child.component_id,
            childMapping.orientation as ImageOrientation,
            pageTitle,
            childMapping.dimensions.width,
            childMapping.dimensions.height,
            usedUserImageIds
          );

          if (userMatch) {
            child.props[propName] = userMatch.image;
            usedUserImageIds.add(userMatch.imageId);
            if (!section._meta) section._meta = {};
            section._meta.imageQuery = query;
            section._meta.imageSource = "user";
            section._meta.imageMatchScore = userMatch.score;
            queriesBySection.set(secIdx, query);
            imagesAdded++;
            continue;
          }

          // Pexels fallback
          const result = await fetchAndDownload(
            siteId,
            query,
            childMapping.orientation,
            childMapping.dimensions.width,
            childMapping.dimensions.height,
            Array.from(usedPhotoIds)
          );

          if (result) {
            child.props[propName] = result.image;
            usedPhotoIds.add(result.photoId);
            if (!section._meta) section._meta = {};
            section._meta.imageQuery = query;
            section._meta.imageSource = "stock";
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
 * Try matching a user image to this slot. Returns the image object and metadata
 * if a match exceeds the threshold, otherwise null.
 */
function tryUserImageMatch(
  userImages: UserImage[] | undefined,
  textContent: string,
  componentType: string,
  orientation: ImageOrientation,
  pageTitle: string,
  width: number,
  height: number,
  usedUserImageIds: Set<string>
): { image: CanvasImageObject; imageId: string; score: number } | null {
  if (!userImages || userImages.length === 0) return null;

  const candidates = rankImages(
    userImages,
    { textContent, componentType, orientation, pageTitle },
    usedUserImageIds
  );

  const best = candidates[0];
  if (!best || best.score < MATCH_THRESHOLD) return null;

  // Find the matched user image to get its URL and description
  const matched = userImages.find((img) => img.id === best.imageId);
  if (!matched) return null;

  // User images are already local — use their existing upload URL
  const userImg = matched as UserImage & { url?: string; file_url?: string };
  const src = userImg.url || userImg.file_url || "";

  return {
    image: { src, alt: matched.description, width, height },
    imageId: best.imageId,
    score: best.score,
  };
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
 * Returns a Canvas-compatible image object with photoId, or null on failure.
 */
async function fetchAndDownload(
  siteId: string,
  query: string,
  orientation: "landscape" | "portrait" | "square",
  width: number,
  height: number,
  excludeIds: string[] = []
): Promise<FetchResult | null> {
  try {
    const searchResult = await searchStockImage(query, { orientation, excludeIds });
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
      image: {
        src: downloaded.localPath,
        alt: downloaded.alt,
        width,
        height,
      },
      photoId: searchResult.photoId,
    };
  } catch (err) {
    console.warn(`[image-resolver] Failed for query "${query}":`, err);
    return null;
  }
}
