# TASK-309: Map/location embed for contact and location pages

**Story:** REQ-space-ds-component-gap-analysis §3.1 (Map/Location gap)
**Priority:** P2
**Estimated Effort:** M
**Milestone:** Component Coverage Expansion

## Description

Contact and location pages for local businesses are degraded without a map component. Space DS has no map component, so this requires either a Drupal contrib module or a simple iframe embed approach.

## Technical Approach

### Option A: Iframe embed via text-media component (Recommended for MVP)

1. **Use `space-text-media-default`** with an embedded iframe in the body content
2. **Generate Google Maps embed URL** from the business address during AI content generation
3. **Add map section** to contact page design rule as optional section type
4. **No new Drupal module needed** — iframe is just HTML in a text field

Pros: Zero Drupal overhead, works immediately
Cons: Not interactive, limited styling, depends on Google Maps embed (no API key needed for basic embed)

### Option B: Drupal Leaflet module (Post-MVP)

1. Install `drupal/leaflet` + `drupal/geofield` contrib modules
2. Add `field_location` (geofield) to site config entity
3. Create a custom block that renders Leaflet map from geofield
4. Place block in contact page Canvas layout

Pros: Interactive, OSM-based (no Google dependency), proper Drupal integration
Cons: Additional module dependencies, more complex provisioning

### Recommended: Start with Option A

1. **Update contact page design rule:**
   - Add optional `map` section type (position: "middle", visualWeight: "medium")
   - `preferredComponents: ["space_ds:space-text-media-with-link"]`

2. **Update AI content generation:**
   - When generating contact page content, include map embed HTML
   - Use Google Maps embed format: `https://www.google.com/maps/embed?pb=...`
   - Generate embed from business address provided in onboarding

3. **Add address extraction** to AI pipeline:
   - Extract physical address from business description or ask during onboarding
   - Geocode to map embed URL

4. **Create follow-up task** for Leaflet integration post-MVP

## Acceptance Criteria

- [ ] Contact page design rule includes optional map section
- [ ] AI generates map embed HTML when business address is available
- [ ] Map renders correctly in generated Drupal site
- [ ] No new Drupal modules required for MVP implementation
- [ ] Follow-up task created for proper Leaflet integration

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/lib/ai/page-design-rules.ts`
- `platform-app/src/lib/ai/prompts/page-layout.ts`
- `platform-app/src/lib/ai/prompts/content-generation.ts` (or equivalent)
