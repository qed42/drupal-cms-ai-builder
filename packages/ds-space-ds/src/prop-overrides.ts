/**
 * Intentional prop overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
export const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "space_ds:space-container": { width: "boxed-width" },
  "space_ds:space-heading": { align: "none" },
  "space_ds:space-section-heading": { alignment: "center" },
  "space_ds:space-button": { variant: "primary" },
  "space_ds:space-cta-banner-type-1": { width: "full-width", alignment: "stacked" },
};
