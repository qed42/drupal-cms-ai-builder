/**
 * Design System Adapter Registry — stores and retrieves adapters by ID.
 */

import type { DesignSystemAdapter } from "./types";

const adapters = new Map<string, DesignSystemAdapter>();

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

export function getDefaultAdapter(): DesignSystemAdapter {
  return getAdapter("space_ds");
}

export function listAdapters(): Array<{ id: string; name: string }> {
  return [...adapters.values()].map((a) => ({ id: a.id, name: a.name }));
}
