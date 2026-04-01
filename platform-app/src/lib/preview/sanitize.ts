/**
 * TASK-519: JSX sanitization and security utilities.
 *
 * Pre-rendering defense-in-depth layer that strips dangerous patterns
 * from AI-generated JSX before it enters the sandboxed preview iframe.
 */

import { ALLOWED_MESSAGE_TYPES, type PostMessageType } from "./types";

// ---------------------------------------------------------------------------
// Dangerous patterns — each regex targets a specific threat vector
// ---------------------------------------------------------------------------

const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Code execution
  { pattern: /\beval\s*\(/g, label: "eval" },
  { pattern: /\bFunction\s*\(/g, label: "Function constructor" },
  { pattern: /\bsetTimeout\s*\(\s*["'`]/g, label: "setTimeout with string" },
  { pattern: /\bsetInterval\s*\(\s*["'`]/g, label: "setInterval with string" },

  // Network access
  { pattern: /\bfetch\s*\(/g, label: "fetch" },
  { pattern: /\bXMLHttpRequest/g, label: "XMLHttpRequest" },
  { pattern: /\bnew\s+WebSocket/g, label: "WebSocket" },
  { pattern: /\bnavigator\.sendBeacon/g, label: "sendBeacon" },

  // Dynamic imports
  { pattern: /\bimport\s*\(/g, label: "dynamic import" },
  { pattern: /\brequire\s*\(/g, label: "require" },

  // Storage access
  { pattern: /\bdocument\.cookie/g, label: "cookie access" },
  { pattern: /\blocalStorage/g, label: "localStorage" },
  { pattern: /\bsessionStorage/g, label: "sessionStorage" },
  { pattern: /\bindexedDB/g, label: "indexedDB" },

  // Parent frame access
  { pattern: /\bwindow\.parent/g, label: "parent frame" },
  { pattern: /\bwindow\.top/g, label: "top frame" },
  { pattern: /\bparent\.postMessage/g, label: "parent messaging" },
  { pattern: /\bwindow\.opener/g, label: "opener access" },

  // DOM-level injection vectors
  { pattern: /\bdocument\.writeln?\s*\(/g, label: "dom injection" },
  { pattern: /\bdocument\.createElement\s*\(\s*["'`]script/g, label: "script injection" },
];

/**
 * Sanitize JSX by neutralizing dangerous patterns.
 *
 * This is defense-in-depth — the Code Component Validator (M26) already blocks
 * these patterns during generation, but this catches anything that slips through.
 *
 * Safe JSX passes through unmodified.
 */
export function sanitizeJsx(jsx: string): string {
  let result = jsx;
  for (const { pattern } of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, "/* blocked */");
  }
  return result;
}

/**
 * Check if a postMessage type is in the allowed whitelist.
 */
export function isPostMessageAllowed(type: string): boolean {
  return ALLOWED_MESSAGE_TYPES.has(type as PostMessageType);
}

/**
 * Validate postMessage origin.
 *
 * For srcdoc iframes (sandbox without allow-same-origin), the origin is "null"
 * (the string "null", not the null value). We also accept the expected app origin
 * for development flexibility.
 */
export function validatePostMessageOrigin(origin: string, expectedOrigin?: string): boolean {
  if (origin === "null") return true;
  if (expectedOrigin && origin === expectedOrigin) return true;
  return false;
}

/**
 * CSP meta tag content matching the architecture specification (section 5.3).
 *
 * Allows: inline scripts, Tailwind CDN, Google Fonts, images from anywhere.
 * Blocks: all network connections (fetch/XHR/WebSocket).
 */
export const CSP_META_TAG = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data: blob:; connect-src 'none';`;

/**
 * Escape HTML entities in a string to prevent script injection via serialized data.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
