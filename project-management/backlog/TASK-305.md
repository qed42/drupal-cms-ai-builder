# TASK-305: Wire underutilized Space DS components into page design rules

**Story:** REQ-space-ds-component-gap-analysis §3.3
**Priority:** P1
**Estimated Effort:** M
**Milestone:** Component Coverage Expansion

## Description

9 components exist in `space-component-manifest.json` but are never referenced in `page-design-rules.ts` or `component-tree-builder.ts`. Wire them into appropriate page types to increase component utilization from ~25 to ~35 usable components — a 40% increase with zero new component development.

## Components to Wire

| Component | Target Page Types | Section Type |
|-----------|------------------|--------------|
| `space-logo-grid` | home, landing, services | `logos` (new section type) |
| `space-icon-card` | services, home, landing | `features` (alternative to text-media) |
| `space-video-card` | about, services | `video` (new section type) |
| `space-timeline-card` | about | `timeline` (new section type) |
| `space-slider` | portfolio | `gallery` (enhance existing) |
| `space-notification-banner` | all page types | `notification` (new, optional opening) |
| `space-accordion-with-image-variation-1` | faq, services | `faq` (alternative to plain accordion) |
| `space-accordion-with-image-variation-2` | faq, services | `faq` (alternative) |
| `space-accordion-with-image-variation-3` | faq | `faq` (alternative) |

## Technical Approach

1. **Update `page-design-rules.ts`:**
   - Add `space_ds:space-logo-grid` as optional `logos` section to home, landing, services rules
   - Add `space_ds:space-icon-card` to `preferredComponents` for `features` sections in services and home
   - Add `space_ds:space-video-card` as optional `video` section to about and services rules
   - Add `space_ds:space-timeline-card` as optional `timeline` section to about rule
   - Add `space_ds:space-slider` to portfolio `gallery` section `preferredComponents`
   - Add accordion-with-image variants to FAQ and services `faq` section `preferredComponents`
   - Add `space_ds:space-notification-banner` as optional section (position: "opening") to all page types

2. **Update `component-tree-builder.ts`:**
   - Add `space-slider` to `SKIP_CONTAINER` set (likely full-width)
   - Add `space-notification-banner` to `SKIP_CONTAINER` set
   - Add accordion-with-image variants to `VARIANT_FAMILIES` map under accordion family

3. **Update `formatRulesForGeneration()` fallback map:**
   - Add `logos` → `["space_ds:space-logo-grid"]`
   - Add `video` → `["space_ds:space-video-card"]`
   - Add `timeline` → `["space_ds:space-timeline-card"]`
   - Update `gallery/images` to include slider

4. **Verify manifest props** for each component to ensure the AI prompt knows what props to generate (read manifest entries for each component)

## Acceptance Criteria

- [ ] All 9 components appear in at least one page type's `preferredComponents` or as new section types
- [ ] `component-tree-builder.ts` handles the new components correctly (container wrapping, variant families)
- [ ] `formatRulesForGeneration()` includes mappings for all new section types
- [ ] Existing tests pass — no regression in currently-used component patterns
- [ ] New tests verify classification of new section types produces correct component IDs

## Dependencies
- None (purely additive to existing rules)

## Files/Modules Affected
- `platform-app/src/lib/ai/page-design-rules.ts`
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
