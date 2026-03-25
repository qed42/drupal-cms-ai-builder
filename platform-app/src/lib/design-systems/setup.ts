import { registerAdapter } from "@ai-builder/ds-types";
import { spaceDsAdapter } from "@ai-builder/ds-space-ds";
import { mercuryAdapter } from "@ai-builder/ds-mercury";
// CivicTheme adapter exists but is not yet supported in the pipeline
// import { civicthemeAdapter } from "@ai-builder/ds-civictheme";

// Register all available design system adapters
registerAdapter(spaceDsAdapter);
registerAdapter(mercuryAdapter);

// Re-export for convenience
export { getAdapter, getDefaultAdapter, setActiveAdapter, listAdapters } from "@ai-builder/ds-types";
