/**
 * Human-friendly labels for CivicTheme components.
 */
export const COMPONENT_LABELS: Record<string, string> = {
  // Atoms
  "civictheme:heading": "Heading",
  "civictheme:paragraph": "Paragraph",
  "civictheme:button": "Button",
  "civictheme:content-link": "Content Link",
  "civictheme:tag": "Tag",
  "civictheme:chip": "Chip",
  "civictheme:icon": "Icon",
  "civictheme:quote": "Quote",
  "civictheme:table": "Table",

  // Molecules
  "civictheme:accordion": "Accordion",
  "civictheme:accordion-panel": "Accordion Panel",
  "civictheme:breadcrumb": "Breadcrumb",
  "civictheme:callout": "Callout / CTA",
  "civictheme:figure": "Figure",
  "civictheme:navigation-card": "Navigation Card",
  "civictheme:promo-card": "Promo Card",
  "civictheme:event-card": "Event Card",
  "civictheme:publication-card": "Publication Card",
  "civictheme:service-card": "Service Card",
  "civictheme:subject-card": "Subject Card",
  "civictheme:price-card": "Price Card",
  "civictheme:snippet": "Snippet / Testimonial",
  "civictheme:tabs": "Tabs",
  "civictheme:tooltip": "Tooltip",

  // Organisms
  "civictheme:banner": "Banner Hero",
  "civictheme:campaign": "Campaign Hero",
  "civictheme:promo": "Promo Section",
  "civictheme:carousel": "Carousel",
  "civictheme:slider": "Slider",
  "civictheme:list": "List Layout",
  "civictheme:social-links": "Social Links",
  "civictheme:header": "Header",
  "civictheme:footer": "Footer",
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
