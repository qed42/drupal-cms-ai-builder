import { Vibrant } from "node-vibrant/node";
import { getOpenAIClient } from "./client";
import fs from "fs";

export interface ExtractedColor {
  hex: string;
  role: string;
}

export async function extractColorsFromImage(
  filePath: string
): Promise<ExtractedColor[]> {
  try {
    const palette = await Vibrant.from(filePath).getPalette();
    const colors: ExtractedColor[] = [];

    if (palette.Vibrant) {
      colors.push({ hex: palette.Vibrant.hex, role: "primary" });
    }
    if (palette.DarkVibrant) {
      colors.push({ hex: palette.DarkVibrant.hex, role: "secondary" });
    }
    if (palette.LightVibrant) {
      colors.push({ hex: palette.LightVibrant.hex, role: "accent" });
    }
    if (palette.Muted) {
      colors.push({ hex: palette.Muted.hex, role: "muted" });
    }
    if (palette.DarkMuted) {
      colors.push({ hex: palette.DarkMuted.hex, role: "dark" });
    }
    if (palette.LightMuted) {
      colors.push({ hex: palette.LightMuted.hex, role: "light" });
    }

    return colors.length > 0
      ? colors
      : [
          { hex: "#6366F1", role: "primary" },
          { hex: "#1E1B4B", role: "secondary" },
          { hex: "#00F1C6", role: "accent" },
        ];
  } catch {
    return [
      { hex: "#6366F1", role: "primary" },
      { hex: "#1E1B4B", role: "secondary" },
      { hex: "#00F1C6", role: "accent" },
    ];
  }
}

export async function extractColorsWithVision(
  filePath: string
): Promise<ExtractedColor[]> {
  try {
    const client = getOpenAIClient();
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this image and extract the main colors used. Return a JSON object with a "colors" array, each item having "hex" (hex color code) and "role" (one of: primary, secondary, accent, muted, dark, light). Return 3-6 colors. Return ONLY valid JSON.',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    return parsed.colors || [];
  } catch {
    return extractColorsFromImage(filePath);
  }
}
