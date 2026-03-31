/**
 * Canvas code component compilation utilities.
 *
 * Mirrors the Canvas module's own compilation pipeline:
 * - JS: SWC (WASM) transforms JSX → ES2015 (same options as Canvas CLI)
 * - CSS: passed through as-is (our AI-generated CSS is simple and valid)
 *
 * Note: Canvas CLI uses Lightning CSS for CSS transformation, but that package
 * requires platform-specific native binaries (e.g., linux-arm64-musl for Alpine).
 * Since our AI-generated component CSS doesn't use nesting or modern syntax that
 * needs transformation, we pass it through directly. Canvas's client-side runtime
 * handles any remaining CSS processing.
 *
 * References:
 * - canvas/packages/cli/src/lib/compile-js.ts
 */

import { transformSync } from "@swc/wasm";

import type { Options as SwcOptions } from "@swc/wasm";

/**
 * SWC options — identical to Canvas CLI's compile-js.ts
 * @see canvas/packages/cli/src/lib/compile-js.ts
 */
const SWC_OPTIONS: SwcOptions = {
  jsc: {
    parser: {
      syntax: "ecmascript",
      jsx: true,
    },
    target: "es2015",
    transform: {
      react: {
        pragmaFrag: "Fragment",
        throwIfNamespace: true,
        development: false,
        runtime: "automatic",
      },
    },
  },
  module: {
    type: "es6",
  },
} as const;

/**
 * Compile JSX source code to ES2015 JavaScript.
 * Uses SWC with the same options as Canvas's browser editor and CLI tool.
 */
export function compileComponentJs(source: string): string {
  const { code } = transformSync(source, SWC_OPTIONS);
  return code;
}

/**
 * "Compile" component CSS. Our AI-generated CSS is simple (no nesting,
 * no @apply) so we pass it through as-is. Canvas stores it in css.compiled
 * and writes it to the asset file on disk.
 */
export function compileComponentCss(css: string): string {
  return css.trim();
}
