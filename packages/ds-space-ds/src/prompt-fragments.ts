import type { ComponentDefinition, PropDefinition, SlotDefinition } from "@ai-builder/ds-types";
import manifest from "./manifest.json";

/**
 * Build a concise prop reference for the most commonly used components,
 * derived from the Space DS manifest. This ensures the AI only uses
 * valid props for each component.
 */
export function buildPromptComponentReference(): string {
  const commonComponents = [
    // Heroes
    "space_ds:space-hero-banner-style-02",
    "space_ds:space-hero-banner-with-media",
    "space_ds:space-detail-page-hero-banner",
    "space_ds:space-video-banner",
    // CTA
    "space_ds:space-cta-banner-type-1",
    // Organisms
    "space_ds:space-accordion",
    "space_ds:space-slider",
    // Molecules (used as section content)
    "space_ds:space-section-heading",
    "space_ds:space-testimony-card",
    "space_ds:space-stats-kpi",
    "space_ds:space-user-card",
    "space_ds:space-imagecard",
    "space_ds:space-dark-bg-imagecard",
    "space_ds:space-contact-card",
    "space_ds:space-content-detail",
    "space_ds:space-logo-section",
    "space_ds:space-videocard",
    "space_ds:space-accordion-item",
    // Atoms (for content within flexi grids)
    "space_ds:space-heading",
    "space_ds:space-text",
    "space_ds:space-button",
    "space_ds:space-image",
    "space_ds:space-icon",
    "space_ds:space-link",
  ];

  const components = manifest as ComponentDefinition[];

  const lines: string[] = [];
  for (const compId of commonComponents) {
    const comp = components.find((c: ComponentDefinition) => c.id === compId);
    if (!comp) continue;

    // Show string/HTML props (content props the AI should fill)
    const stringProps = comp.props
      .filter((p: PropDefinition) => p.type === "string" && !p.enum)
      .map((p: PropDefinition) => p.name);

    // Show slots (where child components go)
    const slots = comp.slots
      ?.filter((s: SlotDefinition) => s.name)
      .map((s: SlotDefinition) => s.name) ?? [];

    const parts: string[] = [];
    if (stringProps.length > 0) {
      const example = stringProps.map((p: string) => `"${p}":"..."`).join(", ");
      parts.push(`string props = [${stringProps.join(", ")}] -> props_json: '{${example}}'`);
    } else {
      parts.push(`no string content props (layout-only)`);
    }

    if (slots.length > 0) {
      parts.push(`slots = [${slots.join(", ")}]`);
    }

    lines.push(`- ${compId}: ${parts.join(" | ")}`);
  }

  return lines.join("\n");
}

/**
 * Build accessibility rules for AI prompt injection.
 */
export function buildPromptAccessibilityRules(): string {
  return [
    "## Accessibility & Contrast (WCAG AA)",
    "- NEVER use \"black\" as container_background when text content is dark-colored — use \"white\" or \"transparent\" instead",
    "- Prefer light backgrounds (white, transparent, option-1) for text-heavy sections",
    "- Dark backgrounds (black, base-brand) are only for hero banners and CTA banners where text is white",
    "- Ensure sufficient contrast: light text on dark backgrounds, dark text on light backgrounds",
    "- Do NOT stack multiple dark-background sections consecutively",
    "",
    "## Heading Hierarchy (Semantic HTML)",
    "- Hero title = h1 (the ONLY h1 on the page)",
    "- Section headings (space-section-heading title) = h2",
    "- Subsection headings within content columns = h3",
    "- Card/item titles = h3 or h4",
    "- Never skip heading levels (no h1 -> h3 without h2 in between)",
    "",
    "## Icon Validation",
    "- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)",
    "- Safe values: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-line, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe",
  ].join("\n");
}

/**
 * Build design guidance rules for AI prompt injection.
 */
export function buildPromptDesignGuidance(): string {
  return [
    "## Layout Rules (MUST FOLLOW)",
    "",
    "### Container & Width",
    "- Hero banners and CTA banners are full-width organisms — output them as type A sections",
    "- All other content sections use composition patterns (type B) wrapped in space-container with boxed-width",
    "- Width is controlled at the container level, NOT on individual components",
    "- Every container must have padding_top: \"large\" and padding_bottom: \"large\"",
    "",
    "### Section Structure",
    "- Every non-hero, non-CTA section should have a section_heading introducing it",
    "- Alternate container backgrounds for visual rhythm: transparent -> option-1 -> white -> option-2",
    "- Never use the same background on consecutive sections",
    "",
    "### Flexi Column Matching",
    "- column_width segments MUST equal the number of children: \"33-33-33\" = 3 children, \"50-50\" = 2 children, \"25-25-25-25\" = 4 children",
    "",
    "### Anti-Monotony",
    "- NEVER use the same composition pattern in two consecutive sections",
    "- For text+image sections, alternate the column order (text-left/image-right then image-left/text-right)",
    "",
    "### Component-Specific Rules",
    "- **Space Stats KPI**: \"sub_headline\" is for descriptive text (e.g., \"Projects Completed\"), NOT for the number/stat. The number goes in \"title\".",
    "- **Space Button**: Always set \"variant\" to \"primary\" or \"secondary\".",
    "- **Space Text**: The \"text\" prop accepts HTML. Wrap content in <p> tags: \"<p>Your content here.</p>\". Must end with a newline.",
    "- **Space Heading**: Always set \"align\" prop (use \"none\" if no preference).",
    "- **Multi-column layouts**: Every column slot MUST have at least one child component. Never leave a column empty.",
    "- **Images**: Each component that accepts an image prop should describe a unique, contextually relevant image.",
  ].join("\n");
}
