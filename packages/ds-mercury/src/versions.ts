/**
 * Canvas component version map — placeholder hashes for Mercury theme.
 *
 * All set to "0000000000000000" — actual versions will be resolved from
 * the Drupal Canvas component registry at import time.
 */
export const COMPONENT_VERSIONS: Record<string, string> = {
  // Layout
  "sdc.mercury.section": "0000000000000000",
  "sdc.mercury.group": "0000000000000000",
  "sdc.mercury.accordion-container": "0000000000000000",
  "sdc.mercury.accordion": "0000000000000000",

  // Global
  "sdc.mercury.navbar": "0000000000000000",
  "sdc.mercury.footer": "0000000000000000",

  // Hero
  "sdc.mercury.hero-billboard": "0000000000000000",
  "sdc.mercury.hero-side-by-side": "0000000000000000",
  "sdc.mercury.hero-blog": "0000000000000000",

  // CTA
  "sdc.mercury.cta": "0000000000000000",

  // Cards
  "sdc.mercury.card": "0000000000000000",
  "sdc.mercury.card-icon": "0000000000000000",
  "sdc.mercury.card-logo": "0000000000000000",
  "sdc.mercury.card-pricing": "0000000000000000",
  "sdc.mercury.card-testimonial": "0000000000000000",

  // Base
  "sdc.mercury.heading": "0000000000000000",
  "sdc.mercury.text": "0000000000000000",
  "sdc.mercury.button": "0000000000000000",
  "sdc.mercury.badge": "0000000000000000",
  "sdc.mercury.blockquote": "0000000000000000",
  "sdc.mercury.image": "0000000000000000",
  "sdc.mercury.video": "0000000000000000",
  "sdc.mercury.icon": "0000000000000000",
  "sdc.mercury.anchor": "0000000000000000",
};

/**
 * Convert an SDC component ID (e.g. "mercury:hero-billboard")
 * to a Canvas component ID (e.g. "sdc.mercury.hero-billboard").
 */
export function toCanvasComponentId(sdcId: string): string {
  return `sdc.${sdcId.replace(":", ".")}`;
}

/**
 * Look up the version hash for a given SDC-format component ID.
 * Returns "0000000000000000" if the component is not found.
 */
export function getComponentVersion(sdcId: string): string {
  const canvasId = toCanvasComponentId(sdcId);
  return COMPONENT_VERSIONS[canvasId] ?? "0000000000000000";
}
