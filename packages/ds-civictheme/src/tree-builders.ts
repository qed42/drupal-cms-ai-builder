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

/** Placeholder image path within the CivicTheme theme. */
const PLACEHOLDER_IMAGE_PATH =
  "/themes/contrib/civictheme/assets/images/placeholder.png";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Full-width organisms that render at root level without wrapping. */
const FULL_WIDTH_ORGANISMS = new Set([
  "civictheme:banner",
  "civictheme:campaign",
  "civictheme:callout",
]);

/** Theme alternation for visual rhythm across sections. */
const SECTION_THEMES = ["light", "dark", "light", "light"];

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
  // Layer 2: intentional overrides
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

/**
 * Extract props from children array by component role/type.
 * Used to flatten child data into organism-level props.
 */
function extractChildProps(
  children: SectionChildData[],
  targetIds: string[]
): Record<string, unknown> | undefined {
  const child = children.find((c) => targetIds.includes(c.componentId));
  return child?.props;
}

/**
 * Resolve the theme for a section based on index for visual alternation.
 */
function getSectionTheme(options?: SectionBuildOptions): string {
  // Default to light; dark for specific cases
  return (options?.backgroundColor === "dark") ? "dark" : "light";
}

// ---------------------------------------------------------------------------
// Header / Footer Builders
// ---------------------------------------------------------------------------

/**
 * Build a Canvas-ready component tree for the site header.
 *
 * Structure:
 *   civictheme:header (root)
 *     content-link x N (slot="primary_navigation")
 *     button (slot="secondary_navigation") — CTA
 */
