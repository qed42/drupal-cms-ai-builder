/**
 * Intentional prop overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
export const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "mercury:section": {
    width: "100%",
    padding_block_start: "32",
    padding_block_end: "32",
    margin_block_start: "0",
    margin_block_end: "0",
    mobile_columns: "1",
  },
  "mercury:heading": { align: "left", text_color: "default", text_size: "heading-responsive-3xl" },
  "mercury:button": { variant: "primary", size: "medium" },
  "mercury:cta": { background_color: "primary", text_align: "center" },
  "mercury:group": { flex_direction: "row", flex_gap: "md", items_align: "start", flex_align: "center" },
  "mercury:card": { style: "framed", orientation: "vertical" },
  "mercury:card-icon": { text_align: "center", icon_align: "center" },
  "mercury:card-testimonial": { align: "center", style: "default" },
  "mercury:card-pricing": { symbol_position: "before" },
  "mercury:text": { text_size: "normal", text_color: "default" },
};
