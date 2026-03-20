// Canvas component version map — xxh64 hashes from Space DS v2 theme.
// These are fixed per theme version and extracted from the space-ds-canvas-catalog.json spike output.
//
// Space DS v2 has 31 components (down from 84 in v1). Components use slot-based
// composition: container -> flexi -> atoms in column slots.
//
// Components marked with "0000000000000000" are new in v2 and don't have
// pre-computed hashes. The BlueprintImportService resolves actual versions
// from the Drupal Canvas component registry at import time via getActiveVersion().

export const CANVAS_COMPONENT_VERSIONS: Record<string, string> = {
  // --- Layout components ---
  "sdc.space_ds.space-container": "fdd65a07b7f12175",
  "sdc.space_ds.space-flexi": "bf46256938860090",

  // --- Atom components ---
  "sdc.space_ds.space-button": "36875d428cb5585e",
  "sdc.space_ds.space-heading": "fd97cdc7a57839cb",
  "sdc.space_ds.space-icon": "0000000000000000",
  "sdc.space_ds.space-image": "d5d227b163243e93",
  "sdc.space_ds.space-input-submit": "0000000000000000",
  "sdc.space_ds.space-link": "c1ae3516a0cd6b9b",
  "sdc.space_ds.space-text": "6584e95599f6c81e",

  // --- Molecule components ---
  "sdc.space_ds.space-accordion-item": "12f59cbb30bbe9ac",
  "sdc.space_ds.space-breadcrumb": "0000000000000000",
  "sdc.space_ds.space-contact-card": "0000000000000000",
  "sdc.space_ds.space-content-detail": "0000000000000000",
  "sdc.space_ds.space-dark-bg-imagecard": "0000000000000000",
  "sdc.space_ds.space-imagecard": "4ba8db11f49caa7a",
  "sdc.space_ds.space-logo-section": "0000000000000000",
  "sdc.space_ds.space-pagination": "0000000000000000",
  "sdc.space_ds.space-section-heading": "66d0566bf36744c1",
  "sdc.space_ds.space-stats-kpi": "736c20d426caa4fe",
  "sdc.space_ds.space-testimony-card": "e111d4b4bc21c717",
  "sdc.space_ds.space-user-card": "0000000000000000",
  "sdc.space_ds.space-videocard": "0000000000000000",

  // --- Organism components ---
  "sdc.space_ds.space-accordion": "4501deae76544992",
  "sdc.space_ds.space-cta-banner-type-1": "0f63780153b860c3",
  "sdc.space_ds.space-detail-page-hero-banner": "0000000000000000",
  "sdc.space_ds.space-footer": "0000000000000000",
  "sdc.space_ds.space-header": "0000000000000000",
  "sdc.space_ds.space-hero-banner-style-02": "53d2a955ce191019",
  "sdc.space_ds.space-hero-banner-with-media": "0000000000000000",
  "sdc.space_ds.space-slider": "0000000000000000",
  "sdc.space_ds.space-video-banner": "0000000000000000",
};

/**
 * Convert an SDC component ID (e.g. "space_ds:space-hero-banner-style-02")
 * to a Canvas component ID (e.g. "sdc.space_ds.space-hero-banner-style-02").
 */
export function toCanvasComponentId(sdcId: string): string {
  return `sdc.${sdcId.replace(":", ".")}`;
}

/**
 * Look up the version hash for a given SDC-format component ID.
 * Returns "0000000000000000" if the component is not found in the catalog.
 */
export function getComponentVersion(sdcId: string): string {
  const canvasId = toCanvasComponentId(sdcId);
  return CANVAS_COMPONENT_VERSIONS[canvasId] ?? "0000000000000000";
}
