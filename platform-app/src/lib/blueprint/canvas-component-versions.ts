/**
 * Canvas component version utilities — delegates to the active design system adapter.
 */
import { getDefaultAdapter } from "@/lib/design-systems/setup";

export function toCanvasComponentId(sdcId: string): string {
  return getDefaultAdapter().toCanvasId(sdcId);
}

export function getComponentVersion(sdcId: string): string {
  return getDefaultAdapter().getVersionHash(sdcId);
}