export function buildHeaderTree(data: HeaderData): ComponentTreeItem[] {
  const { siteName, logo, pages, ctaText, ctaUrl } = data;

  const header = createItem(
    "civictheme:header",
    null,
    null,
    { theme: "light" },
    "Header"
  );

  const items: ComponentTreeItem[] = [header];

  // Primary navigation — one link per page
  for (const page of pages) {
    items.push(
      createItem(
        "civictheme:content-link",
        header.uuid,
        "primary_navigation",
        { text: page.title, url: `/${page.slug}` },
        `Nav: ${page.title}`
      )
    );
  }

  // CTA button in secondary navigation slot
  if (ctaText && ctaUrl) {
    items.push(
      createItem(
        "civictheme:button",
        header.uuid,
        "secondary_navigation",
        { text: ctaText, url: ctaUrl, type: "primary", size: "small" },
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
 *   civictheme:footer (root)
 *     content-link x N (slot="columns")
 *     social-links (slot="social_links")
 *     content-link x N (slot="copyright_links")
 */
export function buildFooterTree(data: FooterData): ComponentTreeItem[] {
  const {
    siteName,
    tagline,
    disclaimer,
    navLinks = [],
    socialLinks = [],
    legalLinks = [],
  } = data;

  const currentYear = new Date().getFullYear();

  const footer = createItem(
    "civictheme:footer",
    null,
    null,
    {
      theme: "dark",
      copyright: `\u00A9 ${currentYear} ${siteName}. All rights reserved.`,
      ...(disclaimer ? { acknowledgment: disclaimer } : {}),
    },
    "Footer"
  );

  const items: ComponentTreeItem[] = [footer];

  // Navigation links in columns slot
  for (const link of navLinks) {
    items.push(
      createItem(
        "civictheme:content-link",
        footer.uuid,
        "columns",
        { text: link.title, url: link.url },
        `Footer Nav: ${link.title}`
      )
    );
  }

  // Social links slot
  if (socialLinks.length > 0) {
    const socialLinksComponent = createItem(
      "civictheme:social-links",
      footer.uuid,
      "social_links",
      {
        items: socialLinks.map((s) => ({
          platform: s.platform,
          url: s.url,
          icon: s.icon,
        })),
        theme: "dark",
      },
      "Social Links"
    );
    items.push(socialLinksComponent);
  }

  // Legal/copyright links slot
  for (const link of legalLinks) {
    items.push(
      createItem(
        "civictheme:content-link",
        footer.uuid,
        "copyright_links",
        { text: link.title, url: link.url },
        `Legal: ${link.title}`
      )
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Content Section Builder — ORGANISM-FIRST ARCHITECTURE
// ---------------------------------------------------------------------------

/**
 * Build tree items for a composed section using CivicTheme organisms.
 *
 * CRITICAL DIFFERENCE FROM SPACE DS:
 * Instead of container + flexi grid + atoms, CivicTheme maps each
 * pattern to a pre-composed organism:
 *
 *   text-image-*       -> civictheme:promo
 *   features-grid-*    -> civictheme:list + navigation-cards
 *   testimonials-*     -> civictheme:slider + snippets
 *   team-grid-*        -> civictheme:list + promo-cards
 *   card-grid-*        -> civictheme:list + promo-cards
 *   stats-row          -> civictheme:list + promo-cards (stat values)
 *   faq-accordion      -> civictheme:accordion + accordion-panels
 *   contact-info       -> civictheme:list + service-cards
 *   logo-showcase      -> civictheme:list + navigation-cards
 *   blog-grid          -> civictheme:list + publication-cards
 *   cta-banner         -> civictheme:callout
 *   full-width-text    -> civictheme:callout (simple)
 */
export function buildContentSection(
  pattern: string,
  children: SectionChildData[],
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const theme = getSectionTheme(options);

  // Route to the appropriate organism builder based on pattern
  if (pattern.startsWith("text-image") || pattern.startsWith("image-text")) {
    return buildPromoSection(children, theme, options);
  }
  if (pattern.startsWith("features-grid")) {
    const colCount = pattern.includes("4col") ? 4 : 3;
    return buildListSection(children, "civictheme:navigation-card", colCount, theme, options);
  }
  if (pattern === "testimonials-carousel") {
    return buildSliderSection(children, "civictheme:snippet", theme, options);
  }
  if (pattern.startsWith("team-grid")) {
    const colCount = pattern.includes("4col") ? 4 : 3;
    return buildListSection(children, "civictheme:promo-card", colCount, theme, options);
  }
  if (pattern === "card-grid-3col") {
    return buildListSection(children, "civictheme:promo-card", 3, theme, options);
  }
  if (pattern === "card-carousel") {
    return buildCarouselSection(children, "civictheme:promo-card", theme, options);
  }
  if (pattern === "stats-row") {
    return buildListSection(children, "civictheme:promo-card", 4, theme, options);
  }
  if (pattern === "faq-accordion") {
    return buildAccordionSection(children, theme, options);
  }
  if (pattern === "contact-info") {
    return buildListSection(children, "civictheme:service-card", 3, theme, options);
  }
  if (pattern === "logo-showcase") {
    return buildListSection(children, "civictheme:navigation-card", 4, theme, options);
  }
  if (pattern === "blog-grid") {
    return buildListSection(children, "civictheme:publication-card", 3, theme, options);
  }
  if (pattern === "cta-banner") {
    return buildCalloutSection(children, "dark", options);
  }
  if (pattern === "full-width-text") {
    return buildCalloutSection(children, theme, options);
  }

  // Fallback: wrap in a promo section
  return buildPromoSection(children, theme, options);
}

// ---------------------------------------------------------------------------
// Organism-specific builders
// ---------------------------------------------------------------------------

/**
 * Build a civictheme:promo section for text+image patterns.
 * Extracts heading, text, image, and button from children and maps to promo props.
 */
function buildPromoSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  // Extract content from children to populate promo props
  let title = "";
  let content = "";
  let imageData: Record<string, unknown> | undefined;
  let url = "";

  for (const child of children) {
    if (child.componentId.includes("heading") || child.componentId.includes("section-heading")) {
      title = (child.props.text ?? child.props.title ?? "") as string;
    } else if (child.componentId.includes("text") || child.componentId.includes("paragraph")) {
      const rawContent = (child.props.text ?? child.props.content ?? child.props.rich_text ?? "") as string;
      content = rawContent.startsWith("<") ? rawContent : `<p>${rawContent}</p>`;
    } else if (child.componentId.includes("image") || child.componentId.includes("figure")) {
      imageData = child.props.image as Record<string, unknown> ?? {
        src: PLACEHOLDER_IMAGE_PATH,
        alt: "Image",
        width: 800,
        height: 600,
      };
    } else if (child.componentId.includes("button")) {
      url = (child.props.url ?? "") as string;
    }
  }

  // Use section heading if available
  if (!title && options?.sectionHeading) {
    title = options.sectionHeading.title;
  }

  const promoProps: Record<string, unknown> = {
    title: title || "Section Title",
    theme,
  };
  if (content) promoProps.content = content;
  if (imageData) promoProps.image = imageData;
  if (url) promoProps.url = url;

  const promo = createItem(
    "civictheme:promo",
    null,
    null,
    promoProps,
    `Promo: ${title || "Content Section"}`
  );

  return [promo];
}

/**
 * Build a civictheme:list section with card children.
 */
function buildListSection(
  children: SectionChildData[],
  cardType: string,
  columnCount: number,
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  // Add a heading if section heading is provided
  if (options?.sectionHeading) {
    const heading = createItem(
      "civictheme:heading",
      null,
      null,
      {
        text: options.sectionHeading.title,
        level: 2,
        theme,
      },
      `Section Heading: ${options.sectionHeading.title}`
    );
    items.push(heading);
  }

  const list = createItem(
    "civictheme:list",
    null,
    null,
    {
      theme,
      column_count: columnCount,
      fill_width: true,
    },
    `List: ${cardType.split(":")[1]}`
  );
  items.push(list);

  // Add children as cards in the items slot
  for (const child of children) {
    const childComponentId = child.componentId === cardType
      ? cardType
      : cardType; // Normalize to the expected card type

    const childProps = { ...child.props, theme };

    items.push(
      createItem(
        childComponentId,
        list.uuid,
        "items",
        childProps,
        labelFromId(childComponentId)
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:slider section with slide children.
 */
function buildSliderSection(
  children: SectionChildData[],
  slideType: string,
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  // Add a heading if section heading is provided
  if (options?.sectionHeading) {
    const heading = createItem(
      "civictheme:heading",
      null,
      null,
      {
        text: options.sectionHeading.title,
        level: 2,
        theme,
      },
      `Section Heading: ${options.sectionHeading.title}`
    );
    items.push(heading);
  }

  const slider = createItem(
    "civictheme:slider",
    null,
    null,
    { theme },
    "Slider"
  );
  items.push(slider);

  // Add children as slides
  for (const child of children) {
    const childProps = { ...child.props, theme };

    items.push(
      createItem(
        slideType,
        slider.uuid,
        "slides",
        childProps,
        labelFromId(slideType)
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:carousel section with slide children.
 */
function buildCarouselSection(
  children: SectionChildData[],
  slideType: string,
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  if (options?.sectionHeading) {
    const heading = createItem(
      "civictheme:heading",
      null,
      null,
      {
        text: options.sectionHeading.title,
        level: 2,
        theme,
      },
      `Section Heading: ${options.sectionHeading.title}`
    );
    items.push(heading);
  }

  const carousel = createItem(
    "civictheme:carousel",
    null,
    null,
    { theme },
    "Carousel"
  );
  items.push(carousel);

  for (const child of children) {
    const childProps = { ...child.props, theme };
    items.push(
      createItem(
        slideType,
        carousel.uuid,
        "slides",
        childProps,
        labelFromId(slideType)
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:accordion section with panel children.
 */
function buildAccordionSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  if (options?.sectionHeading) {
    const heading = createItem(
      "civictheme:heading",
      null,
      null,
      {
        text: options.sectionHeading.title,
        level: 2,
        theme,
      },
      `Section Heading: ${options.sectionHeading.title}`
    );
    items.push(heading);
  }

  const accordion = createItem(
    "civictheme:accordion",
    null,
    null,
    { theme },
    "Accordion"
  );
  items.push(accordion);

  for (const child of children) {
    // Skip if the child is the accordion container itself
    if (child.componentId === "civictheme:accordion") continue;

    const childProps = { ...child.props, theme };
    items.push(
      createItem(
        "civictheme:accordion-panel",
        accordion.uuid,
        "panels",
        childProps,
        `Panel: ${child.props.title ?? "Item"}`
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:callout section for CTA or full-width text.
 */
function buildCalloutSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  let title = "";
  let content = "";
  let buttonChild: SectionChildData | undefined;

  for (const child of children) {
    if (child.componentId.includes("heading") || child.componentId.includes("section-heading")) {
      title = (child.props.text ?? child.props.title ?? "") as string;
    } else if (child.componentId.includes("text") || child.componentId.includes("paragraph")) {
      const rawContent = (child.props.text ?? child.props.content ?? child.props.rich_text ?? "") as string;
      content = rawContent.startsWith("<") ? rawContent : `<p>${rawContent}</p>`;
    } else if (child.componentId.includes("button")) {
      buttonChild = child;
    }
  }

  if (!title && options?.sectionHeading) {
    title = options.sectionHeading.title;
  }

  const callout = createItem(
    "civictheme:callout",
    null,
    null,
    {
      title: title || "Call to Action",
      content: content || undefined,
      theme,
    },
    `Callout: ${title || "CTA"}`
  );

  const items: ComponentTreeItem[] = [callout];

  // Add button in the CTA slot
  if (buttonChild) {
    items.push(
      createItem(
        "civictheme:button",
        callout.uuid,
        "cta",
        { ...buttonChild.props, theme },
        "CTA Button"
      )
    );
  }

  return items;
}

// ---------------------------------------------------------------------------
// Organism Section Builder
// ---------------------------------------------------------------------------

/**
 * Build tree items for an organism section.
 * In CivicTheme, organisms are self-contained — no container wrapping needed.
 */
export function buildOrganismSection(
  componentId: string,
  props: Record<string, unknown>,
  children?: SectionChildData[],
  _sectionTag: string = "h2"
): ComponentTreeItem[] {
  const label = labelFromId(componentId);
  const inputs = { ...props };

  const organism = createItem(componentId, null, null, inputs, label);
  const items: ComponentTreeItem[] = [organism];

  if (children?.length) {
    for (const child of children) {
      if (child.componentId === componentId) continue;
      items.push(
        createItem(
          child.componentId,
          organism.uuid,
          child.slot ?? null,
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
 * CivicTheme heroes: civictheme:banner (standard) or civictheme:campaign (landing).
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
 * Get the placeholder image path for CivicTheme.
 */
export function getPlaceholderImagePath(): string {
  return PLACEHOLDER_IMAGE_PATH;
}
