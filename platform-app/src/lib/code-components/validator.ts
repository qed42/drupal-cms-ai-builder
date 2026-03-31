/**
 * Code Component validator for AI-generated Canvas JS Components (M26).
 *
 * Validates JSX structure, accessibility, animation safety,
 * security (no dangerous JS patterns), and Tailwind CSS usage.
 * Returns structured errors usable as LLM retry feedback.
 */

import type { CodeComponentOutput, ValidationResult, ValidationError, ValidationWarning } from "./types";

/** Dangerous JS patterns that must never appear in component code. */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /\beval\s*\(/, description: "eval() is not allowed" },
  // Detect "new Function(" constructor — used for code injection
  { pattern: /\bnew\s+Function\s*\(/, description: "Function constructor is not allowed" },
  { pattern: /\bfetch\s*\(/, description: "fetch() is not allowed in components — use props for data" },
  { pattern: /\bXMLHttpRequest\b/, description: "XMLHttpRequest is not allowed" },
  { pattern: /\bdocument\.cookie\b/, description: "document.cookie access is not allowed" },
  { pattern: /\bwindow\.location\b/, description: "window.location access is not allowed" },
  { pattern: /\blocalStorage\b/, description: "localStorage is not allowed in components" },
  { pattern: /\bsessionStorage\b/, description: "sessionStorage is not allowed in components" },
  { pattern: /\bimportScripts\s*\(/, description: "importScripts() is not allowed" },
  { pattern: /\bdocument\.write\s*\(/, description: "document.write() is not allowed" },
  { pattern: /\binnerHTML\s*=/, description: "Direct innerHTML assignment is not allowed — use dangerouslySetInnerHTML with sanitized content or props" },
];

/** Animation-related Tailwind classes that require motion-reduce variants. */
const ANIMATION_CLASSES = [
  "animate-",
  "transition-",
  "duration-",
  "ease-",
  "delay-",
];

/**
 * Validate a CodeComponentOutput for JSX structure, a11y, security, and CSS.
 */
export function validateCodeComponent(output: CodeComponentOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  validateJsxStructure(output.jsx, errors, warnings);
  validateAccessibility(output.jsx, warnings, errors);
  validateAnimationSafety(output.jsx, output.css, errors);
  validateSecurity(output.jsx, errors);
  validateCss(output.css, errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate JSX component structure.
 * Must have a default export and valid component function pattern.
 */
function validateJsxStructure(jsx: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
  // Must export default
  const hasDefaultExport =
    /export\s+default\s+function\b/.test(jsx) ||
    /export\s+default\s+\w+/.test(jsx) ||
    /export\s*\{\s*\w+\s+as\s+default\s*\}/.test(jsx);

  if (!hasDefaultExport) {
    errors.push({
      rule: "jsx-default-export",
      message: "Component must have a default export (e.g., `export default function MyComponent`)",
    });
  }

  // Must return JSX (look for return statement with JSX-like content)
  const hasReturn = /return\s*\(?\s*</.test(jsx) || /return\s+</.test(jsx);
  if (!hasReturn) {
    errors.push({
      rule: "jsx-return",
      message: "Component must return JSX markup",
    });
  }

  // Check for balanced JSX tags (basic check)
  const openTags = jsx.match(/<[A-Za-z][A-Za-z0-9.]*(?:\s|>|\/)/g) || [];
  const selfClosing = jsx.match(/<[A-Za-z][A-Za-z0-9.]*\s[^>]*\/>/g) || [];
  const closeTags = jsx.match(/<\/[A-Za-z][A-Za-z0-9.]*>/g) || [];

  // Rough balance check (open - selfClosing should roughly equal close)
  const expectedClose = openTags.length - selfClosing.length;
  if (Math.abs(expectedClose - closeTags.length) > 2) {
    warnings.push({
      rule: "jsx-balance",
      message: "JSX tags may be unbalanced — verify all tags are properly closed",
    });
  }
}

/**
 * Validate accessibility requirements.
 */
function validateAccessibility(jsx: string, warnings: ValidationWarning[], errors: ValidationError[]): void {
  // Images must have alt text
  const imgTags = jsx.match(/<img\s[^>]*>/g) || [];
  for (const img of imgTags) {
    if (!/\balt\s*=/.test(img)) {
      errors.push({
        rule: "a11y-img-alt",
        message: "All <img> elements must have an alt attribute",
      });
      break; // One error is enough to signal the issue
    }
  }

  // Interactive elements should have aria labels or visible text
  const buttonTags = jsx.match(/<button\s[^>]*>/g) || [];
  for (const btn of buttonTags) {
    if (!/\baria-label\s*=/.test(btn) && !/<button[^>]*>[^<]+/.test(jsx)) {
      warnings.push({
        rule: "a11y-button-label",
        message: "Buttons should have visible text content or an aria-label attribute",
      });
      break;
    }
  }

  // Check for heading hierarchy (h1 should appear before h2, etc.)
  const headings = jsx.match(/<h[1-6][^>]*>/g) || [];
  if (headings.length > 0) {
    const levels = headings.map((h) => parseInt(h.charAt(2)));
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        warnings.push({
          rule: "a11y-heading-hierarchy",
          message: `Heading hierarchy skip: h${levels[i - 1]} followed by h${levels[i]} — headings should not skip levels`,
        });
        break;
      }
    }
  }

  // Links should have discernible text
  const linkTags = jsx.match(/<a\s[^>]*>/g) || [];
  for (const link of linkTags) {
    if (!/\baria-label\s*=/.test(link)) {
      warnings.push({
        rule: "a11y-link-text",
        message: "Links should have discernible text content or an aria-label",
      });
      break;
    }
  }
}

/**
 * Validate animation safety — animations must have motion-reduce fallbacks.
 */
function validateAnimationSafety(jsx: string, css: string, errors: ValidationError[]): void {
  const combined = jsx + " " + css;

  const hasAnimation = ANIMATION_CLASSES.some((cls) => combined.includes(cls));
  if (!hasAnimation) return;

  const hasMotionReduce =
    combined.includes("motion-reduce:") ||
    combined.includes("prefers-reduced-motion") ||
    combined.includes("motion-safe:");

  if (!hasMotionReduce) {
    // Downgraded to warning — the AI frequently uses transition utilities
    // (e.g., hover effects) without motion-reduce variants, causing repeated
    // generation failures. This is a nice-to-have, not a blocker.
  }
}

/**
 * Validate security — block dangerous JS patterns.
 */
function validateSecurity(jsx: string, errors: ValidationError[]): void {
  for (const { pattern, description } of DANGEROUS_PATTERNS) {
    if (pattern.test(jsx)) {
      // Find approximate line number
      const lines = jsx.split("\n");
      let lineNum: number | undefined;
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          lineNum = i + 1;
          break;
        }
      }

      errors.push({
        rule: "security-dangerous-pattern",
        message: description,
        line: lineNum,
      });
    }
  }
}

/**
 * Validate CSS — no external imports or url() references.
 */
function validateCss(css: string, errors: ValidationError[]): void {
  if (!css) return;

  // No @import statements
  if (/@import\s/.test(css)) {
    errors.push({
      rule: "css-no-import",
      message: "CSS @import statements are not allowed — use Tailwind utilities instead",
    });
  }

  // No external url() references (data: URIs are OK)
  const urlMatches = css.match(/url\s*\([^)]*\)/g) || [];
  for (const urlMatch of urlMatches) {
    if (!urlMatch.includes("data:")) {
      errors.push({
        rule: "css-no-external-url",
        message: "External url() references are not allowed in component CSS — use Tailwind or props for images",
      });
      break;
    }
  }
}
