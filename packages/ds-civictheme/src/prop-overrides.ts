/**
 * Intentional prop overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
export const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "civictheme:button": { type: "primary" },
  "civictheme:banner": { theme: "dark" },
  "civictheme:campaign": { theme: "dark" },
  "civictheme:callout": { theme: "dark" },
  "civictheme:footer": { theme: "dark" },
  "civictheme:list": { column_count: 3, fill_width: true },
};
