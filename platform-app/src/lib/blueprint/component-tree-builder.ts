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
const SECTION_BACKGROUNDS = ["transparent", "option-1", "white", "option-2"];

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
 * Intentional overrides where our desired default differs from the manifest.
 * These take precedence over manifest defaults but are overridden by user input.
 */
const PROP_OVERRIDES: Record<string, Record<string, unknown>> = {
  "space_ds:space-container": { width: "boxed-width" },
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

  // Strip null/undefined/empty-object props so Canvas uses component defaults.
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (value === null || value === undefined) {
      delete mergedInputs[key];
    } else if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0) {
      delete mergedInputs[key];
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
 */
function createSectionHeading(
  parentUuid: string,
  heading: NonNullable<PageSection["section_heading"]>
): ComponentTreeItem {
  const inputs: Record<string, unknown> = {
    title: heading.title,
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
function buildOrganismSection(section: PageSection): ComponentTreeItem[] {
  const componentId = section.component_id;
  const isFullWidth = FULL_WIDTH_ORGANISMS.has(componentId);
  const label = labelFromId(componentId);
  const inputs = { ...section.props } as Record<string, unknown>;

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
  bgIndex: number
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

  // Add section heading if specified
  if (section.section_heading) {
    items.push(createSectionHeading(container.uuid, section.section_heading));
  }

  // Create flexi layout
  const flexi = createItem(
    "space_ds:space-flexi",
    container.uuid,
    "content",
    {
      column_width: columnWidth,
      gap,
    },
    `Flexi: ${label}`
  );
  items.push(flexi);

  // Add children into flexi slots
  if (section.children?.length) {
    for (const child of section.children) {
      items.push(
        createItem(
          child.component_id,
          flexi.uuid,
          child.slot,
          { ...child.props },
          labelFromId(child.component_id)
        )
      );
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

  for (const section of sections) {
    // Check if this is a pattern that routes to organism handling
    if (section.pattern && ORGANISM_PATTERNS.has(section.pattern)) {
      // Map organism patterns to their component_id if not already set
      const organismSection = mapOrganismPattern(section);
      items.push(...buildOrganismSection(organismSection));
    } else if (section.pattern && section.children) {
      // Type B: Composed section with flexi grid
      items.push(...buildComposedSection(section, bgIndex));
    } else {
      // Type A: Organism section
      items.push(...buildOrganismSection(section));
    }
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
    socialLinks?: Array<{ platform: string; url: string; icon: string }>;
    legalLinks?: Array<{ title: string; url: string }>;
  }
): ComponentTreeItem[] {
  const {
    brandDescription = "",
    disclaimer,
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

  // Social links slot
  for (const social of socialLinks) {
    items.push(
      createItem(
        "space_ds:space-link",
        footer.uuid,
        "social_links",
        { text: social.platform, url: social.url },
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
