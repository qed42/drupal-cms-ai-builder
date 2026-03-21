/**
 * Human-friendly labels for all 31 Space DS v2 components.
 */
export const COMPONENT_LABELS: Record<string, string> = {
  // Organisms
  "space_ds:space-hero-banner-style-02": "Hero Banner",
  "space_ds:space-hero-banner-with-media": "Hero Banner (Media)",
  "space_ds:space-detail-page-hero-banner": "Detail Page Hero",
  "space_ds:space-video-banner": "Video Banner",
  "space_ds:space-cta-banner-type-1": "Call to Action",
  "space_ds:space-accordion": "Accordion / FAQ",
  "space_ds:space-slider": "Slider",
  // Molecules
  "space_ds:space-section-heading": "Section Heading",
  "space_ds:space-testimony-card": "Testimonial",
  "space_ds:space-stats-kpi": "Statistics / KPIs",
  "space_ds:space-user-card": "User Card",
  "space_ds:space-imagecard": "Image Card",
  "space_ds:space-dark-bg-imagecard": "Dark Image Card",
  "space_ds:space-contact-card": "Contact Card",
  "space_ds:space-content-detail": "Content Detail",
  "space_ds:space-logo-section": "Logo Section",
  "space_ds:space-videocard": "Video Card",
  "space_ds:space-accordion-item": "Accordion Item",
  "space_ds:space-breadcrumb": "Breadcrumb",
  // Atoms
  "space_ds:space-heading": "Heading",
  "space_ds:space-text": "Text",
  "space_ds:space-button": "Button",
  "space_ds:space-image": "Image",
  "space_ds:space-icon": "Icon",
  "space_ds:space-link": "Link",
  "space_ds:space-input-submit": "Input Submit",
  // Layout
  "space_ds:space-container": "Container",
  "space_ds:space-flexi": "Flexi Layout",
  "space_ds:space-pagination": "Pagination",
  // Global
  "space_ds:space-header": "Header",
  "space_ds:space-footer": "Footer",
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
    .replace(/^space-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
