import { randomUUID } from "crypto";
import type { PageSection, ComponentTreeItem } from "./types";
import { toCanvasComponentId, getComponentVersion } from "./canvas-component-versions";

// Components that are full-width by design and do NOT need a space-container wrapper.
// Hero banners have internal `container mx-auto` for content centering.
// CTA banners have their own `width` prop for boxed vs full-width control.
const SKIP_CONTAINER = new Set([
  "space_ds:space-hero-banner-style-01",
  "space_ds:space-hero-banner-style-02",
  "space_ds:space-hero-banner-style-03",
  "space_ds:space-hero-banner-style-04",
  "space_ds:space-hero-banner-style-05",
  "space_ds:space-hero-banner-style-06",
  "space_ds:space-hero-banner-style-07",
  "space_ds:space-hero-banner-style-08",
  "space_ds:space-hero-banner-style-09",
  "space_ds:space-hero-banner-style-10",
  "space_ds:space-hero-banner-style-11",
  "space_ds:space-cta-banner-type-1",
  "space_ds:space-cta-banner-type-2",
  "space_ds:space-cta-banner-type-3",
]);

// Component variant families for anti-monotony substitution.
// When two consecutive sections use the same component_id, the second
// is swapped to an alternate variant from the same family.
const VARIANT_FAMILIES: Record<string, string[]> = {
  "space_ds:space-text-media-default": [
    "space_ds:space-text-media-with-checklist",
    "space_ds:space-text-media-with-link",
    "space_ds:space-text-media-with-stats",
    "space_ds:space-text-media-with-images",
  ],
  "space_ds:space-text-media-with-checklist": [
    "space_ds:space-text-media-default",
    "space_ds:space-text-media-with-link",
  ],
  "space_ds:space-text-media-with-link": [
    "space_ds:space-text-media-default",
    "space_ds:space-text-media-with-checklist",
  ],
  "space_ds:space-text-media-with-stats": [
    "space_ds:space-text-media-default",
    "space_ds:space-text-media-with-link",
  ],
  "space_ds:space-text-media-with-images": [
    "space_ds:space-text-media-default",
    "space_ds:space-text-media-with-checklist",
  ],
  "space_ds:space-team-section-simple-1": [
    "space_ds:space-team-section-simple-2",
    "space_ds:space-team-section-image-card-1",
  ],
  "space_ds:space-team-section-simple-2": [
    "space_ds:space-team-section-simple-1",
    "space_ds:space-team-section-image-card-1",
  ],
  "space_ds:space-team-section-image-card-1": [
    "space_ds:space-team-section-image-card-2",
    "space_ds:space-team-section-simple-1",
  ],
  "space_ds:space-team-section-image-card-2": [
    "space_ds:space-team-section-image-card-1",
    "space_ds:space-team-section-image-card-3",
  ],
};

/**
 * Build a Canvas-ready flat component tree from a page's sections array.
 *
 * - Non-hero/CTA organisms are wrapped in a `space-container` with `boxed-width`.
 * - Consecutive identical component_ids are substituted with an alternate variant.
 */
export function buildComponentTree(
  sections: PageSection[]
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];
  let prevComponentId: string | null = null;

  for (const section of sections) {
    let componentId = section.component_id;

    // Anti-monotony: swap duplicate consecutive component IDs to a variant.
    if (componentId === prevComponentId && VARIANT_FAMILIES[componentId]) {
      const alternatives = VARIANT_FAMILIES[componentId];
      componentId = alternatives[0];
    }

    prevComponentId = componentId;

    const canvasId = toCanvasComponentId(componentId);
    const version = getComponentVersion(componentId);
    const needsContainer = !SKIP_CONTAINER.has(componentId);

    // Derive a human-readable label from the component ID.
    const label = componentId
      .split(":")[1]
      ?.replace(/^space-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      ?? canvasId;

    const inputs = { ...section.props } as Record<string, unknown>;

    if (needsContainer) {
      // Create a space-container wrapper as the parent.
      const containerUuid = randomUUID();
      const containerCanvasId = toCanvasComponentId("space_ds:space-container");
      const containerVersion = getComponentVersion("space_ds:space-container");

      items.push({
        uuid: containerUuid,
        component_id: containerCanvasId,
        component_version: containerVersion,
        parent_uuid: null,
        slot: null,
        inputs: {
          width: "boxed-width",
          padding_top: "large",
          padding_bottom: "large",
        },
        label: `Container: ${label}`,
      });

      // Add the organism as a child of the container in the "content" slot.
      items.push({
        uuid: randomUUID(),
        component_id: canvasId,
        component_version: version,
        parent_uuid: containerUuid,
        slot: "content",
        inputs,
        label,
      });
    } else {
      // Full-width component — add directly at root level.
      items.push({
        uuid: randomUUID(),
        component_id: canvasId,
        component_version: version,
        parent_uuid: null,
        slot: null,
        inputs,
        label,
      });
    }
  }

  return items;
}
