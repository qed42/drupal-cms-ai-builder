/**
 * Human-friendly labels for all 22 Mercury components.
 */
export const COMPONENT_LABELS: Record<string, string> = {
  // Layout
  "mercury:section": "Section",
  "mercury:group": "Group",
  "mercury:accordion-container": "Accordion Container",
  "mercury:accordion": "Accordion",
  // Global
  "mercury:navbar": "Navbar",
  "mercury:footer": "Footer",
  // Hero
  "mercury:hero-billboard": "Hero Billboard",
  "mercury:hero-side-by-side": "Hero Side by Side",
  "mercury:hero-blog": "Hero Blog",
  // CTA
  "mercury:cta": "Call to Action",
  // Cards
  "mercury:card": "Card",
  "mercury:card-icon": "Icon Card",
  "mercury:card-logo": "Logo Card",
  "mercury:card-pricing": "Pricing Card",
  "mercury:card-testimonial": "Testimonial Card",
  // Base
  "mercury:heading": "Heading",
  "mercury:text": "Text",
  "mercury:button": "Button",
  "mercury:badge": "Badge",
  "mercury:blockquote": "Blockquote",
  "mercury:image": "Image",
  "mercury:video": "Video",
  "mercury:icon": "Icon",
  "mercury:anchor": "Anchor",
};

/**
 * Get a friendly label for a component ID.
 * Falls back to deriving a label from the ID string.
 */
export function getLabel(componentId: string): string {
  if (COMPONENT_LABELS[componentId]) {
    return COMPONENT_LABELS[componentId];
  }
  const name = componentId.split(":")[1] ?? componentId;
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
