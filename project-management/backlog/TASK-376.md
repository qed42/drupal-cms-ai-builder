# TASK-376: CivicTheme Section Builder — Pattern-to-Organism Mapping

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
Implement `buildContentSection()` for CivicTheme. This is the most architecturally different adapter: CivicTheme uses pre-composed organisms instead of composing sections from grid primitives. Each universal pattern must map to a CivicTheme organism or a composed equivalent.

**Critical difference:** Where Space DS composes `container → flexi(50-50) → [heading, text | image]`, CivicTheme selects `civictheme:promo` which IS a text+image section.

## Technical Approach
1. Create `packages/ds-civictheme/src/section-builder.ts`
2. Map each pattern to CivicTheme component(s):
   - `text-image-50-50` → `civictheme:promo` (image, title, content, link props)
   - `text-image-66-33` → `civictheme:promo` (same component, CivicTheme handles layout)
   - `image-text-33-66` → `civictheme:promo` (reversed)
   - `features-grid-3col` → 3× `civictheme:navigation-card` in CivicTheme Layout component
   - `features-grid-4col` → 4× `civictheme:navigation-card` in Layout
   - `stats-row` → 4× `civictheme:heading` + `civictheme:paragraph` in Layout (no stats-kpi → compose from primitives)
   - `testimonials-carousel` → `civictheme:slider` with `civictheme:snippet` items
   - `team-grid-4col` → 4× `civictheme:promo-card` in Layout (no user-card → use promo-card)
   - `team-grid-3col` → 3× `civictheme:promo-card` in Layout
   - `card-grid-3col` → 3× `civictheme:promo-card` in Layout
   - `card-carousel` → `civictheme:carousel` with card items
   - `contact-info` → 3× `civictheme:service-card` in Layout
   - `faq-accordion` → `civictheme:accordion` with accordion items
   - `logo-showcase` → `civictheme:navigation-card` grid with images
   - `full-width-text` → `civictheme:callout` or heading+paragraph
   - `blog-grid` → 3× `civictheme:publication-card` in Layout
3. Handle CivicTheme's light/dark theme toggle per section
4. Map background colors to CivicTheme's theme system

## Acceptance Criteria
- [ ] ALL composition patterns implemented — no gaps vs Space DS and Mercury
- [ ] Each pattern produces valid CanvasItem trees using CivicTheme components
- [ ] Pre-composed organisms used where available (promo, callout, etc.)
- [ ] Patterns without direct equivalent composed from primitives + Layout
- [ ] Light/dark theme correctly applied per section
- [ ] Unit tests for each pattern

## Dependencies
- TASK-375 (CivicTheme manifest and role map)

## Files/Modules Affected
- `packages/ds-civictheme/src/section-builder.ts` (new)
- `packages/ds-civictheme/src/composition-patterns.ts` (new)
