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
        (p as unknown as { $ref?: string }).$ref ===
          "json-schema-definitions://canvas.module/image"
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
      // encounters missing keys. Canvas iterates every schema-defined prop
      // and crashes with null if the key is absent from inputs.
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
      // object/array types intentionally omitted — Canvas handles absent
      // objects gracefully, but chokes on null scalars.
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

/** Default child slot per organism — ensures children go to the correct SDC slot. */
const ORGANISM_CHILD_SLOT: Record<string, string> = {
  "mercury:hero-billboard": "hero_slot",
  "mercury:hero-side-by-side": "hero_slot",
  "mercury:cta": "actions",
  "mercury:accordion-container": "accordion_content",
  "mercury:accordion": "accordion_content",
};

/** Background colors cycled for visual rhythm across composed sections. */
const SECTION_BACKGROUNDS = ["transparent", "muted", "transparent"];

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

  // Sanitize null/undefined props using manifest type info.
  // - String/number/boolean: null → "" / 0 / false (Canvas expects the key to exist)
  // - Object/array: null → delete (Canvas breaks on "" where it expects {}/[])
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
          width: propName === "background_media" ? 1920 : 1080,
          height: propName === "background_media" ? 1080 : 600,
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
  tagLevel: number = 2
): ComponentTreeItem {
  return createItem(
    "mercury:heading",
    parentUuid,
    "header_slot",
    {
      heading_text: heading.title,
      level: tagLevel,
      text_size: "heading-responsive-3xl",
      text_color: "default",
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
 *     mercury:button x N (slot="navigation") — nav links as secondary-inverted buttons
 *     mercury:button (slot="links") — CTA
 */
export function buildHeaderTree(data: HeaderData): ComponentTreeItem[] {
  const { siteName, logo, pages, ctaText, ctaUrl } = data;

  const navbar = createItem(
    "mercury:navbar",
    null,
    null,
    { menu_align: "center" },
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
          media: {
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

  // Navigation slot — one button per page
  for (const page of pages) {
    items.push(
      createItem(
        "mercury:button",
        navbar.uuid,
        "navigation",
        { label: page.title, href: `/${page.slug}`, variant: "secondary-inverted", size: "small" },
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
        { label: ctaText, href: ctaUrl, variant: "primary", size: "small" },
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
 *   mercury:footer (root)
 *     mercury:group (slot="footer_first") — brand (vertical)
 *       mercury:text (group_slot) — site name + description
 *     mercury:group (slot="footer_utility_first") — nav + social links (horizontal)
 *       mercury:button x N (group_slot) — plain links (secondary-inverted)
 *     mercury:group (slot="footer_last") — CTAs (horizontal)
 *       mercury:button (group_slot) — primary CTA
 *       mercury:button (group_slot) — secondary CTA
 *     mercury:group (slot="footer_utility_last") — legal + copyright (horizontal)
 *       mercury:button x N (group_slot) — plain links
 *       mercury:text (group_slot) — copyright
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
    ctaPrimary,
    ctaSecondary,
  } = data;

  const currentYear = new Date().getFullYear();

  const footer = createItem(
    "mercury:footer",
    null,
    null,
    { align: true },
    "Footer"
  );

  const items: ComponentTreeItem[] = [footer];

  // ── Brand description (footer_first, vertical) ──
  const brandText = brandDescription || tagline || siteName;
  if (brandText) {
    const brandGroup = createItem(
      "mercury:group",
      footer.uuid,
      "footer_first",
      { flex_direction: "column", flex_gap: "sm", flex_align: "start", items_align: "start" },
      "Brand Group"
    );
    items.push(brandGroup);

    items.push(
      createItem(
        "mercury:text",
        brandGroup.uuid,
        "group_slot",
        {
          text: `<p><strong>${siteName}</strong></p><p>${brandText}</p>`,
          text_size: "normal",
          text_color: "default",
        },
        "Footer Branding"
      )
    );
  }

  // ── Navigation + social links (footer_utility_first, horizontal) ──
  if (navLinks.length > 0 || socialLinks.length > 0) {
    const linksGroup = createItem(
      "mercury:group",
      footer.uuid,
      "footer_utility_first",
      { flex_direction: "row", flex_gap: "md", flex_align: "center", items_align: "center" },
      "Footer Links"
    );
    items.push(linksGroup);

    for (const link of navLinks) {
      items.push(
        createItem(
          "mercury:button",
          linksGroup.uuid,
          "group_slot",
          { label: link.title, href: link.url, variant: "secondary-inverted", size: "small" },
          `Footer Nav: ${link.title}`
        )
      );
    }

    for (const social of socialLinks) {
      items.push(
        createItem(
          "mercury:button",
          linksGroup.uuid,
          "group_slot",
          { label: social.platform, href: social.url, variant: "secondary-inverted", size: "small" },
          `Social: ${social.platform}`
        )
      );
    }
  }

  // ── CTAs (footer_last, horizontal) — 1 primary + 1 secondary ──
  const primaryCta = ctaPrimary ?? (navLinks.length > 0 ? { label: "Contact Us", url: "/contact" } : undefined);
  const secondaryCta = ctaSecondary ?? (navLinks.length > 0 ? { label: "About Us", url: "/about" } : undefined);

  if (primaryCta || secondaryCta) {
    const ctaGroup = createItem(
      "mercury:group",
      footer.uuid,
      "footer_last",
      { flex_direction: "row", flex_gap: "md", flex_align: "center", items_align: "center" },
      "Footer CTAs"
    );
    items.push(ctaGroup);

    if (primaryCta) {
      items.push(
        createItem(
          "mercury:button",
          ctaGroup.uuid,
          "group_slot",
          { label: primaryCta.label, href: primaryCta.url, variant: "primary", size: "medium" },
          "Footer Primary CTA"
        )
      );
    }

    if (secondaryCta) {
      items.push(
        createItem(
          "mercury:button",
          ctaGroup.uuid,
          "group_slot",
          { label: secondaryCta.label, href: secondaryCta.url, variant: "secondary", size: "medium" },
          "Footer Secondary CTA"
        )
      );
    }
  }

  // ── Legal links + copyright (footer_utility_last, horizontal) ──
  const legalGroup = createItem(
    "mercury:group",
    footer.uuid,
    "footer_utility_last",
    { flex_direction: "row", flex_gap: "md", flex_align: "center", items_align: "center" },
    "Legal & Copyright"
  );
  items.push(legalGroup);

  for (const link of legalLinks) {
    items.push(
      createItem(
        "mercury:button",
        legalGroup.uuid,
        "group_slot",
        { label: link.title, href: link.url, variant: "secondary-inverted", size: "small" },
        `Legal: ${link.title}`
      )
    );
  }

  items.push(
    createItem(
      "mercury:text",
      legalGroup.uuid,
      "group_slot",
      {
        text: `<p>\u00A9 ${currentYear} ${siteName}. All rights reserved.</p>`,
        text_size: "text-sm",
        text_color: "default",
      },
      "Copyright"
    )
  );

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
  const bg = options?.backgroundColor ?? undefined;
  const sectionTagLevel = options?.sectionTag
    ? parseInt(options.sectionTag.replace("h", ""))
    : 2;

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
      width: "100%",
      mobile_columns: "1",
      padding_block_start: "32",
      padding_block_end: "32",
      margin_block_start: "0",
      margin_block_end: "0",
      ...(bg ? { background_color: bg } : {}),
    },
    `Section: ${label}`
  );

  const items: ComponentTreeItem[] = [section];

  // Add section heading in header_slot
  if (options?.sectionHeading) {
    items.push(
      createSectionHeading(section.uuid, options.sectionHeading, sectionTagLevel)
    );
  }

  // Add children into main_slot
  for (const child of children) {
    const childProps = { ...child.props };

    // Set level on heading children
    if (child.componentId === "mercury:heading" && !childProps.level) {
      childProps.level = Math.min(sectionTagLevel + 1, 6);
      if (!childProps.text_size) {
        childProps.text_size = "heading-responsive-2xl";
      }
      if (!childProps.text_color) {
        childProps.text_color = "default";
      }
      if (!childProps.align) {
        childProps.align = "left";
      }
    }

    // Mercury Text: ensure the prop is "text" and HTML-wrapped
    if (child.componentId === "mercury:text") {
      // Remap common aliases
      if (childProps.rich_text && !childProps.text) {
        childProps.text = childProps.rich_text;
        delete childProps.rich_text;
      }
      if (childProps.content && !childProps.text) {
        childProps.text = childProps.content;
        delete childProps.content;
      }
      const textVal = childProps.text;
      if (typeof textVal === "string" && !textVal.startsWith("<")) {
        childProps.text = `<p>${textVal}</p>`;
      }
      if (!childProps.text_size) {
        childProps.text_size = "normal";
      }
      if (!childProps.text_color) {
        childProps.text_color = "default";
      }
    }

    items.push(
      createItem(
        child.componentId,
        section.uuid,
        "main_slot",
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
    inputs.level = parseInt(sectionTag.replace("h", "")) || 2;
  }

  if (isFullWidth) {
    const organism = createItem(componentId, null, null, inputs, label);
    const items: ComponentTreeItem[] = [organism];

    if (children?.length) {
      const defaultSlot = ORGANISM_CHILD_SLOT[componentId] ?? "hero_slot";
      for (const child of children) {
        if (child.componentId === componentId) continue;
        items.push(
          createItem(
            child.componentId,
            organism.uuid,
            defaultSlot,
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
      width: "100%",
      mobile_columns: "1",
      padding_block_start: "32",
      padding_block_end: "32",
      margin_block_start: "0",
      margin_block_end: "0",
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
    const defaultSlot = ORGANISM_CHILD_SLOT[componentId] ?? "accordion_content";
    for (const child of children) {
      if (child.componentId === componentId) continue;
      items.push(
        createItem(
          child.componentId,
          organism.uuid,
          defaultSlot,
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
  const tagLevel = parseInt(sectionTag.replace("h", "")) || 1;

  // hero-blog is props-only, no slots
  if (componentId === "mercury:hero-blog") {
    const blogProps = { ...props };
    if (!blogProps.level) {
      blogProps.level = tagLevel;
    }
    const hero = createItem(componentId, null, null, blogProps, "Hero Blog");
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
        childProps.level = tagLevel;
        if (!childProps.text_size) {
          childProps.text_size = "heading-responsive-5xl";
        }
        if (!childProps.text_color) {
          childProps.text_color = "default";
        }
        if (!childProps.align) {
          childProps.align = "left";
        }
      }

      items.push(
        createItem(
          child.componentId,
          hero.uuid,
          "hero_slot",
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
