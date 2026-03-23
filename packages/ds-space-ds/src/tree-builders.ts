import { randomUUID } from "crypto";
import type {
  ComponentTreeItem,
  ComponentDefinition,
  HeaderData,
  FooterData,
  SectionChildData,
  SectionBuildOptions,
} from "@ai-builder/ds-types";
import { toCanvasComponentId, getComponentVersion } from "./versions";
import { PROP_OVERRIDES } from "./prop-overrides";
import manifest from "./manifest.json";

// ---------------------------------------------------------------------------
// Manifest indexes (computed once at module load)
// ---------------------------------------------------------------------------

interface ManifestProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  enum?: (string | number | boolean)[];
  examples?: unknown[];
  $ref?: string;
}

interface ManifestComponent {
  id: string;
  props: ManifestProp[];
}

const typedManifest = manifest as ManifestComponent[];

/** Required prop defaults derived from manifest. */
const MANIFEST_REQUIRED_DEFAULTS = buildRequiredPropDefaults();

/** Index of all prop names per component. */
const MANIFEST_PROP_INDEX = new Map<string, Set<string>>();
for (const comp of typedManifest) {
  MANIFEST_PROP_INDEX.set(comp.id, new Set(comp.props.map((p) => p.name)));
}

/** Index of prop types per component: prop name -> type string. */
const MANIFEST_PROP_TYPES = new Map<string, Map<string, string>>();
for (const comp of typedManifest) {
  const types = new Map<string, string>();
  for (const prop of comp.props) {
    types.set(prop.name, prop.type);
  }
  MANIFEST_PROP_TYPES.set(comp.id, types);
}

/** Index of enum-constrained props per component: prop name -> allowed values. */
const MANIFEST_ENUM_INDEX = new Map<string, Map<string, Set<string | number | boolean>>>();
for (const comp of typedManifest) {
  const enumProps = new Map<string, Set<string | number | boolean>>();
  for (const prop of comp.props) {
    if (prop.enum && prop.enum.length > 0) {
      enumProps.set(prop.name, new Set(prop.enum));
    }
  }
  if (enumProps.size > 0) {
    MANIFEST_ENUM_INDEX.set(comp.id, enumProps);
  }
}

/** Index of image-type props per component. */
const MANIFEST_IMAGE_PROPS = new Map<string, string[]>();
for (const comp of typedManifest) {
  const imgProps = comp.props
    .filter(
      (p) =>
        p.type === "object" &&
        (p.name.includes("image") ||
          p.name.includes("logo") ||
          (p as unknown as { $ref?: string }).$ref ===
            "json-schema-definitions://canvas.module/image")
    )
    .map((p) => p.name);
  if (imgProps.length > 0) {
    MANIFEST_IMAGE_PROPS.set(comp.id, imgProps);
  }
}

function buildRequiredPropDefaults(): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const comp of typedManifest) {
    const defaults: Record<string, unknown> = {};
    for (const prop of comp.props) {
      // Include ALL props (required + optional) so Canvas hydration never
      // encounters missing keys — Canvas crashes on null scalar lookups.
      if (prop.default !== undefined) {
        defaults[prop.name] = prop.default;
      } else if (prop.enum && prop.enum.length > 0) {
        defaults[prop.name] = prop.enum[0];
      } else if (prop.type === "string") {
        defaults[prop.name] = "";
      } else if (prop.type === "integer" || prop.type === "number") {
        defaults[prop.name] = 0;
      } else if (prop.type === "boolean") {
        defaults[prop.name] = false;
      }
    }
    if (Object.keys(defaults).length > 0) {
      map.set(comp.id, defaults);
    }
  }
  return map;
}

/** Check if a component defines a given prop in the manifest. */
function componentHasProp(componentId: string, propName: string): boolean {
  return MANIFEST_PROP_INDEX.get(componentId)?.has(propName) ?? false;
}

/** Placeholder image path within the Space DS theme. */
const PLACEHOLDER_IMAGE_PATH =
  "/themes/contrib/space_ds/components/01-atoms/space-image/images/city.jpeg";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Full-width organisms that render at root level without a container wrapper. */
