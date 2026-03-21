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
      if (!prop.required) continue;
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

/** Placeholder image path within the Mercury theme. */
const PLACEHOLDER_IMAGE_PATH =
  "/themes/contrib/mercury/images/placeholder.jpg";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Full-width organisms that render at root level without a section wrapper. */
const FULL_WIDTH_ORGANISMS = new Set([
  "mercury:hero-billboard",
  "mercury:hero-side-by-side",
  "mercury:hero-blog",
  "mercury:cta",
]);

/** Background colors cycled for visual rhythm across composed sections. */
const SECTION_BACKGROUNDS = ["transparent", "muted", "background", "transparent"];

/**
 * Pattern name to section columns mapping.
 * Mercury's section combines container + grid, so patterns map directly to column splits.
 */
const PATTERN_COLUMN_WIDTHS: Record<string, string> = {
  "text-image-split-50-50": "50-50",
  "text-image-split-67-33": "67-33",
  "image-text-split-33-67": "33-67",
  "features-grid-3col": "33-33-33",
  "features-grid-4col": "25-25-25-25",
  "testimonials-grid-3col": "33-33-33",
  "team-grid-4col": "25-25-25-25",
  "team-grid-3col": "33-33-33",
  "card-grid-3col": "33-33-33",
  "card-grid-2col": "50-50",
  "pricing-grid-3col": "33-33-33",
  "contact-info": "33-33-33",
  "logo-showcase": "25-25-25-25",
  "full-width-text": "100",
};

