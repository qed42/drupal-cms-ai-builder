/**
 * AI-powered image analysis service using the configured AI provider.
 * TASK-435: Image Description Service
 *
 * Analyzes user-uploaded images to produce marketing-aware descriptions,
 * semantic tags, dominant colors, subject classification, and orientation.
 * Used by the image matching engine to place user photos in blueprint sections.
 *
 * Supports both Claude Vision and OpenAI Vision via the AIProvider interface.
 */

import { z } from "zod";
import fs from "fs";
import path from "path";
import { Vibrant } from "node-vibrant/node";
import { getAIProvider } from "@/lib/ai/factory";
import type { VisionInput } from "@/lib/ai/provider";

// ── Types ──────────────────────────────────────────────────────────

export type ImageSubject =
  | "person"
  | "product"
  | "place"
  | "food"
  | "abstract"
  | "group";

export type ImageOrientation = "landscape" | "portrait" | "square";

export interface ImageAnalysisResult {
  description: string;
  tags: string[];
  dominant_colors: string[];
  subject: ImageSubject;
  orientation: ImageOrientation;
}

export interface BusinessContext {
  idea: string;
  industry: string;
  audience: string;
}

// ── Zod schema for structured output ──────────────────────────────

const visionResponseSchema = z.object({
  description: z
    .string()
    .describe(
      "A concise, marketing-aware description of the image content (1-2 sentences)"
    ),
  tags: z
    .array(z.string())
    .describe(
      "5-10 semantic tags relevant to website content matching — include concepts, moods, and themes, not just objects"
    ),
  subject: z
    .enum(["person", "product", "place", "food", "abstract", "group"])
    .describe("Primary subject category"),
  orientation: z
    .enum(["landscape", "portrait", "square"])
    .describe(
      "Image orientation: landscape if wider than tall, portrait if taller than wide, square if roughly equal"
    ),
});

// ── MIME detection ─────────────────────────────────────────────────

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const MIME_MAP: Record<string, ImageMediaType> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function getMimeType(filePath: string): ImageMediaType {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] ?? "image/jpeg";
}

// ── Color extraction via node-vibrant ──────────────────────────────

async function extractDominantColors(filePath: string): Promise<string[]> {
  try {
    const palette = await Vibrant.from(filePath).getPalette();
    const colors: string[] = [];

    if (palette.Vibrant) colors.push(palette.Vibrant.hex);
    if (palette.DarkVibrant) colors.push(palette.DarkVibrant.hex);
    if (palette.LightVibrant) colors.push(palette.LightVibrant.hex);

    return colors.length >= 3 ? colors.slice(0, 3) : colors;
  } catch {
    return [];
  }
}

// ── Core analysis function ─────────────────────────────────────────

/**
 * Analyze an uploaded image using the configured AI provider's vision API
 * and node-vibrant for color extraction.
 *
 * @param imagePath - Absolute path to the image file on disk.
 * @param businessContext - The user's business idea, industry, and audience
 *                          from the onboarding session.
 * @returns Analysis result with description, tags, colors, subject, and orientation.
 */
export async function analyzeImage(
  imagePath: string,
  businessContext: BusinessContext
): Promise<ImageAnalysisResult> {
  // Read image and encode as base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mediaType = getMimeType(imagePath);

  const prompt = buildPrompt(businessContext);

  const visionInput: VisionInput = {
    base64: base64Image,
    mediaType,
  };

  // Run AI vision analysis and color extraction in parallel
  const provider = await getAIProvider();
  const [visionResult, vibrantColors] = await Promise.all([
    provider.generateVisionJSON(visionInput, prompt, visionResponseSchema, {
      maxTokens: 1024,
      temperature: 0.3,
    }),
    extractDominantColors(imagePath),
  ]);

  // Prefer node-vibrant colors (algorithmic accuracy) over AI's visual estimate.
  // Fall back to empty array if both fail — the matcher doesn't require colors.
  const dominant_colors =
    vibrantColors.length > 0 ? vibrantColors : [];

  return {
    description: visionResult.description,
    tags: visionResult.tags,
    dominant_colors,
    subject: visionResult.subject,
    orientation: visionResult.orientation,
  };
}

// ── Prompt builder ─────────────────────────────────────────────────

function buildPrompt(ctx: BusinessContext): string {
  return `You are analyzing an image uploaded by a business owner building their website.

Business: ${ctx.idea}
Industry: ${ctx.industry}
Audience: ${ctx.audience}

Analyze this image and return:
1. description: A concise, marketing-aware description of the image content (1-2 sentences). Focus on how this image could be used on a ${ctx.industry} website targeting ${ctx.audience}.
2. tags: 5-10 semantic tags relevant to website content matching. Include concepts, moods, and themes — not just visible objects. Think about what page sections or components this image would complement.
3. subject: Primary subject category — one of: person, product, place, food, abstract, group.
4. orientation: Whether the image is landscape (wider than tall), portrait (taller than wide), or square (roughly equal dimensions).

Be specific and marketing-aware. "A confident healthcare professional in a modern clinic" is better than "a person in a room".`;
}
