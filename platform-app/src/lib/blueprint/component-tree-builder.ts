import { randomUUID } from "crypto";
import type { PageSection, ComponentTreeItem } from "./types";
import { toCanvasComponentId, getComponentVersion } from "./canvas-component-versions";

/**
 * Required prop defaults for Space DS components.
 *
 * Canvas validates required props on save. The AI generator only produces
 * content props (title, description, etc.) and omits layout/display props
 * that have sensible defaults in the component schema. This map supplies
 * those defaults so validation passes.
 */
const REQUIRED_PROP_DEFAULTS: Record<string, Record<string, string>> = {
  "space_ds:space-cta-banner-type-1": { width: "boxed-width", alignment: "left-align" },
  "space_ds:space-cta-banner-type-2": { width: "boxed-width", image_type: "large-image" },
  "space_ds:space-cta-banner-type-3": { width: "boxed-width" },
  "space_ds:space-container": { width: "boxed-width" },
};

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

    // Merge required prop defaults (schema defaults the AI omits) with
    // AI-generated props. AI props take precedence if provided.
    const defaults = REQUIRED_PROP_DEFAULTS[section.component_id] ?? {};
    const inputs = { ...defaults, ...section.props } as Record<string, unknown>;

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
