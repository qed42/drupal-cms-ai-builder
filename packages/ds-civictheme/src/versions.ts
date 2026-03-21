/**
 * Canvas component version map for CivicTheme.
 *
 * All hashes set to "0000000000000000" — the BlueprintImportService resolves
 * actual versions from the Drupal Canvas component registry at import time.
 */
export const COMPONENT_VERSIONS: Record<string, string> = {
  // Atoms
  "sdc.civictheme.heading": "0000000000000000",
  "sdc.civictheme.paragraph": "0000000000000000",
  "sdc.civictheme.button": "0000000000000000",
  "sdc.civictheme.content-link": "0000000000000000",
  "sdc.civictheme.tag": "0000000000000000",
  "sdc.civictheme.chip": "0000000000000000",
  "sdc.civictheme.icon": "0000000000000000",
  "sdc.civictheme.quote": "0000000000000000",
  "sdc.civictheme.table": "0000000000000000",

  // Molecules
  "sdc.civictheme.accordion": "0000000000000000",
  "sdc.civictheme.accordion-panel": "0000000000000000",
  "sdc.civictheme.breadcrumb": "0000000000000000",
  "sdc.civictheme.callout": "0000000000000000",
  "sdc.civictheme.figure": "0000000000000000",
  "sdc.civictheme.navigation-card": "0000000000000000",
  "sdc.civictheme.promo-card": "0000000000000000",
  "sdc.civictheme.event-card": "0000000000000000",
  "sdc.civictheme.publication-card": "0000000000000000",
  "sdc.civictheme.service-card": "0000000000000000",
  "sdc.civictheme.subject-card": "0000000000000000",
  "sdc.civictheme.price-card": "0000000000000000",
  "sdc.civictheme.snippet": "0000000000000000",
  "sdc.civictheme.tabs": "0000000000000000",
  "sdc.civictheme.tooltip": "0000000000000000",

  // Organisms
  "sdc.civictheme.banner": "0000000000000000",
  "sdc.civictheme.campaign": "0000000000000000",
  "sdc.civictheme.promo": "0000000000000000",
  "sdc.civictheme.carousel": "0000000000000000",
  "sdc.civictheme.slider": "0000000000000000",
  "sdc.civictheme.list": "0000000000000000",
  "sdc.civictheme.social-links": "0000000000000000",
  "sdc.civictheme.header": "0000000000000000",
  "sdc.civictheme.footer": "0000000000000000",
};

/**
 * Convert an SDC component ID (e.g. "civictheme:banner")
 * to a Canvas component ID (e.g. "sdc.civictheme.banner").
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
