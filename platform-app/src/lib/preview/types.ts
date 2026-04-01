/**
 * TASK-514: Preview system types.
 *
 * Foundational types for the live blueprint preview system (M28).
 */

import type { PageLayout, BrandTokens, HeaderConfig, FooterConfig } from "@/lib/blueprint/types";
import type { TokenRules } from "@/lib/rules/types";

// ---------------------------------------------------------------------------
// Preview payload — everything the iframe needs to render a page
// ---------------------------------------------------------------------------

export interface PreviewPayload {
  page: PageLayout;
  brand: BrandTokens;
  header?: HeaderConfig;
  footer?: FooterConfig;
  /** JSX + CSS source keyed by code component machineName. */
  codeComponentSources: Record<string, { jsx: string; css: string }>;
  generationMode: "design_system" | "code_components";
  /** Design token rules from M27 (container, typography, card, button, spacing). */
  designTokens?: TokenRules;
}

// ---------------------------------------------------------------------------
// PostMessage types — strict discriminated union
// ---------------------------------------------------------------------------

export type PostMessageType =
  | "section-click"
  | "section-hover"
  | "ready"
  | "error"
  | "update-props"
  | "replace-section"
  | "update-section";

/** All allowed message types as a readonly set for whitelist checks. */
export const ALLOWED_MESSAGE_TYPES: ReadonlySet<PostMessageType> = new Set<PostMessageType>([
  "section-click",
  "section-hover",
  "ready",
  "error",
  "update-props",
  "replace-section",
  "update-section",
]);

export interface SectionClickMessage {
  type: "section-click";
  sectionIndex: number;
}

export interface SectionHoverMessage {
  type: "section-hover";
  sectionIndex: number;
  hovering: boolean;
}

export interface ReadyMessage {
  type: "ready";
}

export interface ErrorMessage {
  type: "error";
  sectionIndex?: number;
  message: string;
}

export interface UpdatePropsMessage {
  type: "update-props";
  sectionIndex: number;
  props: Record<string, unknown>;
}

export interface ReplaceSectionMessage {
  type: "replace-section";
  sectionIndex: number;
  section: unknown;
  jsx?: string;
  css?: string;
}

export interface UpdateSectionMessage {
  type: "update-section";
  sectionIndex: number;
  props: Record<string, unknown>;
}

export type PreviewMessage =
  | SectionClickMessage
  | SectionHoverMessage
  | ReadyMessage
  | ErrorMessage
  | UpdatePropsMessage
  | ReplaceSectionMessage
  | UpdateSectionMessage;

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

export type ViewportSize = "desktop" | "tablet" | "mobile";

export interface ViewportConfig {
  width: number;
  label: string;
}

export const VIEWPORT_CONFIGS: Record<ViewportSize, ViewportConfig> = {
  desktop: { width: 1280, label: "Desktop" },
  tablet: { width: 768, label: "Tablet" },
  mobile: { width: 375, label: "Mobile" },
};
