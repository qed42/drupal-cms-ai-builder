/**
 * Product brand constants.
 * Single source of truth for product identity across the platform app.
 *
 * Brand colors are defined in globals.css @theme inline block (indigo scale).
 * Use Tailwind classes: brand-{50..950}, accent-{50..950}.
 * Semantic status colors: success, warning, error, info.
 */

export const BRAND = {
  name: "Space AI",
  tagline: "AI-powered website builder",
  description: "Build professional Drupal websites with AI-powered design and content generation.",
  url: "https://spaceai.dev",
} as const;
