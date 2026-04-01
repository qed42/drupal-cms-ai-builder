import type { z } from "zod";

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
  phase?: "research" | "plan" | "generate" | "hydrate";
}

export interface AIProvider {
  readonly name: string;

  /**
   * Generate a structured JSON response validated against a Zod schema.
   * The provider should use its native structured output mechanism
   * (OpenAI: response_format json_schema, Anthropic: tool use).
   */
  generateJSON<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: GenerateOptions
  ): Promise<T>;

  /**
   * Generate a plain text response.
   */
  generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string>;
}

/**
 * Base delay (ms) and max retries for exponential backoff on rate limits.
 */
export const RATE_LIMIT_BASE_DELAY_MS = 1000;
export const RATE_LIMIT_MAX_RETRIES = 3;

/**
 * Sleep with exponential backoff and jitter.
 */
export async function backoffDelay(attempt: number): Promise<void> {
  const delay = RATE_LIMIT_BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * delay * 0.5;
  await new Promise((resolve) => setTimeout(resolve, delay + jitter));
}

/**
 * Check if an error is a rate limit (HTTP 429) error.
 */
export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const status = (error as { status?: number }).status;
    if (status === 429) return true;
    const code = (error as { code?: string }).code;
    if (code === "rate_limit_exceeded") return true;
  }
  return false;
}

/**
 * Check if an error is retryable (rate limit, server error, timeout).
 */
export function isRetryableError(error: unknown): boolean {
  if (isRateLimitError(error)) return true;
  if (error && typeof error === "object") {
    const status = (error as { status?: number }).status;
    if (status && status >= 500 && status < 600) return true;
    const code = (error as { code?: string }).code;
    if (code === "ETIMEDOUT" || code === "ECONNRESET") return true;
  }
  return false;
}
