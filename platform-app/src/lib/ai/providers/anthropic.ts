import Anthropic from "@anthropic-ai/sdk";
import { type z, toJSONSchema } from "zod";
import type { GenerateOptions, VisionInput } from "../provider";
import {
  type AIProvider,
  backoffDelay,
  isRetryableError,
  RATE_LIMIT_MAX_RETRIES,
} from "../provider";
import { resolveModel } from "../factory";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";

  async generateJSON<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;
    const jsonSchema = toJSONSchema(schema);

    return this.withRetry(async () => {
      const response = await getClient().messages.create({
        model,
        max_tokens: options?.maxTokens ?? 4000,
        temperature: options?.temperature ?? 0.3,
        tools: [
          {
            name: "structured_output",
            description:
              "Return the response as structured JSON matching the provided schema.",
            input_schema: jsonSchema as Anthropic.Tool["input_schema"],
          },
        ],
        tool_choice: { type: "tool", name: "structured_output" },
        messages: [{ role: "user", content: prompt }],
      });

      // Extract tool use result from response
      const toolBlock = response.content.find(
        (block) => block.type === "tool_use"
      );

      if (!toolBlock || toolBlock.type !== "tool_use") {
        throw new Error("Anthropic did not return a tool use response");
      }

      return schema.parse(toolBlock.input);
    }, options?.retries);
  }

  async generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;

    return this.withRetry(async () => {
      const response = await getClient().messages.create({
        model,
        max_tokens: options?.maxTokens ?? 4000,
        temperature: options?.temperature ?? 0.7,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find(
        (block) => block.type === "text"
      );

      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Anthropic did not return a text response");
      }

      return textBlock.text;
    }, options?.retries);
  }

  async generateVisionJSON<T>(
    image: VisionInput,
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;
    const jsonSchema = toJSONSchema(schema);

    return this.withRetry(async () => {
      const response = await getClient().messages.create({
        model,
        max_tokens: options?.maxTokens ?? 1024,
        temperature: options?.temperature ?? 0.3,
        tools: [
          {
            name: "structured_output",
            description:
              "Return the response as structured JSON matching the provided schema.",
            input_schema: jsonSchema as Anthropic.Tool["input_schema"],
          },
        ],
        tool_choice: { type: "tool", name: "structured_output" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: image.mediaType,
                  data: image.base64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });

      const toolBlock = response.content.find(
        (block) => block.type === "tool_use"
      );

      if (!toolBlock || toolBlock.type !== "tool_use") {
        throw new Error("Anthropic Vision did not return a tool use response");
      }

      return schema.parse(toolBlock.input);
    }, options?.retries);
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? RATE_LIMIT_MAX_RETRIES;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < retries && isRetryableError(error)) {
          console.warn(
            `[anthropic] Retryable error (attempt ${attempt + 1}/${retries}):`,
            error instanceof Error ? error.message : error
          );
          await backoffDelay(attempt);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}
