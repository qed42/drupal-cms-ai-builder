import type {
  DesignSystemAdapter,
  ComponentRole,
  ComponentDefinition,
  CompositionPattern,
  PageDesignRule,
  ColorPalette,
  ImagePropMapping,
  BrandTokens,
  BrandPayload,
  ComponentTreeItem,
  HeaderData,
  FooterData,
  SectionChildData,
  SectionBuildOptions,
} from "@ai-builder/ds-types";

import { ROLE_MAP } from "./role-map";
import { COMPONENT_VERSIONS, toCanvasComponentId, getComponentVersion } from "./versions";
import { COMPONENT_LABELS, getLabel } from "./labels";
import { PROP_OVERRIDES } from "./prop-overrides";
import { COLOR_PALETTE } from "./color-palette";
import { IMAGE_PROP_MAPPINGS } from "./image-mappings";
import { COMPOSITION_PATTERNS } from "./composition-patterns";
import { PAGE_DESIGN_RULES } from "./design-rules";
import { prepareBrandPayload } from "./brand-tokens";
import {
  buildPromptComponentReference,
  buildPromptAccessibilityRules,
  buildPromptDesignGuidance,
} from "./prompt-fragments";
import {
  createItem,
  buildHeaderTree,
  buildFooterTree,
  buildContentSection,
  buildOrganismSection,
  buildHeroSection,
  getFullWidthOrganisms,
  getPlaceholderImagePath,
} from "./tree-builders";
import manifest from "./manifest.json";

// ---------------------------------------------------------------------------
// Manifest cache
// ---------------------------------------------------------------------------

const manifestComponents = manifest as ComponentDefinition[];
const componentIndex = new Map<string, ComponentDefinition>();
for (const comp of manifestComponents) {
  componentIndex.set(comp.id, comp);
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export const spaceDsAdapter: DesignSystemAdapter = {
  id: "space_ds",
  name: "Space DS v2",
  themeName: "space_ds",
  composerPackage: "starter-starter/space-ds",

  // ─── Component Registry ───────────────────────────

  getManifest(): ComponentDefinition[] {
    return manifestComponents;
  },

  getComponent(id: string): ComponentDefinition | undefined {
    return componentIndex.get(id);
  },

  resolveRole(role: ComponentRole): string[] {
    return ROLE_MAP[role] ?? [];
  },

  primaryComponent(role: ComponentRole): string {
    const ids = ROLE_MAP[role];
    if (!ids || ids.length === 0) {
      throw new Error(`Space DS does not support role "${role}"`);
    }
    return ids[0];
  },

  supportsRole(role: ComponentRole): boolean {
    const ids = ROLE_MAP[role];
    return !!ids && ids.length > 0;
  },

  // ─── Section Composition ──────────────────────────

  buildContentSection(
    pattern: string,
    children: SectionChildData[],
    options?: SectionBuildOptions
  ): ComponentTreeItem[] {
    return buildContentSection(pattern, children, options);
  },

  buildOrganismSection(
    componentId: string,
    props: Record<string, unknown>,
    children?: SectionChildData[],
    sectionTag?: string
  ): ComponentTreeItem[] {
    return buildOrganismSection(componentId, props, children, sectionTag);
  },

  getCompositionPatterns(): Record<string, CompositionPattern> {
    return COMPOSITION_PATTERNS;
  },

  getPageDesignRules(): PageDesignRule[] {
    return PAGE_DESIGN_RULES;
  },

  getFullWidthOrganisms(): string[] {
    return getFullWidthOrganisms();
  },

  // ─── Tree Builders ────────────────────────────────

  buildHeroSection(
    componentId: string,
    props: Record<string, unknown>,
    children?: SectionChildData[],
    sectionTag?: string
  ): ComponentTreeItem[] {
    return buildHeroSection(componentId, props, children, sectionTag);
  },

  buildHeaderTree(data: HeaderData): ComponentTreeItem[] {
    return buildHeaderTree(data);
  },

  buildFooterTree(data: FooterData): ComponentTreeItem[] {
    return buildFooterTree(data);
  },

  // ─── Metadata ─────────────────────────────────────

  getVersionHash(componentId: string): string {
    return getComponentVersion(componentId);
  },

  toCanvasId(sdcId: string): string {
    return toCanvasComponentId(sdcId);
  },

  getLabel(componentId: string): string {
    return getLabel(componentId);
  },

  getImageMapping(componentId: string): ImagePropMapping | undefined {
    return IMAGE_PROP_MAPPINGS[componentId];
  },

  getPlaceholderImagePath(): string {
    return getPlaceholderImagePath();
  },

  getPropOverrides(): Record<string, Record<string, unknown>> {
    return PROP_OVERRIDES;
  },

  // ─── Color & Theming ──────────────────────────────

  getColorPalette(): ColorPalette {
    return COLOR_PALETTE;
  },

  // ─── AI Prompt Engineering ────────────────────────

  buildPromptComponentReference(): string {
    return buildPromptComponentReference();
  },

  buildPromptAccessibilityRules(): string {
    return buildPromptAccessibilityRules();
  },

  buildPromptDesignGuidance(): string {
    return buildPromptDesignGuidance();
  },

  // ─── Brand Application ────────────────────────────

  prepareBrandPayload(tokens: BrandTokens): BrandPayload {
    return prepareBrandPayload(tokens);
  },
};

// Re-export all sub-modules for direct access
export { ROLE_MAP } from "./role-map";
export { COMPONENT_VERSIONS, toCanvasComponentId, getComponentVersion } from "./versions";
export { COMPONENT_LABELS, getLabel } from "./labels";
export { PROP_OVERRIDES } from "./prop-overrides";
export { COLOR_PALETTE } from "./color-palette";
export { IMAGE_PROP_MAPPINGS } from "./image-mappings";
export { COMPOSITION_PATTERNS } from "./composition-patterns";
export { PAGE_DESIGN_RULES } from "./design-rules";
export { prepareBrandPayload } from "./brand-tokens";
export {
  buildPromptComponentReference,
  buildPromptAccessibilityRules,
  buildPromptDesignGuidance,
} from "./prompt-fragments";
export {
  createItem,
  buildHeaderTree,
  buildFooterTree,
  buildContentSection,
  buildOrganismSection,
  buildHeroSection,
  getFullWidthOrganisms,
  getPlaceholderImagePath,
} from "./tree-builders";
