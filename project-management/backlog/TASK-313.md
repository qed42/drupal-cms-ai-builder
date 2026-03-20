# TASK-313: Rewrite page-design-rules.ts for Space DS v2 compositional model

**Story:** Space DS v2 Migration
**Priority:** P0
**Estimated Effort:** L
**Milestone:** Space DS v2 Migration

## Description

The entire `page-design-rules.ts` references 50+ components that no longer exist. The new Space DS v2 uses a compositional model where sections are built from layout primitives (`space-flexi`, `space-container`) + atoms/molecules placed in slots. Page design rules must teach the AI how to compose sections rather than pick pre-built organisms.

## Technical Approach

### 1. Update PageType and keep existing types
The 10 page types (home, about, services, contact, portfolio, pricing, faq, team, landing, generic) remain valid.

### 2. Introduce composition patterns as new concept

Add a `CompositionPattern` type that describes how to build a section:

```typescript
interface CompositionPattern {
  name: string;  // e.g., "text-image-split", "features-grid", "testimonials-carousel"
  container: { background_color: string; width: string; padding_top: string; padding_bottom: string; };
  layout: {
    component: "space_ds:space-flexi";
    column_width: string;  // "50-50", "33-33-33", etc.
    gap: string;
  } | null;  // null for single-column or organism-level components
  children: string[];  // Component IDs to compose (atoms/molecules)
  description: string;  // For AI prompt
}
```

### 3. Rewrite section rules with new component references

**Heroes** — Map to 4 available heroes:
- `space_ds:space-hero-banner-style-02` (full-width bg image, title, sub_headline, stats items slot)
- `space_ds:space-hero-banner-with-media` (hero with featured image, label, categories)
- `space_ds:space-detail-page-hero-banner` (article/detail hero)
- `space_ds:space-video-banner` (video hero)

**Content sections** — Map to flexi compositions:
- Text + Image → `flexi(50-50)` or `flexi(66-33)` with heading + text + button / image
- Features → `flexi(33-33-33)` with icon + heading + text per column
- Stats → `flexi(25-25-25-25)` with stats-kpi in each column, or hero items slot

**Card sections** — Map to slider or flexi:
- Testimonials → `slider` with testimony-cards in slide_item slot
- Blog/portfolio → `flexi(33-33-33)` or `slider` with imagecards
- Team → `flexi(25-25-25-25)` with user-cards

**Special sections:**
- CTA → `space_ds:space-cta-banner-type-1` (direct organism)
- FAQ → `space_ds:space-accordion` with accordion-item children
- Contact → `flexi(33-33-33)` with contact-cards
- Logo bar → `space_ds:space-logo-section` with images in content slot

### 4. Update section heading pattern
Every content section should start with `space-section-heading` (label, title, description, alignment) before the content flexi.

### 5. Update compositionGuidance for all page types
Replace old organism references with flexi composition instructions.

### 6. Update formatRulesForPlan() and formatRulesForGeneration()
These functions generate the AI prompt text — they must output composition patterns, not just component IDs.

## Acceptance Criteria

- [ ] All 10 page types have valid rules referencing only v2 components
- [ ] No references to deleted components (text-media, old heroes, team sections, etc.)
- [ ] Composition patterns documented for: text-image, features-grid, stats-row, testimonials-carousel, team-grid, card-grid, contact-info, logo-bar
- [ ] `formatRulesForPlan()` outputs composition guidance
- [ ] `formatRulesForGeneration()` outputs component IDs + slot instructions
- [ ] `classifyPageType()` unchanged (page type detection still works)
- [ ] Tests updated for new component references

## Dependencies
- TASK-312 (manifest rebuild — need to know exact component IDs and props)

## Files/Modules Affected
- `platform-app/src/lib/ai/page-design-rules.ts` (complete rewrite of rules data, formatters)
