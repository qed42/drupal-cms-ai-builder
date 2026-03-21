import { randomUUID } from "crypto";
import type { PageSection, PageSectionChild, ComponentTreeItem } from "./types";
import {
  toCanvasComponentId,
  getComponentVersion,
} from "./canvas-component-versions";
import { COMPOSITION_PATTERNS } from "../ai/page-design-rules";
import componentManifest from "../ai/space-component-manifest.json";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Full-width organisms that render at root level without a container wrapper.
 * Heroes and CTA banners have their own internal width control.
 */
const FULL_WIDTH_ORGANISMS = new Set([
  "space_ds:space-hero-banner-style-02",
  "space_ds:space-hero-banner-with-media",
  "space_ds:space-detail-page-hero-banner",
  "space_ds:space-video-banner",
  "space_ds:space-cta-banner-type-1",
]);

/**
 * Patterns that map to organism-level components (no flexi grid).
 * These route to buildOrganismSection instead of buildComposedSection.
 */
const ORGANISM_PATTERNS = new Set([
  "testimonials-carousel",
  "card-carousel",
  "faq-accordion",
  "logo-showcase",
]);

/**
 * Background colors cycled for visual rhythm across composed sections.
 * Can be overridden per-section via container_background.
 */
/**
 * Background colors cycled to ensure visual separation between sections.
 * No two consecutive sections should share the same background.
 */
const SECTION_BACKGROUNDS = ["white", "option-1", "transparent", "option-2"];

/**
 * Map column_width string to expected number of children.
 * E.g., "33-33-33" -> 3, "50-50" -> 2, "100" -> 1
 */
function getColumnCount(columnWidth: string): number {
  return columnWidth.split("-").length;
}

/**
 * Map column count to the no_of_columns enum value for space-flexi.
 * The column_width prop controls widths, but no_of_columns must also
 * be set to match — otherwise Canvas renders as "none" (single column).
 */
const COLUMN_COUNT_NAMES: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
};

/**
 * Slot names ordered by column index.
 */
const COLUMN_SLOTS = ["column_one", "column_two", "column_three", "column_four"];

/**
 * Pattern name to flexi column_width mapping.
 */
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
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a map of required prop defaults for every component in the manifest.
 * This is computed once at module load and used by createItem() to ensure
 * all required props have values, preventing Canvas validation failures.
 */
interface ManifestProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  enum?: (string | number | boolean)[];
  examples?: unknown[];
}

interface ManifestComponent {
  id: string;
  props: ManifestProp[];
}

