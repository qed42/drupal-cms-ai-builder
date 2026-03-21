import { registerAdapter } from "@ai-builder/ds-types";
import { spaceDsAdapter } from "@ai-builder/ds-space-ds";

// Register all available design system adapters
registerAdapter(spaceDsAdapter);

// Re-export for convenience
export { getAdapter, getDefaultAdapter, listAdapters } from "@ai-builder/ds-types";