/** Map column_width string to expected number of children. */
function getColumnCount(columnWidth: string): number {
  return columnWidth.split("-").length;
}

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
  // Layer 2: intentional overrides (e.g., section width)
  const overrides = PROP_OVERRIDES[componentId] ?? {};
  // Layer 3: user/AI-provided inputs take final precedence
  const mergedInputs = { ...manifestDefaults, ...overrides, ...inputs };

  // Sanitize null/undefined props
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (value === null || value === undefined) {
      mergedInputs[key] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
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
            obj[k] = "";
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

  // Strip any prop not defined in the manifest
  const validProps = MANIFEST_PROP_INDEX.get(componentId);
  if (validProps) {
    for (const key of Object.keys(mergedInputs)) {
      if (!validProps.has(key)) {
        delete mergedInputs[key];
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
      ?.replace(/-/g, " ")
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
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? componentId
  );
}

/** Create a section heading placed in the header_slot of a section. */
function createSectionHeading(
  parentUuid: string,
  heading: { title: string; label?: string; description?: string; alignment?: string },
  tagName: string = "h2"
): ComponentTreeItem {
  return createItem(
    "mercury:heading",
    parentUuid,
    "header_slot",
    {
      text: heading.title,
      level: tagName,
      size: "xl",
      align: heading.alignment ?? "left",
    },
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
 *   mercury:navbar (root)
 *     mercury:image (slot="logo")
 *     mercury:button x N (slot="navigation") — nav links as ghost buttons
 *     mercury:button (slot="links") — CTA
 */
export function buildHeaderTree(data: HeaderData): ComponentTreeItem[] {
  const { siteName, logo, pages, ctaText, ctaUrl } = data;

  const navbar = createItem(
    "mercury:navbar",
    null,
    null,
    {},
    "Navbar"
  );

  const items: ComponentTreeItem[] = [navbar];

  // Logo slot
  if (logo?.url) {
    items.push(
      createItem(
        "mercury:image",
        navbar.uuid,
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

  // Navigation slot — one button (link variant) per page
  for (const page of pages) {
    items.push(
      createItem(
        "mercury:button",
        navbar.uuid,
        "navigation",
        { text: page.title, url: `/${page.slug}`, variant: "link", size: "sm" },
        `Nav: ${page.title}`
      )
    );
  }

  // CTA button slot
  if (ctaText && ctaUrl) {
    items.push(
      createItem(
        "mercury:button",
        navbar.uuid,
        "links",
        { text: ctaText, url: ctaUrl, variant: "primary", size: "sm" },
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
 *   mercury:footer (root, brand props populated)
 *     mercury:image (slot="branding")
 *     mercury:button x N (slot="utility_links") — nav links
 *     mercury:button x N (slot="cta_slot") — CTA or newsletter
 *     mercury:button x N (slot="copyright") — legal links
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
    "mercury:footer",
    null,
    null,
    {
      brand_name: siteName,
      brand_description: brandDescription || tagline || "",
      copyright: `\u00A9 ${currentYear} ${siteName}. All rights reserved.`,
    },
    "Footer"
  );

  const items: ComponentTreeItem[] = [footer];

  // Utility links slot — navigation links
  for (const link of navLinks) {
    items.push(
      createItem(
        "mercury:button",
        footer.uuid,
        "utility_links",
        { text: link.title, url: link.url, variant: "link", size: "sm" },
        `Footer Nav: ${link.title}`
      )
    );
  }

  // Social links in utility_links slot
  for (const social of socialLinks) {
    items.push(
      createItem(
        "mercury:button",
        footer.uuid,
        "utility_links",
        {
          text: social.platform,
          url: social.url,
          variant: "ghost",
          size: "sm",
          icon_left: social.icon,
        },
        `Social: ${social.platform}`
      )
    );
  }

  // Legal links in copyright slot
  for (const link of legalLinks) {
    items.push(
      createItem(
        "mercury:button",
        footer.uuid,
        "copyright",
        { text: link.title, url: link.url, variant: "link", size: "sm" },
        `Legal: ${link.title}`
      )
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Content Section Builder (composed sections with mercury:section grid)
// ---------------------------------------------------------------------------

/**
 * Build tree items for a composed section using mercury:section.
 *
 * KEY DIFFERENCE from Space DS: Mercury's section combines container AND grid.
 * So there is no separate container -> flexi wrapper. Instead:
 *
 *   section(columns: "50-50", background_color: ...)
 *     heading (slot="header_slot", if provided)
 *     child1 (slot="main_slot")
 *     child2 (slot="main_slot")
 *     ...
 */
export function buildContentSection(
  pattern: string,
  children: SectionChildData[],
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const bg = options?.backgroundColor ?? "transparent";
  const sectionTag = options?.sectionTag ?? "h2";

  // Resolve columns from pattern name
  let columns = PATTERN_COLUMN_WIDTHS[pattern] ?? "100";

  // Adjust columns to match actual children count
  const childCount = children.length;
  const patternCols = getColumnCount(columns);
  if (childCount > 0 && childCount < patternCols) {
    const CHILD_COUNT_WIDTHS: Record<number, string> = {
      1: "100",
      2: "50-50",
      3: "33-33-33",
      4: "25-25-25-25",
    };
    columns = CHILD_COUNT_WIDTHS[childCount] ?? columns;
  }

  const label = pattern
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build the section (combined container + grid)
  const section = createItem(
    "mercury:section",
    null,
    null,
    {
      columns,
      width: "boxed",
      padding_block_start: "lg",
      padding_block_end: "lg",
      ...(bg && bg !== "transparent" ? { background_color: bg } : {}),
    },
    `Section: ${label}`
  );

  const items: ComponentTreeItem[] = [section];

  // Add section heading in header_slot
  if (options?.sectionHeading) {
    items.push(
      createSectionHeading(section.uuid, options.sectionHeading, sectionTag)
    );
  }

  // Add children into main_slot
  for (const child of children) {
    const childProps = { ...child.props };

    // Set level on heading children
    if (child.componentId === "mercury:heading" && !childProps.level) {
      const childLevel = `h${Math.min(parseInt(sectionTag.replace("h", "")) + 1, 6)}`;
      childProps.level = childLevel;
    }

    // Mercury Text: ensure HTML wrapping of content prop
    if (child.componentId === "mercury:text") {
      // Remap common aliases
      if (childProps.rich_text && !childProps.content) {
        childProps.content = childProps.rich_text;
        delete childProps.rich_text;
      }
      if (childProps.text && !childProps.content) {
        childProps.content = childProps.text;
        delete childProps.text;
      }
      const textVal = childProps.content;
      if (typeof textVal === "string" && !textVal.startsWith("<")) {
        childProps.content = `<p>${textVal}</p>`;
      }
    }

    items.push(
      createItem(
        child.componentId,
        section.uuid,
        child.slot ?? "main_slot",
        childProps,
        labelFromId(child.componentId)
      )
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Organism Section Builder (heroes, CTA, accordion)
// ---------------------------------------------------------------------------

/**
 * Build tree items for an organism section.
 *
 * Full-width organisms (heroes, CTA) are placed at root level.
 * Container-wrapped organisms (accordion) get a mercury:section parent.
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

  // Set level on components that support it
  if (!("level" in inputs) && componentHasProp(componentId, "level")) {
    inputs.level = sectionTag;
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
            child.slot ?? "hero_slot",
            { ...child.props },
            labelFromId(child.componentId)
          )
        );
      }
    }

    return items;
  }

  // Container-wrapped organism (e.g., accordion-container)
  const section = createItem(
    "mercury:section",
    null,
    null,
    {
      columns: "100",
      width: "boxed",
      padding_block_start: "lg",
      padding_block_end: "lg",
    },
    `Section: ${label}`
  );

  const organism = createItem(
    componentId,
    section.uuid,
    "main_slot",
    inputs,
    label
  );

  const items: ComponentTreeItem[] = [section, organism];

  if (children?.length) {
    for (const child of children) {
      if (child.componentId === componentId) continue;
      items.push(
        createItem(
          child.componentId,
          organism.uuid,
          child.slot ?? "content",
          { ...child.props },
          labelFromId(child.componentId)
        )
      );
    }
  }

  return items;
}

/**
 * Build tree items for a hero section.
 *
 * Mercury heroes are full-width organisms with a hero_slot for child content
 * (headings, text, buttons). hero-blog is props-only (no slot).
 */
export function buildHeroSection(
  componentId: string,
  props: Record<string, unknown>,
  children?: SectionChildData[],
  sectionTag: string = "h1"
): ComponentTreeItem[] {
  // hero-blog is props-only, no slots
  if (componentId === "mercury:hero-blog") {
    const hero = createItem(componentId, null, null, props, "Hero Blog");
    return [hero];
  }

  // hero-billboard and hero-side-by-side have hero_slot
  const hero = createItem(componentId, null, null, props, labelFromId(componentId));
  const items: ComponentTreeItem[] = [hero];

  if (children?.length) {
    for (const child of children) {
      if (child.componentId === componentId) continue;
      const childProps = { ...child.props };

      // Set heading level for hero child headings
      if (child.componentId === "mercury:heading" && !childProps.level) {
        childProps.level = sectionTag;
        if (!childProps.size) {
          childProps.size = "4xl";
        }
      }

      items.push(
        createItem(
          child.componentId,
          hero.uuid,
          child.slot ?? "hero_slot",
          childProps,
          labelFromId(child.componentId)
        )
      );
    }
  }

  return items;
}

/**
 * Get the list of full-width organism component IDs.
 */
export function getFullWidthOrganisms(): string[] {
  return [...FULL_WIDTH_ORGANISMS];
}

/**
 * Get the placeholder image path for the Mercury theme.
 */
export function getPlaceholderImagePath(): string {
  return PLACEHOLDER_IMAGE_PATH;
}
