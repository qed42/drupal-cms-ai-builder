import type { ComponentDefinition, PropDefinition, SlotDefinition } from "@ai-builder/ds-types";
import manifest from "./manifest.json";

/**
 * Build a concise prop reference for the most commonly used Mercury components,
 * derived from the manifest. This ensures the AI only uses valid props.
 */
export function buildPromptComponentReference(): string {
  const commonComponents = [
    // Heroes
    "mercury:hero-billboard",
    "mercury:hero-side-by-side",
    "mercury:hero-blog",
    // CTA
    "mercury:cta",
    // Layout
    "mercury:section",
    "mercury:group",
    "mercury:accordion-container",
    "mercury:accordion",
    // Cards
    "mercury:card",
    "mercury:card-icon",
    "mercury:card-logo",
    "mercury:card-pricing",
    "mercury:card-testimonial",
    // Base
    "mercury:heading",
    "mercury:text",
    "mercury:button",
    "mercury:image",
    "mercury:icon",
    "mercury:badge",
    "mercury:blockquote",
    "mercury:video",
    "mercury:anchor",
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
    "- NEVER use \"primary\" or \"secondary\" as section background_color when text content is dark-colored",
    "- Prefer light backgrounds (transparent, background, muted) for text-heavy sections",
    "- Dark backgrounds (primary, secondary, accent) are only for hero banners and CTA banners where text is white",
    "- Ensure sufficient contrast: light text on dark backgrounds, dark text on light backgrounds",
    "- Do NOT stack multiple dark-background sections consecutively",
    "",
    "## Heading Hierarchy (Semantic HTML)",
    "- Hero title = h1 (the ONLY h1 on the page)",
    "- Section headings in header_slot = h2",
    "- Subsection headings within content = h3",
    "- Card/item titles = h3 or h4",
    "- Never skip heading levels (no h1 -> h3 without h2 in between)",
    "",
    "## Icon Validation",
    "- All icon names MUST be valid Lucide icons (https://lucide.dev/icons/)",
    "- Safe values: rocket, star, phone, mail, map-pin, clock, shield-check, heart, users, bar-chart, lightbulb, settings, home, arrow-right, check-circle, trophy, handshake, target, briefcase, globe",
  ].join("\n");
}

/**
 * Build design guidance rules for AI prompt injection.
 */
export function buildPromptDesignGuidance(): string {
  return [
    "## Layout Rules (MUST FOLLOW)",
    "",
    "### Section Component",
    "- Mercury uses `mercury:section` as the combined container + grid component",
    "- Hero banners (hero-billboard, hero-side-by-side) and CTA banners are full-width organisms — output them directly at root level",
    "- All other content sections wrap children inside a section with appropriate column splits",
    "- Every section should have padding_block_start: \"lg\" and padding_block_end: \"lg\"",
    "",
    "### Section Slots",
    "- header_slot: Place section headings here (heading component with h2 level)",
    "- main_slot: Place content components here (cards, text, images, groups)",
    "- footer_slot: Place section CTAs or navigation here (buttons, links)",
    "",
    "### Column Matching",
    "- The section `columns` prop defines the grid: \"33-33-33\" = 3 children in main_slot, \"50-50\" = 2 children",
    "- For multi-column layouts, use the group component to wrap children per column, or place flat card components directly",
    "",
    "### Cards are Props-Only",
    "- Mercury cards (card, card-icon, card-logo, card-pricing, card-testimonial) are flat components — all content goes in props, not slots",
    "- This is different from Space DS where some cards have slots",
    "",
    "### Anti-Monotony",
    "- Alternate section backgrounds for visual rhythm: transparent -> muted -> background -> transparent",
    "- NEVER use the same composition pattern in two consecutive sections",
    "- For text+image sections, alternate the column order (text-left/image-right then image-left/text-right)",
    "",
    "### Component-Specific Rules",
    "- **Mercury Text**: The \"content\" prop accepts HTML. Wrap content in <p> tags: \"<p>Your content here.</p>\"",
    "- **Mercury Heading**: Always set \"level\" prop (h1-h6) and optionally \"size\" for visual sizing independent of semantic level.",
    "- **Mercury Button**: Always set \"variant\" to \"primary\" or \"secondary\".",
    "- **Multi-column layouts**: Every column should have content. Never leave a column empty.",
    "- **Images**: Each component that accepts an image prop should describe a unique, contextually relevant image.",
  ].join("\n");
}
