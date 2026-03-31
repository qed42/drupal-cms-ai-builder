/**
 * Config YAML builder for Canvas Code Components (M26).
 *
 * Converts CodeComponentOutput into Drupal config entity YAML
 * (canvas.js_component.{machineName}.yml) matching the real Canvas
 * JavaScriptComponent config entity schema.
 *
 * Schema reference: canvas/config/schema/canvas.json_schema.yml
 * Example configs: canvas/tests/modules/canvas_children_slot_component/config/install/
 */

import type { ComponentTreeItem } from "@/lib/blueprint/types";
import type { CodeComponentOutput, CodeComponentProp } from "./types";

/**
 * Map a CodeComponentProp to the Canvas JSON Schema prop format.
 *
 * Canvas props follow a subset of JSON Schema with these rules:
 * - `title` (required): human-readable label
 * - `type`: one of string, number, integer, boolean, object
 * - `examples`: array of example values (Canvas uses this instead of `default`)
 * - For HTML text: `contentMediaType: text/html` + `x-formatting-context: block`
 * - For images: `type: object` + `$ref: json-schema-definitions://canvas.module/image`
 * - For videos: `type: object` + `$ref: json-schema-definitions://canvas.module/video`
 * - For links: `type: string` + `format: uri`
 * - No `properties` sub-mapping — Canvas doesn't support arbitrary object shapes
 * - No `default` key — Canvas uses `examples` instead
 */
function mapPropToCanvasSchema(prop: CodeComponentProp): Record<string, unknown> {
  // Canvas may use the prop `title` as a default field value internally.
  // For URI-validated props (format: uri), the title MUST be a valid absolute
  // URI to avoid validation failures during blueprint import.
  const title = prop.type === "link"
    ? "https://example.com"
    : (prop.description || prop.name);
  const schema: Record<string, unknown> = {
    title,
    type: mapPropTypeToSchemaType(prop.type),
  };

  // Add examples from default value
  if (prop.default !== undefined && prop.default !== null) {
    if (prop.type === "image") {
      // Image examples need {src, width, height, alt} shape
      const imgDefault = prop.default as Record<string, unknown>;
      schema.examples = [{
        src: imgDefault.url || imgDefault.src || "https://placehold.co/1200x800",
        width: 1200,
        height: 800,
        alt: imgDefault.alt || prop.description || prop.name,
      }];
    } else if (prop.type === "video") {
      const vidDefault = prop.default as Record<string, unknown>;
      schema.examples = [{
        src: vidDefault.url || vidDefault.src || "https://placehold.co/video",
        width: 1920,
        height: 1080,
      }];
    } else if (prop.type === "link") {
      // Validate that the default is actually a URL, not description text
      const val = String(prop.default);
      const isUrl = /^(https?:\/\/|\/[a-z])/.test(val);
      schema.examples = [isUrl ? val : "https://example.com"];
    } else {
      schema.examples = [prop.default];
    }
  } else {
    // Canvas requires examples for required props; provide sensible defaults
    switch (prop.type) {
      case "string":
      case "formatted_text":
        schema.examples = [prop.name];
        break;
      case "boolean":
        schema.examples = [false];
        break;
      case "integer":
        schema.examples = [0];
        break;
      case "number":
        schema.examples = [0];
        break;
      case "image":
        schema.examples = [{
          src: "https://placehold.co/1200x800",
          width: 1200,
          height: 800,
          alt: prop.description || prop.name,
        }];
        break;
      case "video":
        schema.examples = [{
          src: "https://placehold.co/video",
          width: 1920,
          height: 1080,
        }];
        break;
      case "link":
        schema.examples = ["https://example.com"];
        break;
    }
  }

  // Type-specific Canvas schema additions
  if (prop.type === "formatted_text") {
    schema.contentMediaType = "text/html";
    schema["x-formatting-context"] = "block";
  }

  if (prop.type === "image") {
    schema.type = "object";
    schema["$ref"] = "json-schema-definitions://canvas.module/image";
  }

  if (prop.type === "video") {
    schema.type = "object";
    schema["$ref"] = "json-schema-definitions://canvas.module/video";
  }

  if (prop.type === "link") {
    schema.type = "string";
    schema.format = "uri";
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
    case "link":
      return "string";
    case "boolean":
      return "boolean";
    case "integer":
      return "integer";
    case "number":
      return "number";
    case "image":
    case "video":
      return "object";
    default:
      return "string";
  }
}

/**
 * Build a valid canvas.js_component.{machineName}.yml config string.
 *
 * Output follows the real Drupal Canvas JavaScriptComponent config entity schema:
 * - machineName (not id) as the entity identifier
 * - required[] is always empty — AI-generated code components have defaults
 *   baked into the JSX, so no props need to be mandatory for Canvas editors.
 *   Canvas enforces required props at save time which blocks page creation.
 * - props as a flat mapping (no type:object/properties wrapper)
 * - slots as {} (empty mapping)
 * - js.original / css.original for source code
 */
export function buildConfigYaml(output: CodeComponentOutput): string {
  const propsSchema: Record<string, unknown> = {};

  for (const prop of output.props) {
    propsSchema[prop.name] = mapPropToCanvasSchema(prop);
  }

  // Build slots mapping
  const slotsConfig: Record<string, { title: string }> = {};
  if (output.slots && output.slots.length > 0) {
    for (const slot of output.slots) {
      slotsConfig[slot.name] = {
        title: slot.description || slot.name,
      };
    }
  }

  // required[] is intentionally empty — AI-generated code components have
  // defaults baked into the JSX. Marking props as required causes Canvas to
  // reject pages at save time if inputs are empty, blocking provisioning.
  const config: Record<string, unknown> = {
    langcode: "en",
    status: true,
    dependencies: {},
    machineName: output.machineName,
    name: output.name,
    required: [],
    props: propsSchema,
    slots: slotsConfig,
    js: {
      original: output.jsx,
    },
    css: {
      original: output.css || "",
    },
    dataDependencies: {},
  };

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
      return `|-\n${lines.map((line) => `${prefix}  ${line}`).join("\n")}`;
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
      obj.startsWith("[") ||
      obj.startsWith("$")
    ) {
      return `'${obj.replace(/'/g, "''")}'`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          // Object items in array: indent the object under the dash
          const entries = Object.entries(item as Record<string, unknown>).filter(
            ([, v]) => v !== undefined
          );
          if (entries.length === 0) return `${prefix}- {}`;
          const firstEntry = entries[0];
          const firstVal = toYaml(firstEntry[1], indent + 2);
          const isComplex = typeof firstEntry[1] === "object" && firstEntry[1] !== null;
          let result = isComplex
            ? `${prefix}-\n${prefix}  ${firstEntry[0]}:\n${firstVal}`
            : `${prefix}- ${firstEntry[0]}: ${firstVal}`;
          for (let i = 1; i < entries.length; i++) {
            const val = toYaml(entries[i][1], indent + 2);
            const entryIsComplex = typeof entries[i][1] === "object" && entries[i][1] !== null;
            result += entryIsComplex
              ? `\n${prefix}  ${entries[i][0]}:\n${val}`
              : `\n${prefix}  ${entries[i][0]}: ${val}`;
          }
          return result;
        }
        const val = toYaml(item, indent + 1);
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
        // Quote keys that contain special characters (like $ref)
        const safeKey = key.includes("$") || key.includes(" ") ? `'${key}'` : key;
        const val = toYaml(value, indent + 1);
        if (
          typeof value === "object" &&
          value !== null &&
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
        ) {
          return `${prefix}${safeKey}:\n${val}`;
        }
        return `${prefix}${safeKey}: ${val}`;
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