const FULL_WIDTH_ORGANISMS = new Set([
  "space_ds:space-hero-banner-style-02",
  "space_ds:space-hero-banner-with-media",
  "space_ds:space-detail-page-hero-banner",
  "space_ds:space-video-banner",
  "space_ds:space-cta-banner-type-1",
]);

/** Valid slot names per component — derived from SDC .component.yml definitions.
 *  Canvas crashes if a child references a slot its parent doesn't define. */
const COMPONENT_SLOTS: Record<string, string[]> = {
  "space_ds:space-container": ["content"],
  "space_ds:space-flexi": ["content", "column_one", "column_two", "column_three", "column_four"],
  "space_ds:space-content-detail": ["content", "image"],
  "space_ds:space-logo-section": ["content"],
  "space_ds:space-stats-kpi": ["link"],
  "space_ds:space-accordion": ["items"],
  "space_ds:space-cta-banner-type-1": ["cta_content"],
  "space_ds:space-footer": ["social_links", "columns", "footer_bottom_links", "cookie_section"],
  "space_ds:space-header": ["logo", "navigation", "links"],
  "space_ds:space-hero-banner-style-02": ["content", "items"],
  "space_ds:space-slider": ["slide_item"],
};

/** Validate a slot name against a parent component's slot definitions.
 *  Returns the slot if valid, or the first defined slot as fallback, or null. */
function resolveSlot(parentComponentId: string, slot: string | null): string | null {
  const validSlots = COMPONENT_SLOTS[parentComponentId];
  if (!validSlots || validSlots.length === 0) return slot;
  if (slot && validSlots.includes(slot)) return slot;
  return validSlots[0];
}

/** Background colors cycled for visual rhythm across composed sections. */
const SECTION_BACKGROUNDS = ["white", "option-1", "transparent", "option-2"];

/** Map column_width string to expected number of children. */
function getColumnCount(columnWidth: string): number {
  return columnWidth.split("-").length;
}

/** Map column count to the no_of_columns enum value for space-flexi. */
const COLUMN_COUNT_NAMES: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
};

/** Slot names ordered by column index. */
const COLUMN_SLOTS = ["column_one", "column_two", "column_three", "column_four"];

/** Pattern name to flexi column_width mapping. */
const PATTERN_COLUMN_WIDTHS: Record<string, string> = {
  "text-image-split-50-50": "50-50",
  "text-image-split-66-33": "66-33",
  "image-text-split-33-66": "33-66",
  "features-grid-3col": "33-33-33",
  "features-grid-4col": "25-25-25-25",
  "stats-row": "25-25-25-25",
  "team-grid-4col": "25-25-25-25",
  "team-grid-3col": "33-33-33",
  "card-grid-3col": "33-33-33",
  "contact-info": "33-33-33",
  "full-width-text": "100",
};

// ---------------------------------------------------------------------------
// createItem — the core tree item factory
// ---------------------------------------------------------------------------

/**
 * Create a single ComponentTreeItem with Canvas-format IDs and version hash.
 *
 * Merges required prop defaults from the manifest as a safety net:
 *   manifest defaults -> intentional overrides -> user-provided inputs
 */
