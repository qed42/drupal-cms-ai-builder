/**
 * TASK-515: Sucrase-based JSX transpilation module.
 *
 * Transpiles JSX/TSX to plain JavaScript for rendering inside
 * the sandboxed preview iframe. Includes content-hash caching.
 */

import { transform } from "sucrase";

export type TranspileResult = { code: string } | { error: string };

/** Simple string hash for cache keys. */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

/** In-memory transpilation cache keyed by content hash. */
const cache = new Map<string, string>();

/**
 * Transpile JSX (optionally with TypeScript annotations) to plain JS.
 *
 * Returns `{ code }` on success or `{ error }` on failure — never throws.
 */
export function transpileJsx(jsx: string): TranspileResult {
  const key = hashString(jsx);

  const cached = cache.get(key);
  if (cached) {
    return { code: cached };
  }

  try {
    const result = transform(jsx, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    });

    cache.set(key, result.code);
    return { code: result.code };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transpilation failed";
    return { error: message };
  }
}

/** Clear the transpilation cache (for testing). */
export function clearTranspileCache(): void {
  cache.clear();
}

/** Return current cache size (for testing). */
export function transpileCacheSize(): number {
  return cache.size;
}
