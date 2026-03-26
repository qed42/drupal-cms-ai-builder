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
  photoId: string;    // Pexels photo ID (for deduplication)
}

export interface StockImageSearchOptions {
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  perPage?: number;
  excludeIds?: string[];
}

// Cache stores ALL results for a query (up to perPage) for deduplication filtering
const cache = new Map<string, StockImageResult[]>();

/**
 * Search for a stock image using the Pexels API.
 * Returns the top result (excluding any IDs in excludeIds) or null if no match / API error.
 * Internally caches an array of results per query for per-page deduplication.
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

  const { orientation = "landscape", perPage = 5, excludeIds = [] } = options;
  const excludeSet = new Set(excludeIds);

  // Check cache
  const cacheKey = `${query}|${orientation}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (cached.length === 0) return null;
    const match = cached.find((r) => !excludeSet.has(r.photoId));
    return match ?? null;
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
      cache.set(cacheKey, []);
      return null;
    }

    if (!response.ok) {
      console.warn(`[stock-image] Pexels API error: ${response.status}`);
      cache.set(cacheKey, []);
      return null;
    }

    const data = await response.json();
    const photos = data.photos;

    if (!photos || photos.length === 0) {
      cache.set(cacheKey, []);
      return null;
    }

    // Parse ALL photos into results array for deduplication
    const results: StockImageResult[] = photos.map((photo: Record<string, unknown>) => ({
      url: (photo.src as Record<string, string>).large2x || (photo.src as Record<string, string>).large || (photo.src as Record<string, string>).medium,
      alt: (photo.alt as string) || query,
      width: photo.width as number,
      height: photo.height as number,
      photographerUrl: (photo.photographer_url as string) || "",
      photoId: String(photo.id),
    }));

    cache.set(cacheKey, results);

    // Filter by excludeIds and return first match
    const match = results.find((r) => !excludeSet.has(r.photoId));
    return match ?? null;
  } catch (err) {
    console.warn(`[stock-image] Pexels search failed for "${query}":`, err);
    cache.set(cacheKey, []);
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
