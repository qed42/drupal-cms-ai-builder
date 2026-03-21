/**
 * Component Tree Builder — orchestrates page component tree generation.
 *
 * This module is a thin orchestrator that delegates all design-system-specific
 * section composition, header/footer building, and component creation to the
 * active design system adapter.
 *
 * The output is a flat array of ComponentTreeItems linked by parent_uuid/slot
 * relationships, ready for BlueprintImportService.php's prepareComponentTree().
 */
import type { ComponentTreeItem } from "./types";
import type { PageSection } from "./types";
import { getDefaultAdapter } from "@/lib/design-systems/setup";

// ---------------------------------------------------------------------------
// Constants (adapter-driven)
// ---------------------------------------------------------------------------

/**
 * Patterns that map to organism-level components (no grid layout).
 * These route to adapter.buildOrganismSection instead of buildContentSection.
 */
const ORGANISM_PATTERNS = new Set([
  "testimonials-carousel",
  "card-carousel",
  "faq-accordion",
  "logo-showcase",
]);

/**
 * Anti-monotony: text-image patterns that can be swapped to alternate
 * image position when two similar patterns appear consecutively.
 */
const TEXT_IMAGE_ALTERNATES: Record<string, string> = {
  "text-image-split-50-50": "image-text-split-33-66",
  "text-image-split-66-33": "image-text-split-33-66",
  "image-text-split-33-66": "text-image-split-66-33",
};

/**
 * Pattern name to column_width mapping — used for anti-monotony check.
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
// Organism Pattern Mapping
// ---------------------------------------------------------------------------

/**
 * Map an organism-level pattern to a proper organism section.
 * Converts pattern-based sections (testimonials-carousel, faq-accordion, etc.)
 * into organism sections with the correct component_id and children.
 *
 * Uses the adapter to resolve organism component IDs from roles.
 */
function mapOrganismPattern(section: PageSection): PageSection {
  const patternName = section.pattern!;
  const adapter = getDefaultAdapter();

  const patternToOrganism: Record<
    string,
    { role: string; componentId: string; childSlot: string }
  > = {
    "testimonials-carousel": {
      role: "slider",
      componentId: adapter.supportsRole("slider") ? adapter.primaryComponent("slider") : "",
      childSlot: "slide_item",
    },
    "card-carousel": {
      role: "slider",
      componentId: adapter.supportsRole("slider") ? adapter.primaryComponent("slider") : "",
      childSlot: "slide_item",
    },
    "faq-accordion": {
      role: "accordion",
      componentId: adapter.supportsRole("accordion") ? adapter.primaryComponent("accordion") : "",
      childSlot: "content",
    },
    "logo-showcase": {
      role: "logo-section",
      componentId: adapter.supportsRole("logo-section") ? adapter.primaryComponent("logo-section") : "",
      childSlot: "content",
    },
  };

  const mapping = patternToOrganism[patternName];
  if (!mapping || !mapping.componentId) return section;

  const children = (section.children ?? []).map((child) => ({
    ...child,
    slot: child.slot || mapping.childSlot,
  }));

  return {
    ...section,
    component_id: mapping.componentId,
    props: section.props ?? {},
    children,
    pattern: undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a Canvas-ready flat component tree from a page's sections array.
 *
 * Handles two section types:
 *   A. Organism sections — heroes, CTA banners, accordions, sliders
 *   B. Composed sections — grid layouts with atoms/molecules in slots
 *
 * All section composition is delegated to the active design system adapter.
 */
export function buildComponentTree(
  sections: PageSection[]
): ComponentTreeItem[] {
  const adapter = getDefaultAdapter();
  const items: ComponentTreeItem[] = [];
  let bgIndex = 0;
  let prevPattern: string | undefined;

  const sectionBackgrounds = adapter.getColorPalette().defaultAlternation;

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    let currentPattern = section.pattern ?? section.component_id;

    // Heading hierarchy: first section gets h1, all others get h2.
    const sectionTag = sIdx === 0 ? "h1" : "h2";

    // Anti-monotony: if this pattern matches the previous one, try to swap
    if (currentPattern && currentPattern === prevPattern && section.pattern) {
      const alternate = TEXT_IMAGE_ALTERNATES[section.pattern];
      if (alternate && PATTERN_COLUMN_WIDTHS[alternate]) {
        section.pattern = alternate;
        currentPattern = alternate;
      }
    }

    // Route to appropriate builder
    if (section.pattern && ORGANISM_PATTERNS.has(section.pattern)) {
      // Map organism patterns to their component_id
      const organismSection = mapOrganismPattern(section);
      const children = (organismSection.children ?? []).map((c) => ({
        componentId: c.component_id,
        slot: c.slot,
        props: { ...c.props },
      }));
      items.push(
        ...adapter.buildOrganismSection(
          organismSection.component_id,
          { ...organismSection.props },
          children,
          sectionTag
        )
      );
    } else if (section.pattern && section.children) {
      // Type B: Composed section with grid layout
      const children = section.children.map((c) => ({
        componentId: c.component_id,
        slot: c.slot,
        props: { ...c.props },
      }));
      const bg = sectionBackgrounds[bgIndex % sectionBackgrounds.length];
      items.push(
        ...adapter.buildContentSection(section.pattern, children, {
          backgroundColor: section.container_background ?? bg,
          sectionHeading: section.section_heading ?? undefined,
          sectionTag,
        })
      );
    } else {
      // Type A: Organism section (hero, CTA, etc.)
      const children = (section.children ?? []).map((c) => ({
        componentId: c.component_id,
        slot: c.slot,
        props: { ...c.props },
      }));
      items.push(
        ...adapter.buildOrganismSection(
          section.component_id,
          { ...section.props },
          children,
          sectionTag
        )
      );
    }

    prevPattern = currentPattern;
    bgIndex++;
  }

  return items;
}

/**
 * Build a Canvas-ready component tree for the site header.
 * Delegates to the active design system adapter.
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
  const adapter = getDefaultAdapter();
  return adapter.buildHeaderTree({
    siteName,
    pages,
    logo: options?.logoUrl ? { url: options.logoUrl, alt: `${siteName} logo` } : undefined,
    menuAlign: options?.menuAlign,
    ctaText: options?.ctaText,
    ctaUrl: options?.ctaUrl,
  });
}

/**
 * Build a Canvas-ready component tree for the site footer.
 * Delegates to the active design system adapter.
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
  const adapter = getDefaultAdapter();
  return adapter.buildFooterTree({
    siteName: site.name,
    tagline: site.tagline,
    brandDescription: options?.brandDescription,
    disclaimer: options?.disclaimer,
    navLinks: options?.navLinks,
    socialLinks: options?.socialLinks,
    legalLinks: options?.legalLinks,
  });
}
