/**
 * Intentional prop overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
export const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "mercury:section": {
    width: "boxed",
    padding_block_start: "lg",
    padding_block_end: "lg",
  },
  "mercury:heading": { align: "left" },
  "mercury:button": { variant: "primary" },
  "mercury:cta": { background_color: "primary" },
  "mercury:group": { direction: "row", gap: "md" },
};
