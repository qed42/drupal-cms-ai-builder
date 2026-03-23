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

/** Placeholder image path within the CivicTheme theme. */
const PLACEHOLDER_IMAGE_PATH =
  "/themes/contrib/civictheme/assets/backgrounds/civictheme_background_1.png";

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

  // Strip invalid URL values — Canvas rejects "#", "javascript:", empty fragments
  const URL_PROP_NAMES = /^(url|href|cite_url|button_url|link|download_paper_link)$/;
  for (const [key, value] of Object.entries(mergedInputs)) {
    if (URL_PROP_NAMES.test(key) && typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "#" || trimmed === "" || trimmed.startsWith("javascript:")) {
        delete mergedInputs[key];
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

  // Fill missing boolean props with false — CivicTheme Twig templates pass
  // optional boolean props (is_new_window, is_external, etc.) to sub-components
  // like text-icon. Canvas schema validation rejects NULL booleans, so every
  // boolean prop defined in the manifest must have an explicit value.
  if (propTypes) {
    for (const [propName, ptype] of propTypes) {
      if (ptype === "boolean" && mergedInputs[propName] === undefined) {
        mergedInputs[propName] = false;
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
          (!(val as Record<string, unknown>).url ||
            (val as Record<string, unknown>).url === "" ||
            (val as Record<string, unknown>).url === null));
      if (needsFill) {
        mergedInputs[propName] = {
          url: PLACEHOLDER_IMAGE_PATH,
          alt: typeof val === "string" ? val : label || "Image",
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
 * CivicTheme header uses numbered slots:
 *   content_top1/2/3, content_middle1/2/3, content_bottom1
 *
 * We place navigation links in content_middle1 and CTA in content_middle2.
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

  // Primary navigation — one link per page in content_middle1
  for (const page of pages) {
    items.push(
      createItem(
        "civictheme:content-link",
        header.uuid,
        "content_middle1",
        { text: page.title, url: `/${page.slug}` },
        `Nav: ${page.title}`
      )
    );
  }

  // CTA button in content_middle2 slot
  if (ctaText && ctaUrl) {
    items.push(
      createItem(
        "civictheme:button",
        header.uuid,
        "content_middle2",
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
 * CivicTheme footer uses numbered slots:
 *   content_top1/2, content_middle1-5, content_bottom1/2
 *
 * We place navigation in content_middle1, social links in content_middle2,
 * and legal/copyright in content_bottom1.
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
    },
    "Footer"
  );

  const items: ComponentTreeItem[] = [footer];

  // Navigation links in content_middle1 slot
  for (const link of navLinks) {
    items.push(
      createItem(
        "civictheme:content-link",
        footer.uuid,
        "content_middle1",
        { text: link.title, url: link.url },
        `Footer Nav: ${link.title}`
      )
    );
  }

  // Social links in content_middle2 slot
  if (socialLinks.length > 0) {
    const socialLinksComponent = createItem(
      "civictheme:social-links",
      footer.uuid,
      "content_middle2",
      {
        items: socialLinks.map((s) => ({
          icon: s.icon,
          url: s.url,
          title: s.platform,
        })),
        theme: "dark",
      },
      "Social Links"
    );
    items.push(socialLinksComponent);
  }

  // Legal/copyright links in content_bottom1 slot
  for (const link of legalLinks) {
    items.push(
      createItem(
        "civictheme:content-link",
        footer.uuid,
        "content_bottom1",
        { text: link.title, url: link.url },
        `Legal: ${link.title}`
      )
    );
  }

  // Copyright/disclaimer in content_bottom2 slot as paragraph
  const copyrightText = `\u00A9 ${currentYear} ${siteName}. All rights reserved.`;
  items.push(
    createItem(
      "civictheme:paragraph",
      footer.uuid,
      "content_bottom2",
      { content: disclaimer ? `${copyrightText} ${disclaimer}` : copyrightText, theme: "dark" },
      "Copyright"
    )
  );

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
 *   text-image-*       -> civictheme:promo (title/content are SLOTS)
 *   features-grid-*    -> civictheme:list + navigation-cards (in rows slot)
 *   testimonials-*     -> civictheme:slider (slides is a prop, HTML string)
 *   team-grid-*        -> civictheme:list + promo-cards (in rows slot)
 *   card-grid-*        -> civictheme:list + promo-cards (in rows slot)
 *   stats-row          -> civictheme:list + fast-fact-cards (in rows slot)
 *   faq-accordion      -> civictheme:accordion (panels is a prop, array of objects)
 *   contact-info       -> civictheme:list + service-cards (in rows slot)
 *   logo-showcase      -> civictheme:list + navigation-cards (in rows slot)
 *   blog-grid          -> civictheme:list + publication-cards (in rows slot)
 *   cta-banner         -> civictheme:callout (title/content are SLOTS)
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
    return buildListSection(children, "civictheme:navigation-card", theme, options);
  }
  if (pattern === "testimonials-carousel") {
    return buildSliderSection(children, theme, options);
  }
  if (pattern.startsWith("team-grid")) {
    return buildListSection(children, "civictheme:promo-card", theme, options);
  }
  if (pattern === "card-grid-3col") {
    return buildListSection(children, "civictheme:promo-card", theme, options);
  }
  if (pattern === "card-carousel") {
    return buildSliderSection(children, theme, options);
  }
  if (pattern === "stats-row") {
    return buildListSection(children, "civictheme:fast-fact-card", theme, options);
  }
  if (pattern === "faq-accordion") {
    return buildAccordionSection(children, theme, options);
  }
  if (pattern === "contact-info") {
    return buildListSection(children, "civictheme:service-card", theme, options);
  }
  if (pattern === "logo-showcase") {
    return buildListSection(children, "civictheme:navigation-card", theme, options);
  }
  if (pattern === "blog-grid") {
    return buildListSection(children, "civictheme:publication-card", theme, options);
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
 *
 * IMPORTANT: In CivicTheme, promo's title and content are SLOTS, not props.
 * The promo only has link (object), is_contained, vertical_spacing,
 * with_background, and theme as props.
 *
 * We place heading and paragraph children into the title and content slots.
 */
function buildPromoSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  let title = "";
  let content = "";
  let linkData: Record<string, unknown> | undefined;

  for (const child of children) {
    if (child.componentId.includes("heading") || child.componentId.includes("section-heading")) {
      title = (child.props.content ?? child.props.text ?? child.props.title ?? "") as string;
    } else if (child.componentId.includes("text") || child.componentId.includes("paragraph")) {
      const rawContent = (child.props.content ?? child.props.text ?? child.props.rich_text ?? "") as string;
      content = rawContent.startsWith("<") ? rawContent : `<p>${rawContent}</p>`;
    } else if (child.componentId.includes("button")) {
      const url = (child.props.url ?? "") as string;
      const text = (child.props.text ?? "Learn more") as string;
      if (url) {
        linkData = { text, url };
      }
    }
  }

  if (!title && options?.sectionHeading) {
    title = options.sectionHeading.title;
  }

  const promoProps: Record<string, unknown> = { theme };
  if (linkData) promoProps.link = linkData;

  const promo = createItem(
    "civictheme:promo",
    null,
    null,
    promoProps,
    `Promo: ${title || "Content Section"}`
  );

  const items: ComponentTreeItem[] = [promo];

  // Place title in the title slot
  items.push(
    createItem(
      "civictheme:heading",
      promo.uuid,
      "title",
      { content: title || "Section Title", level: "2", theme },
      `Promo Title`
    )
  );

  // Place content in the content slot
  if (content) {
    items.push(
      createItem(
        "civictheme:paragraph",
        promo.uuid,
        "content",
        { content, theme },
        `Promo Content`
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:list section with card children.
 *
 * IMPORTANT: CivicTheme list does NOT have column_count or fill_width props.
 * Cards go in the "rows" slot (not "items").
 * The list title is a SLOT.
 */
function buildListSection(
  children: SectionChildData[],
  cardType: string,
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  const list = createItem(
    "civictheme:list",
    null,
    null,
    { theme },
    `List: ${cardType.split(":")[1]}`
  );
  items.push(list);

  // Add section heading in the title slot
  if (options?.sectionHeading) {
    items.push(
      createItem(
        "civictheme:heading",
        list.uuid,
        "title",
        {
          content: options.sectionHeading.title,
          level: "2",
          theme,
        },
        `Section Heading: ${options.sectionHeading.title}`
      )
    );
  }

  // Add children as cards in the rows slot
  for (const child of children) {
    const childProps = { ...child.props, theme };

    items.push(
      createItem(
        cardType,
        list.uuid,
        "rows",
        childProps,
        labelFromId(cardType)
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:slider section.
 *
 * IMPORTANT: In CivicTheme, "slides" is a PROP (HTML string), not a slot.
 * The slider title is a SLOT.
 * Individual slides use civictheme:slide component.
 * For simplicity in tree building, we place slide components in content_top slot
 * and the slides HTML prop is populated during rendering.
 */
function buildSliderSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  const slider = createItem(
    "civictheme:slider",
    null,
    null,
    { theme },
    "Slider"
  );
  items.push(slider);

  // Add section heading in the title slot
  if (options?.sectionHeading) {
    items.push(
      createItem(
        "civictheme:heading",
        slider.uuid,
        "title",
        {
          content: options.sectionHeading.title,
          level: "2",
          theme,
        },
        `Section Heading: ${options.sectionHeading.title}`
      )
    );
  }

  // Add children as slide components in content_top slot
  // (slides prop is HTML that gets rendered from these)
  for (const child of children) {
    const childProps = { ...child.props, theme };

    items.push(
      createItem(
        "civictheme:slide",
        slider.uuid,
        "content_top",
        childProps,
        labelFromId("civictheme:slide")
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:accordion section.
 *
 * IMPORTANT: In CivicTheme, "panels" is a PROP (array of objects), NOT a slot.
 * Each panel object has: title (string), content (string), expanded (boolean).
 * There is no separate accordion-panel component.
 */
function buildAccordionSection(
  children: SectionChildData[],
  theme: string,
  options?: SectionBuildOptions
): ComponentTreeItem[] {
  const items: ComponentTreeItem[] = [];

  // Build panels array from children
  const panels: Array<{ title: string; content: string; expanded: boolean }> = [];
  for (const child of children) {
    if (child.componentId === "civictheme:accordion") continue;

    const title = (child.props.title ?? child.props.content ?? "Item") as string;
    const content = (child.props.content ?? child.props.text ?? child.props.rich_text ?? "") as string;
    const formattedContent = content.startsWith("<") ? content : `<p>${content}</p>`;

    panels.push({
      title,
      content: formattedContent,
      expanded: false,
    });
  }

  const accordionProps: Record<string, unknown> = { theme, panels };

  const accordion = createItem(
    "civictheme:accordion",
    null,
    null,
    accordionProps,
    "Accordion"
  );
  items.push(accordion);

  // Add section heading in content_top slot
  if (options?.sectionHeading) {
    items.push(
      createItem(
        "civictheme:heading",
        accordion.uuid,
        "content_top",
        {
          content: options.sectionHeading.title,
          level: "2",
          theme,
        },
        `Section Heading: ${options.sectionHeading.title}`
      )
    );
  }

  return items;
}

/**
 * Build a civictheme:callout section for CTA or full-width text.
 *
 * IMPORTANT: In CivicTheme, callout's title and content are SLOTS, not props.
 * The callout has a links prop (array) for CTA links, and no "cta" slot.
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
      title = (child.props.content ?? child.props.text ?? child.props.title ?? "") as string;
    } else if (child.componentId.includes("text") || child.componentId.includes("paragraph")) {
      const rawContent = (child.props.content ?? child.props.text ?? child.props.rich_text ?? "") as string;
      content = rawContent.startsWith("<") ? rawContent : `<p>${rawContent}</p>`;
    } else if (child.componentId.includes("button")) {
      buttonChild = child;
    }
  }

  if (!title && options?.sectionHeading) {
    title = options.sectionHeading.title;
  }

  // Build links prop from button child
  const calloutProps: Record<string, unknown> = { theme };
  if (buttonChild) {
    calloutProps.links = [{
      text: (buttonChild.props.text ?? "Learn more") as string,
      url: (buttonChild.props.url ?? "#") as string,
    }];
  }

  const callout = createItem(
    "civictheme:callout",
    null,
    null,
    calloutProps,
    `Callout: ${title || "CTA"}`
  );

  const items: ComponentTreeItem[] = [callout];

  // Place title in the title slot
  items.push(
    createItem(
      "civictheme:heading",
      callout.uuid,
      "title",
      { content: title || "Call to Action", level: "2", theme },
      `Callout Title`
    )
  );

  // Place content in the content slot
  if (content) {
    items.push(
      createItem(
        "civictheme:paragraph",
        callout.uuid,
        "content",
        { content, theme },
        `Callout Content`
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
 *
 * IMPORTANT: Both banner and campaign have title as a SLOT.
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
