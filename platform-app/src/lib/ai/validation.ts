import type { z } from "zod";
import type { AIProvider, GenerateOptions } from "./provider";

interface ZodIssue {
  path: (string | number)[];
  message: string;
}

interface ZodErrorLike {
  issues: ZodIssue[];
}

const MAX_VALIDATION_RETRIES = 2;

/**
 * Generate validated JSON from an AI provider with retry on validation failure.
 * On validation failure, retries up to `maxRetries` times, appending Zod errors
 * to the prompt so the model can self-correct.
 */
export async function generateValidatedJSON<T>(
  provider: AIProvider,
  prompt: string,
  schema: z.ZodType<T>,
  options?: GenerateOptions & { maxValidationRetries?: number }
): Promise<T> {
  const maxRetries = options?.maxValidationRetries ?? MAX_VALIDATION_RETRIES;
  let currentPrompt = prompt;
  let lastError: ZodErrorLike | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // The provider's generateJSON already does schema.parse,
      // but we wrap it to add retry-with-correction logic.
      const result = await provider.generateJSON<T>(
        currentPrompt,
        schema,
        options
      );
      return result;
    } catch (error) {
      // Check if it's a Zod validation error
      if (isZodError(error)) {
        lastError = error;
        const errorSummary = formatZodErrors(error);

        console.warn(
          `[validation] Attempt ${attempt + 1}/${maxRetries + 1} failed:`,
          errorSummary
        );

        if (attempt < maxRetries) {
          // Append validation errors to prompt for self-correction
          currentPrompt = `${prompt}\n\n--- VALIDATION ERROR (attempt ${attempt + 1}) ---\nYour previous response had the following validation errors. Please fix them:\n${errorSummary}\n\nPlease return a corrected JSON response.`;
        }
      } else {
        // Non-validation error — don't retry, just throw
        throw error;
      }
    }
  }

  throw new Error(
    `Validation failed after ${maxRetries + 1} attempts. Last errors: ${
      lastError ? formatZodErrors(lastError) : "unknown"
    }`
  );
}

function isZodError(error: unknown): error is ZodErrorLike {
  return (
    error !== null &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as ZodErrorLike).issues)
  );
}

function formatZodErrors(error: ZodErrorLike): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");
}
