/**
 * Design System Adapter Registry — stores and retrieves adapters by ID.
 *
 * Supports setting an "active" adapter for the current request/pipeline run.
 * If no active adapter is set, falls back to "space_ds" as the default.
 */

import type { DesignSystemAdapter } from "./types";

const adapters = new Map<string, DesignSystemAdapter>();
let activeAdapterId: string | null = null;

export function registerAdapter(adapter: DesignSystemAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getAdapter(id: string): DesignSystemAdapter {
  const adapter = adapters.get(id);
  if (!adapter) {
    throw new Error(
      `Design system "${id}" not registered. Available: ${[...adapters.keys()].join(", ") || "none"}`
    );
  }
  return adapter;
}

/**
 * Set the active design system for the current pipeline run.
 * All subsequent calls to getDefaultAdapter() will return this adapter.
 */
export function setActiveAdapter(id: string): void {
  if (!adapters.has(id)) {
    throw new Error(
      `Cannot activate design system "${id}". Available: ${[...adapters.keys()].join(", ") || "none"}`
    );
  }
  activeAdapterId = id;
}

/**
 * Get the currently active adapter. Falls back to "space_ds" if none is set.
 */
export function getDefaultAdapter(): DesignSystemAdapter {
  return getAdapter(activeAdapterId || "space_ds");
}

export function listAdapters(): Array<{ id: string; name: string }> {
  return [...adapters.values()].map((a) => ({ id: a.id, name: a.name }));
}
