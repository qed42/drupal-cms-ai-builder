import type { AIProvider, GenerateOptions } from "./provider";

type ProviderName = "openai" | "anthropic";

const providerCache = new Map<string, AIProvider>();

/**
 * Resolve the model to use for a given phase.
 * Priority: AI_MODEL_{PHASE} > AI_MODEL > provider default.
 */
export function resolveModel(phase?: GenerateOptions["phase"]): string | undefined {
  if (phase) {
    const phaseModel = process.env[`AI_MODEL_${phase.toUpperCase()}`];
    if (phaseModel) return phaseModel;
  }
  return process.env.AI_MODEL || undefined;
}

/**
 * Get the configured provider name from environment.
 */
function getProviderName(): ProviderName {
  const name = (process.env.AI_PROVIDER || "openai").toLowerCase();
  if (name !== "openai" && name !== "anthropic") {
    throw new Error(
      `Unknown AI_PROVIDER "${name}". Supported: openai, anthropic`
    );
  }
  return name as ProviderName;
}

/**
 * Factory function to get the configured AI provider.
 * Caches provider instances by name for reuse.
 */
export async function getAIProvider(
  phase?: GenerateOptions["phase"]
): Promise<AIProvider> {
  const name = getProviderName();
  const cacheKey = name;

  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey)!;
  }

  let provider: AIProvider;

  switch (name) {
    case "openai": {
      const { OpenAIProvider } = await import("./providers/openai");
      provider = new OpenAIProvider();
      break;
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./providers/anthropic");
      provider = new AnthropicProvider();
      break;
    }
  }

  providerCache.set(cacheKey, provider);
  return provider;
}

/**
 * Clear the provider cache (useful for testing).
 */
export function clearProviderCache(): void {
  providerCache.clear();
}
