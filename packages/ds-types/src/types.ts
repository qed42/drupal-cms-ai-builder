/**
 * Design System Adapter Types — shared interfaces for all adapters.
 *
 * Every design system adapter (Space DS, Mercury, CivicTheme) implements
 * DesignSystemAdapter. The pipeline consumes this interface, never
 * referencing theme-specific component IDs directly.
 */

// ---------------------------------------------------------------------------
// Component Roles
// ---------------------------------------------------------------------------

/** Required roles — every adapter MUST map these */
export type RequiredRole =
  | "container"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "link";

/** Standard roles — most adapters will map these */
export type StandardRole =
  | "hero"
  | "cta-banner"
  | "section-heading"
  | "accordion"
  | "accordion-item"
  | "slider"
  | "card"
  | "header"
  | "footer";

/** Extended roles — optional, graceful degradation */
export type ExtendedRole =
  | "testimonial-card"
  | "user-card"
  | "stats-kpi"
  | "contact-card"
  | "video-banner"
  | "logo-section"
  | "content-detail"
  | "icon"
  | "pricing-card"
  | "badge"
  | "blockquote"
  | "video";

export type ComponentRole = RequiredRole | StandardRole | ExtendedRole;

// ---------------------------------------------------------------------------
// Component Definitions
// ---------------------------------------------------------------------------

export interface PropDefinition {
  name: string;
  type: "string" | "boolean" | "number" | "enum" | "object" | "integer";
  required: boolean;
  title: string;
  description?: string;
  enum?: (string | number | boolean)[];
  metaEnum?: Record<string, string>;
  default?: unknown;
  examples?: unknown[];
  $ref?: string;
}

export interface SlotDefinition {
  name: string;
  description: string;
  allowedComponents?: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  group: string;
  category?: string;
  props: PropDefinition[];
  slots?: SlotDefinition[];
}

// ---------------------------------------------------------------------------
// Layout & Composition
// ---------------------------------------------------------------------------

export interface CompositionPattern {
  name: string;
  description: string;
  childRoles: ComponentRole[];
  applicablePageTypes?: string[];
}

export interface SectionRule {
  type: string;
  required: boolean;
  position: "opening" | "middle" | "closing" | "any";
  visualWeight: "heavy" | "medium" | "light";
  preferredPatterns: string[];
  wordCountRange: [number, number];
}

export interface PageDesignRule {
  pageType: string;
  slugPatterns: string[];
  titlePatterns: string[];
  description: string;
  sectionCountRange: [number, number];
  sections: SectionRule[];
  heroRule: {
    preferredStyles: string[];
    selectionGuidance: string;
  };
  rhythm: {
    pattern: string;
    guidance: string;
  };
  avoidComponents: string[];
  closingPattern: string;
  compositionGuidance: string;
}

// ---------------------------------------------------------------------------
// Color & Theming
// ---------------------------------------------------------------------------

export interface ColorPalette {
  values: string[];
  darkBackgrounds: string[];
  lightBackgrounds: string[];
  defaultAlternation: string[];
}

export interface ImagePropMapping {
  props: string[];
  dimensions: { width: number; height: number };
  orientation: "landscape" | "portrait" | "square";
}

// ---------------------------------------------------------------------------
// Brand Tokens
// ---------------------------------------------------------------------------

export interface BrandTokens {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    neutral?: string;
    background?: string;
    [key: string]: string | undefined;
  };
  fonts: {
    heading?: string;
    body?: string;
  };
  logo?: {
    url: string;
    alt: string;
  };
}

export type BrandPayload =
  | { type: "drupal-config"; configName: string; values: Record<string, unknown> }
  | { type: "css-file"; path: string; content: string }
  | { type: "scss-file"; path: string; content: string; requiresBuild: true };

// ---------------------------------------------------------------------------
// Canvas Tree Items
// ---------------------------------------------------------------------------

export interface ComponentTreeItem {
  uuid: string;
  component_id: string;
  component_version: string;
  parent_uuid: string | null;
  slot: string | null;
  inputs: Record<string, unknown>;
  label: string;
}

// ---------------------------------------------------------------------------
// Builder Data
// ---------------------------------------------------------------------------

export interface HeaderData {
  siteName: string;
  logo?: { url: string; alt: string };
  pages: Array<{ slug: string; title: string }>;
  ctaText?: string;
  ctaUrl?: string;
  menuAlign?: string;
}

export interface FooterData {
  siteName: string;
  tagline?: string;
  brandDescription?: string;
  disclaimer?: string;
  navLinks?: Array<{ title: string; url: string }>;
  socialLinks?: Array<{ platform: string; url: string; icon: string }>;
  legalLinks?: Array<{ title: string; url: string }>;
  ctaPrimary?: { label: string; url: string };
  ctaSecondary?: { label: string; url: string };
}

export interface SectionChildData {
  componentId: string;
  slot?: string;
  props: Record<string, unknown>;
}

export interface SectionBuildOptions {
  backgroundColor?: string;
  sectionHeading?: { title: string; label?: string; description?: string; alignment?: string };
  sectionTag?: string;
}

// ---------------------------------------------------------------------------
// Adapter Interface
// ---------------------------------------------------------------------------

export interface DesignSystemAdapter {
  /** Unique identifier, e.g. "space_ds" */
  readonly id: string;

  /** Human-readable name, e.g. "Space DS v2" */
  readonly name: string;

  /** Drupal theme machine name */
  readonly themeName: string;

  /** Composer package for installing the theme */
  readonly composerPackage: string;

  /** Drupal theme region name for the global header */
  readonly headerRegion: string;

  /** Drupal theme region name for the global footer */
  readonly footerRegion: string;

  // ─── Component Registry ───────────────────────────

  getManifest(): ComponentDefinition[];
  getComponent(id: string): ComponentDefinition | undefined;
  resolveRole(role: ComponentRole): string[];
  primaryComponent(role: ComponentRole): string;
  supportsRole(role: ComponentRole): boolean;

  // ─── Section Composition ──────────────────────────

  buildContentSection(
    pattern: string,
    children: SectionChildData[],
    options?: SectionBuildOptions
  ): ComponentTreeItem[];

  buildOrganismSection(
    componentId: string,
    props: Record<string, unknown>,
    children?: SectionChildData[],
    sectionTag?: string
  ): ComponentTreeItem[];

  getCompositionPatterns(): Record<string, CompositionPattern>;
  getPageDesignRules(): PageDesignRule[];
  getFullWidthOrganisms(): string[];

  // ─── Tree Builders ────────────────────────────────

  buildHeroSection(
    componentId: string,
    props: Record<string, unknown>,
    children?: SectionChildData[],
    sectionTag?: string
  ): ComponentTreeItem[];

  buildHeaderTree(data: HeaderData): ComponentTreeItem[];
  buildFooterTree(data: FooterData): ComponentTreeItem[];

  // ─── Metadata ─────────────────────────────────────

  getVersionHash(componentId: string): string;
  toCanvasId(sdcId: string): string;
  getLabel(componentId: string): string;
  getImageMapping(componentId: string): ImagePropMapping | undefined;
  getPlaceholderImagePath(): string;
  getPropOverrides(): Record<string, Record<string, unknown>>;

  // ─── Color & Theming ──────────────────────────────

  getColorPalette(): ColorPalette;

  // ─── AI Prompt Engineering ────────────────────────

  buildPromptComponentReference(): string;
  buildPromptAccessibilityRules(): string;
  buildPromptDesignGuidance(): string;

  // ─── Brand Application ────────────────────────────

  prepareBrandPayload(tokens: BrandTokens): BrandPayload;
}
