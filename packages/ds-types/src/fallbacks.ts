/**
 * Graceful degradation — fallback chains for unsupported roles.
 */

import type { ComponentRole, DesignSystemAdapter } from "./types";

const FALLBACK_CHAINS: Partial<Record<ComponentRole, ComponentRole[]>> = {
  "stats-kpi": ["heading"],
  "user-card": ["card"],
  "contact-card": ["card"],
  "testimonial-card": ["card"],
  "section-heading": ["heading"],
  "logo-section": ["card"],
  "content-detail": ["text"],
  "video-banner": ["hero"],
  "pricing-card": ["card"],
  blockquote: ["text"],
  badge: ["text"],
  video: ["image"],
};

/**
 * Resolve a role with fallback chain. Returns a component ID or null.
 */
export function resolveWithFallback(
  adapter: DesignSystemAdapter,
  role: ComponentRole
): string | null {
  if (adapter.supportsRole(role)) {
    return adapter.primaryComponent(role);
  }

  const chain = FALLBACK_CHAINS[role];
  if (chain) {
    for (const fallback of chain) {
      if (adapter.supportsRole(fallback)) {
        return adapter.primaryComponent(fallback);
      }
    }
  }

  return null;
}
