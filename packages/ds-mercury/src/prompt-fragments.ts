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
    "- Prefer no background (omit background_color) for text-heavy sections",
    "- Dark backgrounds (primary, secondary, accent) are only for hero banners and CTA banners where text is inverted",
    "- Ensure sufficient contrast: inverted text on dark backgrounds, default text on light backgrounds",
    "- Do NOT stack multiple dark-background sections consecutively",
    "",
    "## Heading Hierarchy (Semantic HTML)",
    "- Hero title = level 1 (the ONLY h1 on the page)",
    "- Section headings in header_slot = level 2",
    "- Subsection headings within content = level 3",
    "- Card/item titles = level 3 or 4",
    "- Never skip heading levels (no h1 -> h3 without h2 in between)",
    "- Mercury heading uses `level` as a NUMBER (1-6), not a string like \"h2\"",
    "",
    "## Icon Validation",
    "- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)",
    "- Safe values: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-bar, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe",
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
    "- Section `width` uses percentage strings: \"100%\", \"90%\", \"80%\", \"75%\", \"50%\"",
    "- Section `padding_block_start` and `padding_block_end` use pixel strings: \"0\", \"16\", \"32\", \"64\"",
    "- Section `margin_block_start` and `margin_block_end` use pixel strings: \"0\", \"8\", \"20\", \"32\", \"48\", \"64\", \"96\", \"128\"",
    "- Section `mobile_columns` is required: \"1\", \"2\", or \"3\"",
    "- Hero banners (hero-billboard, hero-side-by-side) and CTA banners are full-width organisms — output them directly at root level",
    "- All other content sections wrap children inside a section with appropriate column splits",
    "",
    "### Section Slots",
    "- header_slot: Place section headings here (heading component with level 2)",
    "- main_slot: Place content components here (cards, text, images, groups)",
    "- footer_slot: Place section CTAs or navigation here (buttons, links)",
    "- Do NOT populate background_media on sections — use background_color only",
    "",
    "### Footer Slots",
    "- footer_first: Branding & Social content",
    "- footer_last: Call to action content",
    "- footer_utility_first: Utility/navigation links",
    "- footer_utility_last: Copyright text and legal links",
    "",
    "### Column Matching",
    "- The section `columns` prop defines the grid: \"33-33-33\" = 3 children in main_slot, \"50-50\" = 2 children",
    "- For multi-column layouts, use the group component to wrap children per column, or place flat card components directly",
    "",
    "### Cards are Props-Only",
    "- Mercury cards (card, card-icon, card-logo, card-pricing, card-testimonial) are flat components — all content goes in props, not slots",
    "",
    "### Component Prop Names (CRITICAL — use EXACT names)",
    "- **Mercury Heading**: `heading_text` (not `text`), `level` (NUMBER 1-6, not string), `text_size`, `text_color`, `align`",
    "- **Mercury Text**: `text` prop accepts HTML. Wrap in <p> tags: \"<p>Your content here.</p>\". Also requires `text_size` and `text_color`.",
    "- **Mercury Button**: `label` (not `text`), `href` (not `url`), `variant` (primary|secondary|primary-inverted|secondary-inverted), `size` (small|medium|large)",
    "- **Mercury Card**: `heading_text` (not `heading`), `media` (not `image`), `style` (framed|full), `orientation` (vertical|horizontal)",
    "- **Mercury Card Icon**: `text` for heading, `description` for body, `icon` for icon name",
    "- **Mercury Card Testimonial**: `text` for quote, `cite_name` for author, `cite_text` for role, `media` for avatar",
    "- **Mercury Card Pricing**: `heading_text` for plan name, `price`, `currency_symbol`, `symbol_position`, `text` for features HTML, `button_label`, `button_url`, `promote`",
    "- **Mercury Blockquote**: `text` for quote, `cite_name` for author, `cite_text` for source",
    "- **Mercury Image**: `media` (not `image`), `size` for aspect ratio, `radius` for corners",
    "- **Mercury Badge**: `label` (not `text`), `style` (primary|secondary)",
    "- **Mercury Icon**: `icon` (not `name`), `icon_size` (not `size`)",
    "- **Mercury Hero Billboard**: `media` (not `background_image`), `height`, `flex_position`, `overlay_opacity` (string: \"0%\"|\"20%\"|\"40%\"|\"60%\"|\"75%\"). MUST have hero_slot filled with a heading (level 1, text_color inverted, text_size heading-responsive-8xl). Set overlay_opacity to at least \"40%\" for text readability. CRITICAL: The heading_text in hero_slot MUST be a marketing-grade headline — NEVER \"Welcome\", \"Welcome to [Name]\", or any generic greeting. Use the business's value proposition, key messages, and SEO keywords.",
    "- **Mercury Hero Side by Side**: `media` (not `image`), `image_position`, `image_size`, `image_radius`",
    "- **Mercury Hero Blog**: `heading_text` (not `heading`), `media` (not `image`), `level` (integer), `date` (unix timestamp integer)",
    "- **Mercury CTA**: `heading_text` (not `heading`), `text`, `text_align`, `level` (number), `background_color`, `media`",
    "- **Mercury Accordion**: `title`, `heading_level` (number), `open_by_default`. Slot: `accordion_content`",
    "- **Mercury Accordion Container**: No props. Slot: `accordion_content`",
    "- **Mercury Group**: `flex_direction` (not `direction`), `flex_gap` (not `gap`), `items_align`, `flex_align`, `background` (not `background_color`)",
    "",
    "### Global Header Region Rules",
    "- \"Site Logo\" slot: MUST NOT have any background color set on components placed here",
    "- \"Navigation menu\" slot: MUST contain ONLY the Main Navigation component — no other components allowed",
    "",
    "### Global Footer Region Rules",
    "- Do NOT use any background color on components added to the Global Footer region",
    "- \"Utility links\" slot: MUST contain ONLY \"Main Navigation\" and \"Footer\" components — no other components allowed",
    "- \"Copyright Text\" slot: MUST contain ONLY a \"Text\" component",
    "",
    "### Content Region — Image Requirements",
    "- Every component with an image/media slot MUST have it filled — either with an image downloaded from PEXELS or a default placeholder image",
    "- NEVER leave image slots empty. If no contextual image is available, use a relevant stock image from PEXELS",
    "",
    "### Anti-Monotony",
    "- Alternate section backgrounds for visual rhythm: omit background_color -> muted -> omit -> muted",
    "- NEVER use the same composition pattern in two consecutive sections",
    "- NEVER use the same organism component_id in two consecutive sections (e.g., no two CTA banners back-to-back)",
    "- For text+image sections, alternate the column order (text-left/image-right then image-left/text-right)",
    "",
    "### Multi-column layouts",
    "- Every column should have content. Never leave a column empty.",
    "- Images: Each component that accepts a media prop should describe a unique, contextually relevant image.",
    "",
    "### Section Headings & Heading Hierarchy",
    "- MANDATORY: Every non-hero, non-CTA section MUST have a heading component in its header_slot",
    "- h1 is RESERVED for the first section on the page (hero). No other section may use level 1.",
    "- All heading `level` props must use values 2 through 6 based on content importance",
    "- CTA banners: Use at most ONE per page, always as the final closing section",
  ].join("\n");
}
