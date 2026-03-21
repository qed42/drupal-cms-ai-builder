/**
 * Component Prop Validator — validates generated blueprint sections against
 * the Space DS component manifest. Strips invalid props, fills required
 * defaults, and reports errors/warnings for retry feedback.
 *
 * TASK-268: Manifest-based schema enforcement
 */

import componentManifest from "../ai/space-component-manifest.json";
import type { PageSection } from "./types";

// ---- Types ----

interface ManifestProp {
  name: string;
  type: string;
  required: boolean;
  title?: string;
  description?: string;
  enum?: (string | number | boolean)[];
  default?: unknown;
}

interface ManifestComponent {
  id: string;
  name: string;
  category: string;
  props: ManifestProp[];
}

export interface ValidationIssue {
  type: "error" | "warning";
  sectionIndex: number;
  componentId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  sanitizedSections: PageSection[];
}

// ---- Manifest index (built once) ----

const manifestIndex = new Map<string, ManifestComponent>();
for (const comp of componentManifest as ManifestComponent[]) {
  manifestIndex.set(comp.id, comp);
}

/**
 * Known composition pattern names that the AI may incorrectly place in
 * component_id. When detected, we remap them to proper composed sections
 * so downstream processing (tree builder) handles them correctly.
 */
const KNOWN_PATTERN_NAMES = new Set([
  "testimonials-carousel",
  "card-carousel",
  "faq-accordion",
  "logo-showcase",
  "text-image-split-50-50",
  "text-image-split-66-33",
  "image-text-split-33-66",
  "features-grid-3col",
  "features-grid-4col",
  "stats-row",
  "team-grid-4col",
  "team-grid-3col",
  "card-grid-3col",
  "contact-info",
  "full-width-text",
]);

/**
 * Get the list of valid prop names for a component. Returns null if the
 * component is not in the manifest.
 */
export function getValidProps(componentId: string): string[] | null {
  const comp = manifestIndex.get(componentId);
  if (!comp) return null;
  return comp.props.map((p) => p.name);
}

/**
 * Get a manifest component definition by its SDC-format ID.
 */
export function getManifestComponent(componentId: string): ManifestComponent | undefined {
  return manifestIndex.get(componentId);
}

/**
 * Validate and sanitize a list of generated page sections.
 *
 * For each section:
 * 1. Check component_id exists in the manifest
 * 2. Strip props not in the component's schema (warning)
 * 3. Validate enum prop values (warning — strip invalid)
 * 4. Fill missing required props from defaults (error if no default)
 *
 * Returns a sanitized copy of the sections plus a list of issues.
 */
