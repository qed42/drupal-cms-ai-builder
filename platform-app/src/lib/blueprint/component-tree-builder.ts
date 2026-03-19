import { randomUUID } from "crypto";
import type { PageSection, ComponentTreeItem } from "./types";
import { toCanvasComponentId, getComponentVersion } from "./canvas-component-versions";

// Required prop defaults are now handled by the component-validator.ts
// which reads defaults from the Space DS manifest dynamically.
// See TASK-268 for details.

/**
 * Build a Canvas-ready flat component tree from a page's sections array.
 *
 * Each section becomes a root-level item (parent_uuid = null, slot = null).
 * The component_id is mapped from SDC format to Canvas format and the
 * version hash is looked up from the hardcoded Space DS catalog.
 */
export function buildComponentTree(
  sections: PageSection[]
): ComponentTreeItem[] {
  return sections.map((section) => {
    const canvasId = toCanvasComponentId(section.component_id);
    const version = getComponentVersion(section.component_id);

    // Derive a human-readable label from the component ID.
    // "space_ds:space-hero-banner-style-01" → "Hero Banner Style 01"
    const label = section.component_id
      .split(":")[1]                    // "space-hero-banner-style-01"
      ?.replace(/^space-/, "")          // "hero-banner-style-01"
      .replace(/-/g, " ")              // "hero banner style 01"
      .replace(/\b\w/g, (c) => c.toUpperCase()) // "Hero Banner Style 01"
      ?? canvasId;

    // Props are now pre-validated by component-validator.ts which fills
    // required defaults from the manifest. Just pass through as-is.
    const inputs = { ...section.props } as Record<string, unknown>;

    return {
      uuid: randomUUID(),
      component_id: canvasId,
      component_version: version,
      parent_uuid: null,
      slot: null,
      inputs,
      label,
    };
  });
}
