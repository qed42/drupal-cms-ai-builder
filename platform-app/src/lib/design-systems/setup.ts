import { registerAdapter } from "@ai-builder/ds-types";
import { spaceDsAdapter } from "@ai-builder/ds-space-ds";
import { mercuryAdapter } from "@ai-builder/ds-mercury";
import { civicthemeAdapter } from "@ai-builder/ds-civictheme";

// Register all available design system adapters
registerAdapter(spaceDsAdapter);
registerAdapter(mercuryAdapter);
registerAdapter(civicthemeAdapter);

// Re-export for convenience
export { getAdapter, getDefaultAdapter, setActiveAdapter, listAdapters } from "@ai-builder/ds-types";
