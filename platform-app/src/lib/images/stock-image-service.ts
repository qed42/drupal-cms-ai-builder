/**
 * Pexels Stock Image API client with in-memory caching and rate limiting.
 * TASK-280a: Stock Image Service
 */

export interface StockImageResult {
  url: string;        // Direct download URL (large size)
  alt: string;        // Photographer-provided alt text
  width: number;
  height: number;
  photographerUrl: string;
}

export interface StockImageSearchOptions {
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  perPage?: number;
}

const cache = new Map<string, StockImageResult | null>();

/**
 * Search for a stock image using the Pexels API.
 * Returns the top result or null if no match / API error.
 */
export async function searchStockImage(
  query: string,
  options: StockImageSearchOptions = {}
): Promise<StockImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("[stock-image] PEXELS_API_KEY not set, skipping image search");
    return null;
  }

  const { orientation = "landscape", perPage = 1 } = options;

  // Check cache
  const cacheKey = `${query}|${orientation}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }

  const params = new URLSearchParams({
    query,
    orientation,
    per_page: String(perPage),
  });

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.status === 429) {
      console.warn("[stock-image] Pexels rate limit hit, backing off");
      cache.set(cacheKey, null);
      return null;
    }

    if (!response.ok) {
      console.warn(`[stock-image] Pexels API error: ${response.status}`);
      cache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();
    const photos = data.photos;

    if (!photos || photos.length === 0) {
      cache.set(cacheKey, null);
      return null;
    }

    const photo = photos[0];
    const result: StockImageResult = {
      url: photo.src.large2x || photo.src.large || photo.src.medium,
      alt: photo.alt || query,
      width: photo.width,
      height: photo.height,
      photographerUrl: photo.photographer_url || "",
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn(`[stock-image] Pexels search failed for "${query}":`, err);
    cache.set(cacheKey, null);
    return null;
  }
}

/**
 * Clear the in-memory search cache.
 * Call at the start of a new generation to avoid stale results.
 */
export function clearImageCache(): void {
  cache.clear();
}
