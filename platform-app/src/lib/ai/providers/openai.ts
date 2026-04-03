import OpenAI from "openai";
import { type z, toJSONSchema } from "zod";
import type { GenerateOptions, VisionInput } from "../provider";
import {
  type AIProvider,
  backoffDelay,
  isRetryableError,
  RATE_LIMIT_MAX_RETRIES,
} from "../provider";
import { resolveModel } from "../factory";

const DEFAULT_MODEL = "gpt-4o-mini";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  async generateJSON<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;
    const jsonSchema = toJSONSchema(schema);

    return this.withRetry(async () => {
      const completion = await getClient().chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response",
            strict: true,
            schema: jsonSchema as Record<string, unknown>,
          },
        },
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty OpenAI response");

      const parsed = JSON.parse(content);
      return schema.parse(parsed);
    }, options?.retries);
  }

  async generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;

    return this.withRetry(async () => {
      const completion = await getClient().chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty OpenAI response");
      return content;
    }, options?.retries);
  }

  async generateVisionJSON<T>(
    image: VisionInput,
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T> {
    // Vision requires a model that supports images — gpt-4o-mini supports vision
    const model = options?.model || resolveModel(options?.phase) || DEFAULT_MODEL;
    const jsonSchema = toJSONSchema(schema);

    return this.withRetry(async () => {
      const completion = await getClient().chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.mediaType};base64,${image.base64}`,
                  detail: "low",
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response",
            strict: true,
            schema: jsonSchema as Record<string, unknown>,
          },
        },
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 1024,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty OpenAI Vision response");

      const parsed = JSON.parse(content);
      return schema.parse(parsed);
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
            `[openai] Retryable error (attempt ${attempt + 1}/${retries}):`,
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
