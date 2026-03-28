/**
 * Config YAML builder for Canvas Code Components (M26).
 *
 * Converts CodeComponentOutput into Drupal config entity YAML
 * (canvas.js_component.{machineName}.yml) and wraps components
 * as Canvas component tree nodes.
 */

import type { ComponentTreeItem } from "@/lib/blueprint/types";
import type { CodeComponentOutput, CodeComponentProp } from "./types";

/**
 * Map our prop types to the Canvas JS Component schema format.
 * Canvas uses a specific schema structure for prop definitions.
 */
function mapPropToCanvasSchema(prop: CodeComponentProp): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    title: prop.description || prop.name,
    type: mapPropTypeToSchemaType(prop.type),
  };

  if (prop.type === "formatted_text") {
    schema.format = "html";
  }

  if (prop.type === "link") {
    schema.type = "object";
    schema.properties = {
      url: { type: "string", title: "URL" },
      title: { type: "string", title: "Link text" },
    };
  }

  if (prop.type === "image" || prop.type === "video") {
    schema.type = "object";
    schema.properties = {
      url: { type: "string", title: "URL" },
      alt: { type: "string", title: "Alt text" },
    };
  }

  if (prop.default !== undefined) {
    schema.default = prop.default;
  }

  return schema;
}

/**
 * Map CodeComponentPropType to JSON Schema type string.
 */
function mapPropTypeToSchemaType(type: string): string {
  switch (type) {
    case "string":
    case "formatted_text":
      return "string";
    case "boolean":
      return "boolean";
    case "integer":
      return "integer";
    case "number":
      return "number";
    default:
      return "string";
  }
}

/**
 * Build a valid canvas.js_component.{machineName}.yml config string.
 *
 * Output follows the Drupal Canvas config entity schema:
 * - machineName as the config entity ID
 * - js.original contains the JSX source
 * - css.original contains the CSS source
 * - props defines the component schema
 * - slots defines child insertion points
 */
export function buildConfigYaml(output: CodeComponentOutput): string {
  const propsSchema: Record<string, unknown> = {};
  const required: string[] = [];

  for (const prop of output.props) {
    propsSchema[prop.name] = mapPropToCanvasSchema(prop);
    if (prop.required) {
      required.push(prop.name);
    }
  }

  const config: Record<string, unknown> = {
    langcode: "en",
    status: true,
    id: output.machineName,
    label: output.name,
    js: {
      original: output.jsx,
    },
    css: {
      original: output.css,
    },
    props: {
      type: "object",
      required: required.length > 0 ? required : undefined,
      properties: propsSchema,
    },
  };

  if (output.slots && output.slots.length > 0) {
    const slotsConfig: Record<string, { title: string }> = {};
    for (const slot of output.slots) {
      slotsConfig[slot.name] = {
        title: slot.description || slot.name,
      };
    }
    config.slots = slotsConfig;
  }

  // Use JSON-based YAML serialization (compatible without js-yaml dependency).
  // The output is valid YAML since JSON is a subset of YAML.
  return toYaml(config);
}

/**
 * Simple YAML serializer that produces clean, readable YAML output.
 * Handles nested objects, arrays, strings (with multiline support), and primitives.
 */
function toYaml(obj: unknown, indent: number = 0): string {
  const prefix = "  ".repeat(indent);

  if (obj === null || obj === undefined) {
    return "null";
  }

  if (typeof obj === "boolean") {
    return obj ? "true" : "false";
  }

  if (typeof obj === "number") {
    return String(obj);
  }

  if (typeof obj === "string") {
    // Use block scalar for multiline strings
    if (obj.includes("\n")) {
      const lines = obj.split("\n");
      return `|\n${lines.map((line) => `${prefix}  ${line}`).join("\n")}`;
    }
    // Quote strings that could be misinterpreted
    if (
      obj === "" ||
      obj === "true" ||
      obj === "false" ||
      obj === "null" ||
      obj.includes(":") ||
      obj.includes("#") ||
      obj.includes("'") ||
      obj.startsWith("{") ||
      obj.startsWith("[")
    ) {
      return `'${obj.replace(/'/g, "''")}'`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        const val = toYaml(item, indent + 1);
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          // Object items in array: first key on same line as dash
          const firstNewline = val.indexOf("\n");
          if (firstNewline === -1) {
            return `${prefix}- ${val}`;
          }
          return `${prefix}- ${val}`;
        }
        return `${prefix}- ${val}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        const val = toYaml(value, indent + 1);
        if (
          typeof value === "object" &&
          value !== null &&
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === "object" && Object.keys(value).length === 0)
        ) {
          return `${prefix}${key}:\n${val}`;
        }
        return `${prefix}${key}: ${val}`;
      })
      .join("\n");
  }

  return String(obj);
}

/**
 * Wrap a code component as a Canvas component tree node.
 *
 * Canvas code components use the component_id format: js.{machineName}
 * (as opposed to sdc.{namespace}.{component} for design system components).
 */
export function wrapAsCanvasTreeNode(
  machineName: string,
  propValues: Record<string, unknown>,
  parentUuid?: string,
  slot?: string
): ComponentTreeItem {
  return {
    uuid: crypto.randomUUID(),
    component_id: `js.${machineName}`,
    component_version: "0000000000000000", // Placeholder — computed by Canvas on import
    parent_uuid: parentUuid ?? null,
    slot: slot ?? null,
    inputs: propValues,
  };
}
