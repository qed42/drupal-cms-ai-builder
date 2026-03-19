/**
 * Product brand constants.
 * Single source of truth for product identity across the platform app.
 */

export const BRAND = {
  name: "Space AI",
  tagline: "AI-powered website builder",
  description: "Build professional Drupal websites with AI-powered design and content generation.",
  url: "https://spaceai.dev",
} as const;

/**
 * Brand color palette (teal family).
 * Maps to Tailwind classes: brand-{shade}
 * Defined in globals.css @theme block.
 */
export const BRAND_COLORS = {
  50: "#f0fdfa",
  100: "#ccfbf1",
  200: "#99f6e4",
  300: "#5eead4",
  400: "#2dd4bf",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
  800: "#115e59",
  900: "#134e4a",
  950: "#042f2e",
} as const;

/**
 * Dark background gradient tokens (neutral slate, no purple tint).
 */
export const BG_GRADIENT = {
  from: "#0f172a",
  via: "#1e293b",
  to: "#0f172a",
} as const;
