# TASK-518: SDC approximate renderer registry

**Story:** US-112
**Priority:** P1
**Estimate:** L
**Status:** To Do

## Description

Create lightweight React renderers that approximate the visual output of the top ~15 SDC (Single Directory Component) types used by the design system. These renderers will be included in the iframe srcdoc for `design_system` mode blueprints.

### Deliverables

1. **`platform-app/src/lib/preview/sdc-renderers.ts`** — Registry + renderers:
   - `SDC_RENDERERS: Record<string, React.FC<SDCRendererProps>>` registry
   - Individual approximate renderers for:
     - `hero` — full-width section with heading, subheading, CTA, background image
     - `section-heading` — heading + optional subheading
     - `card` — image + title + body + link
     - `button` — styled button/link
     - `container` / `flexi` — flex/grid layout wrapper
     - `accordion` — collapsible sections
     - `slider` — horizontal carousel approximation
     - `contact-card` — name, phone, email, address
     - `logo` — image with alt text
     - `tabs` — tab bar + content panels
     - `list` — ordered/unordered list
     - `text-block` — rich text content
     - `image` — responsive image with caption
     - `footer` — multi-column footer layout
   - `UnsupportedComponent` — generic placeholder for unmapped types (shows component name + prop summary)
   - All renderers use Tailwind classes and CSS custom properties (brand tokens)

2. **Unit tests** (`platform-app/src/lib/preview/__tests__/sdc-renderers.test.ts`):
   - Each renderer produces valid HTML structure
   - Unknown component_id falls back to UnsupportedComponent
   - Props are correctly mapped to rendered output
   - Brand token CSS variables referenced in styles

## Dependencies

- TASK-514 (types)

## Acceptance Criteria

- [ ] At least 15 SDC component types have approximate renderers
- [ ] Unknown components show informative placeholder (not blank/crash)
- [ ] Renderers use brand token CSS variables for theming
- [ ] Renderers use Tailwind classes (processed by CDN in iframe)
- [ ] Visual output is recognizably similar to the Drupal-rendered version
- [ ] Unit tests pass