function buildRequiredPropDefaults(): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();

  for (const comp of componentManifest as ManifestComponent[]) {
    const defaults: Record<string, unknown> = {};

    for (const prop of comp.props) {
      if (!prop.required) continue;

      // Use manifest default, then first enum value, then type-based fallback
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

/** Required prop defaults derived from manifest — computed once at import. */
const MANIFEST_REQUIRED_DEFAULTS = buildRequiredPropDefaults();

/**
 * Index of all prop names per component — used to guard against injecting
 * props that don't exist on a component (which causes Canvas OutOfRangeException).
 */
const MANIFEST_PROP_INDEX = new Map<string, Set<string>>();
for (const comp of componentManifest as ManifestComponent[]) {
  MANIFEST_PROP_INDEX.set(comp.id, new Set(comp.props.map((p) => p.name)));
}

/** Check if a component defines a given prop in the manifest. */
function componentHasProp(componentId: string, propName: string): boolean {
  return MANIFEST_PROP_INDEX.get(componentId)?.has(propName) ?? false;
}

/**
 * Index of image-type props per component — used to ensure all image slots
 * are filled with valid placeholders to prevent Canvas render failures.
 */
const MANIFEST_IMAGE_PROPS = new Map<string, string[]>();
for (const comp of componentManifest as ManifestComponent[]) {
  const imgProps = comp.props
    .filter((p) => p.type === "object" && (
      p.name.includes("image") || p.name.includes("logo") ||
      (p as unknown as { $ref?: string }).$ref === "json-schema-definitions://canvas.module/image"
    ))
    .map((p) => p.name);
  if (imgProps.length > 0) {
    MANIFEST_IMAGE_PROPS.set(comp.id, imgProps);
  }
}

/**
 * Intentional overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "space_ds:space-container": { width: "boxed-width" },
  "space_ds:space-heading": { alignment: "none" },
  "space_ds:space-section-heading": { alignment: "center" },
  "space_ds:space-button": { variant: "primary" },
  "space_ds:space-cta-banner-type-1": { width: "full-width", alignment: "stacked" },
};

/**
 * Create a single ComponentTreeItem with Canvas-format IDs and version hash.
 *
 * Merges required prop defaults from the manifest as a safety net:
 *   manifest defaults → intentional overrides → user-provided inputs
 */
function createItem(
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

  // Sanitize null/undefined props. For string props, replace with "" instead
  // of deleting — Canvas expects strings, not NULL. For image objects with
  // null sub-properties, strip the entire object to avoid "[canvas:image/src] NULL".
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (value === null || value === undefined) {
      // Replace null strings with "" instead of deleting — prevents NULL template errors
      mergedInputs[key] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      // Empty object or all-null-values object (e.g., { src: null, alt: null })
      if (keys.length === 0 || keys.every((k) => obj[k] === null || obj[k] === undefined)) {
        delete mergedInputs[key];
      } else {
        // Replace null sub-properties with "" for image objects
        for (const k of keys) {
          if (obj[k] === null || obj[k] === undefined) {
            obj[k] = "";
          }
        }
      }
    }
  }

  // Replace "_none" with "none" — Canvas doesn't recognize "_none"
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (value === "_none") {
      mergedInputs[key] = "none";
    }
  }

  // Deterministic guard: strip any prop not defined in the manifest.
  // Prevents Canvas OutOfRangeException when AI or tree builder injects
  // a prop that doesn't exist on the component's .component.yml schema.
  const validProps = MANIFEST_PROP_INDEX.get(componentId);
  if (validProps) {
    for (const key of Object.keys(mergedInputs)) {
      if (!validProps.has(key)) {
        delete mergedInputs[key];
      }
    }
  }

  // Fill empty/missing image props with a valid placeholder.
  // Canvas crashes with "[canvas:image/src] NULL" when image slots are empty.
  const imageProps = MANIFEST_IMAGE_PROPS.get(componentId);
  if (imageProps) {
    for (const propName of imageProps) {
      const val = mergedInputs[propName];
      if (!val || (typeof val === "object" && !Array.isArray(val) &&
          (!((val as Record<string, unknown>).src) || (val as Record<string, unknown>).src === ""))) {
        mergedInputs[propName] = {
          src: "/images/placeholder.webp",
          alt: label || "Image",
          width: propName === "background_image" ? 1920 : 800,
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

/**
 * Wrap child ComponentTreeItems inside a space-container at root level.
 * Returns [container, ...children] with parent_uuid wired up.
 */
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

  // Re-parent all children to this container
  const reparented = children.map((child) => ({
    ...child,
    parent_uuid: child.parent_uuid === null ? container.uuid : child.parent_uuid,
  }));

  return [container, ...reparented];
}

/**
 * Create a space-section-heading item parented to the given UUID.
 * Sets tag_name based on the heading hierarchy level.
 */
function createSectionHeading(
  parentUuid: string,
  heading: NonNullable<PageSection["section_heading"]>,
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

/**
 * Derive a human-readable label from a component ID.
 */
function labelFromId(componentId: string): string {
  return (
    componentId
      .split(":")[1]
      ?.replace(/^space-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? componentId
  );
}

// ---------------------------------------------------------------------------
// Organism Sections (Type A)
// ---------------------------------------------------------------------------

/**
 * Build tree items for an organism section (hero, CTA, accordion, slider).
 *
 * Full-width organisms (heroes, CTA, video-banner) are placed at root level.
 * Container-wrapped organisms (accordion, slider) get a space-container parent.
 *
 * Child components (e.g., slider slides, accordion items, CTA buttons) are
 * nested under the organism with their designated slot.
 */
function buildOrganismSection(section: PageSection, sectionTag: string = "h2"): ComponentTreeItem[] {
  const componentId = section.component_id;
  const isFullWidth = FULL_WIDTH_ORGANISMS.has(componentId);
  const label = labelFromId(componentId);
  const inputs = { ...section.props } as Record<string, unknown>;

  // Only set tag_name on components that actually define it in the manifest.
  // Heroes and banners do NOT have tag_name — only heading components do.
  if (!("tag_name" in inputs) && componentHasProp(componentId, "tag_name")) {
    inputs.tag_name = sectionTag;
  }

  if (isFullWidth) {
    // Root-level organism
    const organism = createItem(componentId, null, null, inputs, label);
    const items: ComponentTreeItem[] = [organism];

    // Add children (e.g., CTA button)
    if (section.children?.length) {
      for (const child of section.children) {
        items.push(
          createItem(
            child.component_id,
            organism.uuid,
            child.slot,
            { ...child.props },
            labelFromId(child.component_id)
          )
        );
      }
    }

    return items;
  }

  // Container-wrapped organism (accordion, slider, etc.)
  const organism = createItem(componentId, null, "content", inputs, label);
  const childItems: ComponentTreeItem[] = [organism];

  if (section.children?.length) {
    for (const child of section.children) {
      childItems.push(
        createItem(
          child.component_id,
          organism.uuid,
          child.slot,
          { ...child.props },
          labelFromId(child.component_id)
        )
      );
    }
  }

  return wrapInContainer(childItems, undefined, label);
}

// ---------------------------------------------------------------------------
// Composed Sections (Type B)
// ---------------------------------------------------------------------------

/**
 * Build tree items for a composed section using flexi grid + atoms/molecules.
 *
 * Structure:
 *   container (root, background alternation)
 *     section-heading (slot="content", if section_heading exists)
 *     flexi (slot="content", column_width from pattern)
 *       child1 (slot="column_one")
 *       child2 (slot="column_two")
 *       ...
 */
function buildComposedSection(
  section: PageSection,
  bgIndex: number,
  sectionTag: string = "h2"
): ComponentTreeItem[] {
  const patternName = section.pattern!;
  const bg =
    section.container_background ||
    SECTION_BACKGROUNDS[bgIndex % SECTION_BACKGROUNDS.length];

  // Resolve column_width from pattern name
  const columnWidth =
    PATTERN_COLUMN_WIDTHS[patternName] ??
    COMPOSITION_PATTERNS[patternName]?.layout?.column_width ??
    "100";

  const gap =
    COMPOSITION_PATTERNS[patternName]?.layout?.gap ?? "medium";

  const label = patternName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build the container first to get its UUID
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

  // Add section heading if specified — uses section-level tag
  if (section.section_heading) {
    items.push(createSectionHeading(container.uuid, section.section_heading, sectionTag));
  }

  // Create flexi layout — set both column_width and no_of_columns
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

  // Add children into flexi slots, enforcing column count match
  if (section.children?.length) {
    const expectedColumns = getColumnCount(columnWidth);
    const children = section.children;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // If the child's slot doesn't match expected columns, reassign to correct column slot
      let slot = child.slot;
      if (expectedColumns > 1 && i < expectedColumns && COLUMN_SLOTS[i]) {
        // Ensure children are distributed to matching column slots
        if (!slot || !COLUMN_SLOTS.includes(slot)) {
          slot = COLUMN_SLOTS[i];
        }
      }

      // Set tag_name on child heading components one level below the section heading
      const childProps = { ...child.props };
      if (
        (child.component_id === "space_ds:space-heading" ||
         child.component_id === "space_ds:space-section-heading") &&
        !childProps.tag_name
      ) {
        // Children are one level below section heading (e.g., h2 section → h3 children)
        const childTag = `h${Math.min(parseInt(sectionTag.replace("h", "")) + 1, 6)}`;
        childProps.tag_name = childTag;
      }

      // Ensure spacing between stacked children in column/content slots
      if (!childProps.spacing_bottom && componentHasProp(child.component_id, "spacing_bottom")) {
        childProps.spacing_bottom = "small";
      }

      // Space Text: ensure rich text field has trailing newline for proper rendering
      if (child.component_id === "space_ds:space-text" && typeof childProps.rich_text === "string") {
        if (!childProps.rich_text.endsWith("\n")) {
          childProps.rich_text = childProps.rich_text + "\n";
        }
      }

      // Space Stats KPI: sub_headline must be descriptive text, not a number
      if (child.component_id === "space_ds:space-stats-kpi" && typeof childProps.sub_headline === "string") {
        // If sub_headline looks like a number/stat, swap with title
        if (/^\d[\d,.%+]*$/.test(childProps.sub_headline.trim())) {
          const origTitle = childProps.title;
          childProps.title = childProps.sub_headline;
          childProps.sub_headline = typeof origTitle === "string" ? origTitle : "";
        }
      }

      items.push(
        createItem(
          child.component_id,
          flexi.uuid,
          slot,
          childProps,
          labelFromId(child.component_id)
        )
      );
    }

    // Multi-column (2+): ensure identical component types across columns.
    // If children have mixed types, normalize to the most common one.
    if (expectedColumns > 1 && children.length >= expectedColumns) {
      const typeCount = new Map<string, number>();
      for (const child of children) {
        typeCount.set(child.component_id, (typeCount.get(child.component_id) || 0) + 1);
      }
      // Find the dominant component type
      let dominant = children[0].component_id;
      let maxCount = 0;
      for (const [type, count] of typeCount) {
        if (count > maxCount) { dominant = type; maxCount = count; }
      }
      // Replace outliers with the dominant type (keep their props)
      if (typeCount.size > 1) {
        const lastIdx = items.length;
        // Walk back through just-added child items and fix component_id
        for (let j = lastIdx - children.length; j < lastIdx; j++) {
          if (items[j] && items[j].component_id !== toCanvasComponentId(dominant)) {
            const fixed = createItem(
              dominant,
              flexi.uuid,
              items[j].slot,
              items[j].inputs,
              items[j].label
            );
            fixed.parent_uuid = items[j].parent_uuid;
            items[j] = fixed;
          }
        }
      }
    }

    // Multi-column: ensure no empty columns — fill gaps with placeholder text
    if (expectedColumns > 1) {
      const usedSlots = new Set(children.map((c, i) => {
        if (i < expectedColumns && COLUMN_SLOTS[i]) return COLUMN_SLOTS[i];
        return c.slot;
      }));
      for (let col = 0; col < expectedColumns; col++) {
        const colSlot = COLUMN_SLOTS[col];
        if (colSlot && !usedSlots.has(colSlot)) {
          items.push(
            createItem(
              "space_ds:space-text",
              flexi.uuid,
              colSlot,
              { rich_text: "\n" },
              `Placeholder: ${colSlot}`
            )
          );
        }
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a Canvas-ready flat component tree from a page's sections array.
 *
 * Handles two section types:
 *   A. Organism sections — heroes, CTA banners, accordions, sliders
 *   B. Composed sections — flexi grid layouts with atoms/molecules in slots
 *
 * The output is a flat array of ComponentTreeItems linked by parent_uuid/slot
 * relationships, ready for BlueprintImportService.php's prepareComponentTree().
 */
export function buildComponentTree(
  sections: PageSection[]
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];
  let bgIndex = 0;
  let prevPattern: string | undefined;

  /**
   * Anti-monotony: text-image patterns that can be swapped to alternate
   * image position when two similar patterns appear consecutively.
   */
  const TEXT_IMAGE_ALTERNATES: Record<string, string> = {
    "text-image-split-50-50": "image-text-split-33-66",
    "text-image-split-66-33": "image-text-split-33-66",
    "image-text-split-33-66": "text-image-split-66-33",
  };

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    let currentPattern = section.pattern ?? section.component_id;

    // Heading hierarchy: first section gets h1, all others get h2.
    // Child components of h2 sections get h3 (handled in buildComposedSection).
    const sectionTag = sIdx === 0 ? "h1" : "h2";

    // Anti-monotony: if this pattern matches the previous one, try to swap
    if (currentPattern && currentPattern === prevPattern && section.pattern) {
      const alternate = TEXT_IMAGE_ALTERNATES[section.pattern];
      if (alternate && PATTERN_COLUMN_WIDTHS[alternate]) {
        section.pattern = alternate;
        currentPattern = alternate;
      }
    }

    // Check if this is a pattern that routes to organism handling
    if (section.pattern && ORGANISM_PATTERNS.has(section.pattern)) {
      // Map organism patterns to their component_id if not already set
      const organismSection = mapOrganismPattern(section);
      items.push(...buildOrganismSection(organismSection, sectionTag));
    } else if (section.pattern && section.children) {
      // Type B: Composed section with flexi grid
      items.push(...buildComposedSection(section, bgIndex, sectionTag));
    } else {
      // Type A: Organism section
      items.push(...buildOrganismSection(section, sectionTag));
    }

    prevPattern = currentPattern;
    bgIndex++;
  }

  return items;
}

/**
 * Map an organism-level pattern to a proper organism section.
 * Converts pattern-based sections (testimonials-carousel, faq-accordion, etc.)
 * into organism sections with the correct component_id and children.
 */
function mapOrganismPattern(section: PageSection): PageSection {
  const patternName = section.pattern!;

  const patternToOrganism: Record<
    string,
    { component_id: string; childSlot: string }
  > = {
    "testimonials-carousel": {
      component_id: "space_ds:space-slider",
      childSlot: "slide_item",
    },
    "card-carousel": {
      component_id: "space_ds:space-slider",
      childSlot: "slide_item",
    },
    "faq-accordion": {
      component_id: "space_ds:space-accordion",
      childSlot: "content",
    },
    "logo-showcase": {
      component_id: "space_ds:space-logo-section",
      childSlot: "content",
    },
  };

  const mapping = patternToOrganism[patternName];
  if (!mapping) return section;

  // Remap children to use the organism's slot if they don't already have one
  const children: PageSectionChild[] = (section.children ?? []).map(
    (child) => ({
      ...child,
      slot: child.slot || mapping.childSlot,
    })
  );

  return {
    ...section,
    component_id: mapping.component_id,
    props: section.props ?? {},
    children,
    pattern: undefined, // Clear pattern so it routes through organism path
  };
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
 *     space-link × N (slot="navigation")
 *     space-button (slot="links") — CTA
 */
export function buildHeaderTree(
  siteName: string,
  pages: Array<{ slug: string; title: string }>,
  options?: {
    logoUrl?: string;
    menuAlign?: string;
    ctaText?: string;
    ctaUrl?: string;
  }
): ComponentTreeItem[] {
  const { logoUrl, menuAlign = "center", ctaText, ctaUrl } = options ?? {};

  const header = createItem(
    "space_ds:space-header",
    null,
    null,
    { menu_align: menuAlign },
    "Header"
  );

  const items: ComponentTreeItem[] = [header];

  // Logo slot
  if (logoUrl) {
    items.push(
      createItem(
        "space_ds:space-image",
        header.uuid,
        "logo",
        { image: { src: logoUrl, alt: `${siteName} logo`, width: 160, height: 40 } },
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
 *     space-link × N (slot="social_links")
 *     space-link × N (slot="footer_bottom_links")
 */
export function buildFooterTree(
  site: { name: string; tagline?: string },
  options?: {
    brandDescription?: string;
    disclaimer?: string;
    navLinks?: Array<{ title: string; url: string }>;
    socialLinks?: Array<{ platform: string; url: string; icon: string }>;
    legalLinks?: Array<{ title: string; url: string }>;
  }
): ComponentTreeItem[] {
  const {
    brandDescription = "",
    disclaimer,
    navLinks = [],
    socialLinks = [],
    legalLinks = [],
  } = options ?? {};

  const currentYear = new Date().getFullYear();

  const footer = createItem(
    "space_ds:space-footer",
    null,
    null,
    {
      brand_name: site.name,
      brand_slogan: site.tagline || "",
      brand_description: brandDescription,
      copyright: `© ${currentYear} ${site.name}. All rights reserved.`,
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

  // Social links slot (with Phosphor icon names)
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

  // Legal links slot (footer_bottom_links)
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