export function validateSections(sections: PageSection[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const sanitizedSections: PageSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // Composed sections (Type B) use pattern instead of component_id.
    // Their component_id may be empty or set to the pattern name by the AI.
    // Children carry the actual component IDs and are validated downstream.
    if (section.pattern && (!section.component_id || !manifestIndex.has(section.component_id))) {
      sanitizedSections.push({ ...section });
      continue;
    }

    // Auto-remap: AI placed a pattern name in component_id instead of using
    // the pattern field. Convert to a proper composed section so the tree
    // builder handles it correctly.
    if (!section.pattern && KNOWN_PATTERN_NAMES.has(section.component_id)) {
      issues.push({
        type: "warning",
        sectionIndex: i,
        componentId: section.component_id,
        message: `Remapped pattern name "${section.component_id}" from component_id to pattern field.`,
      });
      sanitizedSections.push({
        ...section,
        pattern: section.component_id,
        component_id: "",
        props: section.props ?? {},
      });
      continue;
    }

    const comp = manifestIndex.get(section.component_id);

    // 1. Unknown component
    if (!comp) {
      issues.push({
        type: "error",
        sectionIndex: i,
        componentId: section.component_id,
        message: `Unknown component "${section.component_id}". It does not exist in the Space DS manifest.`,
      });
      // Keep the section as-is — pipeline will decide whether to retry
      sanitizedSections.push({ ...section });
      continue;
    }

    const propIndex = new Map(comp.props.map((p) => [p.name, p]));
    const cleanProps: Record<string, unknown> = {};

    // 2. Validate each provided prop
    for (const [key, value] of Object.entries(section.props)) {
      const propDef = propIndex.get(key);

      if (!propDef) {
        // Prop doesn't exist on this component — strip it
        issues.push({
          type: "warning",
          sectionIndex: i,
          componentId: section.component_id,
          message: `Stripped invalid prop "${key}" from ${comp.name}. Valid props: ${comp.props.map((p) => p.name).join(", ")}`,
        });
        continue;
      }

      // 3. Enum validation
      if (propDef.enum && propDef.enum.length > 0) {
        if (!propDef.enum.includes(value as string | number | boolean)) {
          issues.push({
            type: "warning",
            sectionIndex: i,
            componentId: section.component_id,
            message: `Invalid enum value "${String(value)}" for prop "${key}" on ${comp.name}. Valid values: ${propDef.enum.join(", ")}. Using default "${String(propDef.default ?? propDef.enum[0])}".`,
          });
          cleanProps[key] = propDef.default ?? propDef.enum[0];
          continue;
        }
      }

      // 4. Basic type check (string props should be strings, etc.)
      if (propDef.type === "string" && typeof value !== "string") {
        // Coerce to string if possible
        cleanProps[key] = String(value);
        issues.push({
          type: "warning",
          sectionIndex: i,
          componentId: section.component_id,
          message: `Coerced prop "${key}" from ${typeof value} to string on ${comp.name}.`,
        });
        continue;
      }

      // 4b. Null/undefined values — strip to allow component defaults
      if (value === null || value === undefined) {
        issues.push({
          type: "warning",
          sectionIndex: i,
          componentId: section.component_id,
          message: `Stripped NULL prop "${key}" from ${comp.name} to allow component default.`,
        });
        continue;
      }

      // 4c. Image object validation (type: "object" with image $ref)
      if (propDef.type === "object" && typeof value === "object") {
        const imgObj = value as Record<string, unknown>;
        if (Object.keys(imgObj).length === 0) {
          // Empty object — strip to allow component default
          issues.push({
            type: "warning",
            sectionIndex: i,
            componentId: section.component_id,
            message: `Stripped empty object prop "${key}" from ${comp.name} to allow component default.`,
          });
          continue;
        }
        if (imgObj.src && typeof imgObj.src === "string") {
          // Valid image object — pass through
          cleanProps[key] = value;
          continue;
        }
        // Object without src — skip silently (image not yet populated)
        continue;
      }

      cleanProps[key] = value;
    }

    // 5. Fill missing required props from defaults
    for (const propDef of comp.props) {
      if (propDef.required && !(propDef.name in cleanProps)) {
        if (propDef.default !== undefined) {
          cleanProps[propDef.name] = propDef.default;
          issues.push({
            type: "warning",
            sectionIndex: i,
            componentId: section.component_id,
            message: `Added default value "${String(propDef.default)}" for required prop "${propDef.name}" on ${comp.name}.`,
          });
        } else if (propDef.enum && propDef.enum.length > 0) {
          // Use first enum value as fallback
          cleanProps[propDef.name] = propDef.enum[0];
          issues.push({
            type: "warning",
            sectionIndex: i,
            componentId: section.component_id,
            message: `Added fallback value "${String(propDef.enum[0])}" for required prop "${propDef.name}" on ${comp.name}.`,
          });
        } else {
          issues.push({
            type: "error",
            sectionIndex: i,
            componentId: section.component_id,
            message: `Missing required prop "${propDef.name}" on ${comp.name} with no default available.`,
          });
        }
      }
    }

    sanitizedSections.push({
      component_id: section.component_id,
      props: cleanProps,
    });
  }

  const hasErrors = issues.some((issue) => issue.type === "error");

  return {
    valid: !hasErrors,
    issues,
    sanitizedSections,
  };
}

/**
 * Format validation issues into a human-readable string suitable for
 * feeding back to the AI in a retry prompt.
 */
export function formatValidationFeedback(issues: ValidationIssue[]): string {
  if (issues.length === 0) return "";

  const lines = issues
    .filter((i) => i.type === "error" || i.type === "warning")
    .map((issue) => `- Section ${issue.sectionIndex + 1} (${issue.componentId}): ${issue.message}`);

  return [
    "The following component prop issues were found in your output:",
    ...lines,
    "",
    "IMPORTANT: Only use props that are explicitly listed for each component. Do NOT invent props.",
  ].join("\n");
}
