/**
 * AI-powered image analysis service using Claude Vision.
 * TASK-435: Image Description Service
 *
 * Analyzes user-uploaded images to produce marketing-aware descriptions,
 * semantic tags, dominant colors, subject classification, and orientation.
 * Used by the image matching engine to place user photos in blueprint sections.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z, toJSONSchema } from "zod";
import fs from "fs";
import path from "path";
import { Vibrant } from "node-vibrant/node";

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

// ── Zod schema for structured Claude output ────────────────────────

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

type VisionResponse = z.infer<typeof visionResponseSchema>;

// ── Anthropic client singleton ─────────────────────────────────────

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

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

const VISION_MODEL = "claude-sonnet-4-20250514";

/**
 * Analyze an uploaded image using Claude Vision and node-vibrant.
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

  // Run Claude Vision and color extraction in parallel
  const [visionResult, vibrantColors] = await Promise.all([
    analyzeWithVision(base64Image, mediaType, businessContext),
    extractDominantColors(imagePath),
  ]);

  // Prefer node-vibrant colors (algorithmic accuracy) over Claude's visual estimate.
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

// ── Claude Vision call ─────────────────────────────────────────────

async function analyzeWithVision(
  base64Image: string,
  mediaType: ImageMediaType,
  ctx: BusinessContext
): Promise<VisionResponse> {
  const prompt = buildPrompt(ctx);
  const jsonSchema = zodToAnthropicSchema(visionResponseSchema);

  const response = await getClient().messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    temperature: 0.3,
    tools: [
      {
        name: "image_analysis",
        description:
          "Return the image analysis as structured JSON matching the provided schema.",
        input_schema: jsonSchema,
      },
    ],
    tool_choice: { type: "tool", name: "image_analysis" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error(
      "[image-description] Claude Vision did not return a tool use response"
    );
  }

  return visionResponseSchema.parse(toolBlock.input);
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

// ── Schema conversion helper ───────────────────────────────────────

/**
 * Convert a Zod schema to Anthropic tool input_schema format.
 * Uses zod's toJSONSchema for the conversion.
 */
function zodToAnthropicSchema(
  schema: z.ZodType
): Anthropic.Tool["input_schema"] {
  return toJSONSchema(schema) as Anthropic.Tool["input_schema"];
}