export function createItem(
  componentId: string,
  parentUuid: string | null,
  slot: string | null,
  inputs: Record<string, unknown>,
  label?: string
): ComponentTreeItem {
  // Layer 1: manifest-derived required prop defaults
  const manifestDefaults = MANIFEST_REQUIRED_DEFAULTS.get(componentId) ?? {};
  // Layer 2: intentional overrides (e.g., container width)
  const overrides = PROP_OVERRIDES[componentId] ?? {};
  // Layer 3: user/AI-provided inputs take final precedence
  const mergedInputs = { ...manifestDefaults, ...overrides, ...inputs };

  // Sanitize null/undefined props using manifest type info.
  const propTypes = MANIFEST_PROP_TYPES.get(componentId);
  for (const key of Object.keys(mergedInputs)) {
    const value = mergedInputs[key];
    if (value === null || value === undefined) {
      const ptype = propTypes?.get(key) ?? "string";
      if (ptype === "object" || ptype === "array") {
        delete mergedInputs[key];
      } else if (ptype === "number" || ptype === "integer") {
        mergedInputs[key] = 0;
      } else if (ptype === "boolean") {
        mergedInputs[key] = false;
      } else {
        mergedInputs[key] = "";
      }
    } else if (Array.isArray(value)) {
      mergedInputs[key] = value.filter((v) => v !== null && v !== undefined);
    } else if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (
        keys.length === 0 ||
        keys.every((k) => obj[k] === null || obj[k] === undefined)
      ) {
        delete mergedInputs[key];
      } else {
        for (const k of keys) {
          if (obj[k] === null || obj[k] === undefined) {
            delete obj[k];
          }
        }
      }
    }
  }

  // Replace "_none" with "none"
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (value === "_none") {
      mergedInputs[key] = "none";
    }
  }

  // Sanitize invalid URL values — Canvas rejects "#", "javascript:", empty strings.
  // Use "/" as fallback instead of deleting, since Canvas may require the prop.
  const URL_PROP_NAMES = /^(url|href|cite_url|button_url|link|download_paper_link)$/;
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (URL_PROP_NAMES.test(key) && typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "#" || trimmed === "" || trimmed.startsWith("javascript:")) {
        mergedInputs[key] = "/";
      }
    }
  }

  // Strip any prop not defined in the manifest
  const validProps = MANIFEST_PROP_INDEX.get(componentId);
  if (validProps) {
    for (const key of Object.keys(mergedInputs)) {
      if (!validProps.has(key)) {
        delete mergedInputs[key];
      }
    }
  }

  // Validate enum-constrained props — replace invalid values with the first allowed value
  const enumProps = MANIFEST_ENUM_INDEX.get(componentId);
  if (enumProps) {
    for (const [propName, allowed] of enumProps) {
      const val = mergedInputs[propName];
      if (val !== undefined && !allowed.has(val as string | number | boolean)) {
        mergedInputs[propName] = [...allowed][0];
      }
    }
  }

  // Fill empty/missing image props with a valid placeholder
  const imageProps = MANIFEST_IMAGE_PROPS.get(componentId);
  if (imageProps) {
    for (const propName of imageProps) {
      const val = mergedInputs[propName];
      const needsFill =
        !val ||
        val === null ||
        typeof val === "string" ||
        (typeof val === "object" &&
          !Array.isArray(val) &&
          (!(val as Record<string, unknown>).src ||
            (val as Record<string, unknown>).src === "" ||
            (val as Record<string, unknown>).src === null));
      if (needsFill) {
        mergedInputs[propName] = {
          src: PLACEHOLDER_IMAGE_PATH,
          alt: typeof val === "string" ? val : label || "Image",
          width: propName === "background_image" ? 1920 : 1080,
          height: propName === "background_image" ? 1080 : 600,
        };
      }
    }
  }

  const canvasId = toCanvasComponentId(componentId);
  const version = getComponentVersion(componentId);
  const autoLabel =
    label ??
    componentId
      .split(":")[1]
      ?.replace(/^space-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ??
    canvasId;

  return {
    uuid: randomUUID(),
    component_id: canvasId,
    component_version: version,
    parent_uuid: parentUuid,
    slot,
    inputs: mergedInputs,
    label: autoLabel,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Derive a human-readable label from a component ID. */
function labelFromId(componentId: string): string {
  return (
    componentId
      .split(":")[1]
      ?.replace(/^space-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? componentId
  );
}

/** Wrap child ComponentTreeItems inside a space-container at root level. */
function wrapInContainer(
  children: ComponentTreeItem[],
  background?: string,
  label?: string
): ComponentTreeItem[] {
  const container = createItem(
    "space_ds:space-container",
    null,
    null,
    {
      width: "boxed-width",
      padding_top: "large",
      padding_bottom: "large",
      ...(background && background !== "transparent"
        ? { background_color: background }
        : {}),
    },
    label ? `Container: ${label}` : "Container"
  );

  const reparented = children.map((child) => ({
    ...child,
    parent_uuid: child.parent_uuid === null ? container.uuid : child.parent_uuid,
  }));

  return [container, ...reparented];
}

/** Create a space-section-heading item parented to the given UUID. */
function createSectionHeading(
  parentUuid: string,
  heading: { title: string; label?: string; description?: string; alignment?: string },
  tagName: string = "h2"
): ComponentTreeItem {
  const inputs: Record<string, unknown> = {
    title: heading.title,
    tag_name: tagName,
  };
  if (heading.label) inputs.label = heading.label;
  if (heading.description) inputs.description = heading.description;
  if (heading.alignment) inputs.alignment = heading.alignment;

  return createItem(
    "space_ds:space-section-heading",
    parentUuid,
    "content",
    inputs,
    `Section Heading: ${heading.title}`
  );
}

// ---------------------------------------------------------------------------
// Header / Footer Builders
// ---------------------------------------------------------------------------

/**
 * Build a Canvas-ready component tree for the site header.
 *
 * Structure:
 *   space-header (root)
 *     space-image (slot="logo")
 *     space-link x N (slot="navigation")
 *     space-button (slot="links") — CTA
 */
export function buildHeaderTree(data: HeaderData): ComponentTreeItem[] {
  const { siteName, logo, pages, ctaText, ctaUrl, menuAlign = "center" } = data;

  const header = createItem(
    "space_ds:space-header",
    null,
    null,
    { menu_align: menuAlign },
    "Header"
  );

  const items: ComponentTreeItem[] = [header];

  // Logo slot
  if (logo?.url) {
    items.push(
      createItem(
        "space_ds:space-image",
        header.uuid,
        "logo",
        {
          image: {
            src: logo.url,
            alt: logo.alt || `${siteName} logo`,
            width: 160,
            height: 40,
          },
        },
        "Site Logo"
      )
    );
  }

  // Navigation slot — one link per page
  for (const page of pages) {
    items.push(
      createItem(
        "space_ds:space-link",
        header.uuid,
        "navigation",
        { text: page.title, url: `/${page.slug}` },
        `Nav: ${page.title}`
      )
    );
  }

  // CTA button slot
  if (ctaText && ctaUrl) {
    items.push(
      createItem(
        "space_ds:space-button",
        header.uuid,
        "links",
        { text: ctaText, url: ctaUrl, size: "small", variant: "primary" },
        "Header CTA"
      )
    );
  }

  return items;
}

/**
 * Build a Canvas-ready component tree for the site footer.
 *
 * Structure:
 *   space-footer (root, brand props populated)
 *     space-link x N (slot="columns")
 *     space-link x N (slot="social_links")
 *     space-link x N (slot="footer_bottom_links")
 */
export function buildFooterTree(data: FooterData): ComponentTreeItem[] {
  const {
    siteName,
    tagline,
    brandDescription = "",
    disclaimer,
    navLinks = [],
    socialLinks = [],
    legalLinks = [],
  } = data;

  const currentYear = new Date().getFullYear();

  const footer = createItem(
    "space_ds:space-footer",
    null,
    null,
    {
      brand_name: siteName,
      brand_slogan: tagline || "",
      brand_description: brandDescription,
      copyright: `\u00A9 ${currentYear} ${siteName}. All rights reserved.`,
      ...(disclaimer ? { disclaimer } : {}),
    },
    "Footer"
  );

  const items: ComponentTreeItem[] = [footer];

  // Navigation links in columns slot
  for (const link of navLinks) {
    items.push(
      createItem(
        "space_ds:space-link",
        footer.uuid,
        "columns",
        { text: link.title, url: link.url },
        `Footer Nav: ${link.title}`
      )
    );
  }

  // Social links slot
  for (const social of socialLinks) {
    items.push(
      createItem(
        "space_ds:space-link",
        footer.uuid,
        "social_links",
        { text: social.platform, url: social.url, icon: social.icon },
        `Social: ${social.platform}`
      )
    );
  }

  // Legal links slot
  for (const link of legalLinks) {
    items.push(
      createItem(
        "space_ds:space-link",
        footer.uuid,
        "footer_bottom_links",
        { text: link.title, url: link.url },
        `Legal: ${link.title}`
      )
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Content Section Builder (Type B: composed sections with flexi grid)
// ---------------------------------------------------------------------------

/**
 * Build tree items for a composed section using flexi grid + atoms/molecules.
 *
 * Structure:
 *   container (root, background alternation)
 *     section-heading (slot="content", if provided)
 *     flexi (slot="content", column_width from pattern)
 *       child1 (slot="column_one")
 *       child2 (slot="column_two")
 *       ...
 */
export function buildContentSection(
  pattern: string,
  children: SectionChildData[],
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const bg = options?.backgroundColor ?? "white";
  const sectionTag = options?.sectionTag ?? "h2";

  // Resolve column_width from pattern name
  let columnWidth = PATTERN_COLUMN_WIDTHS[pattern] ?? "100";

  // Adjust column_width to match actual children count
  const childCount = children.length;
  const patternCols = getColumnCount(columnWidth);
  if (childCount > 0 && childCount < patternCols) {
    const CHILD_COUNT_WIDTHS: Record<number, string> = {
      1: "100",
      2: "50-50",
      3: "33-33-33",
      4: "25-25-25-25",
    };
    columnWidth = CHILD_COUNT_WIDTHS[childCount] ?? columnWidth;
  }

  const gap = "medium";

  const label = pattern
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build the container
  const container = createItem(
    "space_ds:space-container",
    null,
    null,
    {
      width: "boxed-width",
      padding_top: "large",
      padding_bottom: "large",
      ...(bg && bg !== "transparent" ? { background_color: bg } : {}),
    },
    `Container: ${label}`
  );

  const items: ComponentTreeItem[] = [container];

  // Add section heading
  if (options?.sectionHeading) {
    items.push(
      createSectionHeading(container.uuid, options.sectionHeading, sectionTag)
    );
  }

  // Create flexi layout
  const colCount = getColumnCount(columnWidth);
  const flexi = createItem(
    "space_ds:space-flexi",
    container.uuid,
    "content",
    {
      column_width: columnWidth,
      no_of_columns: COLUMN_COUNT_NAMES[colCount] ?? "none",
      gap,
      margin_top: "small",
    },
    `Flexi: ${label}`
  );
  items.push(flexi);

  // Add children into flexi slots
  const expectedColumns = getColumnCount(columnWidth);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    let slot = child.slot ?? null;
    if (expectedColumns > 1 && i < expectedColumns && COLUMN_SLOTS[i]) {
      if (!slot || !COLUMN_SLOTS.includes(slot)) {
        slot = COLUMN_SLOTS[i];
      }
    }
    // Validate slot against space-flexi's actual slot definitions.
    slot = resolveSlot("space_ds:space-flexi", slot) ??
      (expectedColumns === 1 ? "content" : (COLUMN_SLOTS[i % expectedColumns] ?? "content"));

    const childProps = { ...child.props };

    // Set tag_name on heading children
    if (
      (child.componentId === "space_ds:space-heading" ||
        child.componentId === "space_ds:space-section-heading") &&
      !childProps.tag_name
    ) {
      const childTag = `h${Math.min(parseInt(sectionTag.replace("h", "")) + 1, 6)}`;
      childProps.tag_name = childTag;
    }

    // Ensure spacing between stacked children
    if (
      !childProps.spacing_bottom &&
      componentHasProp(child.componentId, "spacing_bottom")
    ) {
      childProps.spacing_bottom = "small";
    }

    // Space Text: remap rich_text -> text and ensure HTML wrapping
    if (child.componentId === "space_ds:space-text") {
      if (childProps.rich_text && !childProps.text) {
        childProps.text = childProps.rich_text;
        delete childProps.rich_text;
      }
      const textVal = childProps.text;
      if (typeof textVal === "string") {
        let fixed = textVal.startsWith("<") ? textVal : `<p>${textVal}</p>`;
        if (!fixed.endsWith("\n")) {
          fixed = fixed + "\n";
        }
        childProps.text = fixed;
      }
    }

    // Space Stats KPI: sub_headline must be descriptive text, not a number
    if (
      child.componentId === "space_ds:space-stats-kpi" &&
      typeof childProps.sub_headline === "string"
    ) {
      if (/^\d[\d,.%+]*$/.test(childProps.sub_headline.trim())) {
        const origTitle = childProps.title;
        childProps.title = childProps.sub_headline;
        childProps.sub_headline = typeof origTitle === "string" ? origTitle : "";
      }
    }

    items.push(
      createItem(
        child.componentId,
        flexi.uuid,
        slot,
        childProps,
        labelFromId(child.componentId)
      )
    );
  }

  // Fill empty columns with placeholder text
  if (expectedColumns > 1) {
    const usedSlots = new Set<string>();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      let slot = child.slot ?? null;
      if (i < expectedColumns && COLUMN_SLOTS[i]) {
        if (!slot || !COLUMN_SLOTS.includes(slot)) {
          slot = COLUMN_SLOTS[i];
        }
      }
      if (slot) usedSlots.add(slot);
    }
    for (let col = 0; col < expectedColumns; col++) {
      const colSlot = COLUMN_SLOTS[col];
      if (colSlot && !usedSlots.has(colSlot)) {
        items.push(
          createItem(
            "space_ds:space-text",
            flexi.uuid,
            colSlot,
            { text: "<p></p>\n" },
            `Placeholder: ${colSlot}`
          )
        );
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Organism Section Builder (Type A: heroes, CTA, accordion, slider)
// ---------------------------------------------------------------------------

/**
 * Build tree items for an organism section.
 *
 * Full-width organisms (heroes, CTA, video-banner) are placed at root level.
 * Container-wrapped organisms (accordion, slider) get a space-container parent.
 */
export function buildOrganismSection(
  componentId: string,
  props: Record<string, unknown>,
  children?: SectionChildData[],
  sectionTag: string = "h2"
): ComponentTreeItem[] {
  const isFullWidth = FULL_WIDTH_ORGANISMS.has(componentId);
  const label = labelFromId(componentId);
  const inputs = { ...props };

  // Only set tag_name on components that actually define it
  if (!("tag_name" in inputs) && componentHasProp(componentId, "tag_name")) {
    inputs.tag_name = sectionTag;
  }

  if (isFullWidth) {
    const organism = createItem(componentId, null, null, inputs, label);
    const items: ComponentTreeItem[] = [organism];

    if (children?.length) {
      for (const child of children) {
        if (child.componentId === componentId) continue;
        items.push(
          createItem(
            child.componentId,
            organism.uuid,
            resolveSlot(componentId, child.slot ?? null),
            { ...child.props },
            labelFromId(child.componentId)
          )
        );
      }
    }

    return items;
  }

  // Container-wrapped organism
  const organism = createItem(componentId, null, "content", inputs, label);
  const childItems: ComponentTreeItem[] = [organism];

  if (children?.length) {
    for (const child of children) {
      if (child.componentId === componentId) continue;
      childItems.push(
        createItem(
          child.componentId,
          organism.uuid,
          resolveSlot(componentId, child.slot ?? null),
          { ...child.props },
          labelFromId(child.componentId)
        )
      );
    }
  }

  return wrapInContainer(childItems, undefined, label);
}

/**
 * Build tree items for a hero section.
 * Alias for buildOrganismSection — heroes are always organisms.
 */
export function buildHeroSection(
  componentId: string,
  props: Record<string, unknown>,
  children?: SectionChildData[],
  sectionTag: string = "h1"
): ComponentTreeItem[] {
  return buildOrganismSection(componentId, props, children, sectionTag);
}

/**
 * Get the list of full-width organism component IDs.
 */
export function getFullWidthOrganisms(): string[] {
  return [...FULL_WIDTH_ORGANISMS];
}

/**
 * Get the placeholder image path for the Space DS theme.
 */
export function getPlaceholderImagePath(): string {
  return PLACEHOLDER_IMAGE_PATH;
}
