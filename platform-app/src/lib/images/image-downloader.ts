/**
 * Download stock images and store them locally.
 * TASK-280b: Image Downloader
 */

import { createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface DownloadedImage {
  /** Local path relative to public/ (e.g., "/uploads/stock/{siteId}/abc123.jpg") */
  localPath: string;
  /** Absolute filesystem path for provisioning copy */
  absolutePath: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Download an image from a URL and save it to the stock uploads directory.
 * Returns the local path for use in the blueprint, or null on failure.
 */
export async function downloadStockImage(
  imageUrl: string,
  siteId: string,
  alt: string,
  width: number,
  height: number
): Promise<DownloadedImage | null> {
  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[image-downloader] Failed to download ${imageUrl}: ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Generate a hash-based filename from the URL
    const hash = createHash("md5").update(imageUrl).digest("hex").slice(0, 12);
    const ext = detectExtension(response.headers.get("content-type"));
    const filename = `${hash}.${ext}`;

    // Store in public/uploads/stock/{siteId}/
    const relativeDir = `/uploads/stock/${siteId}`;
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const absolutePath = path.join(absoluteDir, filename);
    await writeFile(absolutePath, buffer);

    return {
      localPath: `${relativeDir}/${filename}`,
      absolutePath,
      alt,
      width,
      height,
    };
  } catch (err) {
    console.warn(`[image-downloader] Download failed for ${imageUrl}:`, err);
    return null;
  }
}

function detectExtension(contentType: string | null): string {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  return "jpg";
}
