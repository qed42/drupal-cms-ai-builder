# TASK-370: Mercury Section Builder — All Composition Patterns

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
Implement `buildContentSection()` for Mercury using its `section` component (which combines container + grid). Must cover ALL composition patterns at parity with Space DS — no gaps.

Mercury's `section` component has: `columns` prop (10 layout options), `background_color`, `width`, `padding_block_start/end`, `margin_block_start/end`, and 3 slots (`header_slot`, `main_slot`, `footer_slot`).

## Technical Approach
1. Create `packages/ds-mercury/src/section-builder.ts`
2. Implement `buildContentSection()` for each pattern:
   - `text-image-50-50` → `section(columns: "50-50")` with heading+text+button in left, image in right
   - `text-image-66-33` → `section(columns: "67-33")`
   - `image-text-33-66` → `section(columns: "33-67")`
   - `features-grid-3col` → `section(columns: "33-33-33")` with `card-icon` children
   - `features-grid-4col` → `section(columns: "25-25-25-25")` with `card-icon` children
   - `stats-row` → `section(columns: "25-25-25-25")` with heading+text children (Mercury has no stats-kpi)
   - `testimonials-carousel` → `section` with `group` containing `card-testimonial` items (Mercury has no slider — use group with flex wrap)
   - `team-grid-4col` → `section(columns: "25-25-25-25")` with `card` children
   - `team-grid-3col` → `section(columns: "33-33-33")` with `card` children
   - `card-grid-3col` → `section(columns: "33-33-33")` with `card` children
   - `card-carousel` → `section` with `group` containing `card` items
   - `contact-info` → `section(columns: "33-33-33")` with `card-icon` children
   - `faq-accordion` → `section` with `accordion-container` → `accordion` items
   - `logo-showcase` → `section` with `group` containing `card-logo` items
   - `full-width-text` → `section(columns: "100")` with heading+text
   - `blog-grid` → `section(columns: "33-33-33")` with `card` children (with image, date props)
3. Handle background color mapping (Mercury uses: primary, secondary, accent, muted)
4. Handle section heading via `header_slot` of `section` component

## Acceptance Criteria
- [ ] ALL composition patterns from Space DS adapter are implemented (no gaps)
- [ ] Each pattern produces valid CanvasItem trees using Mercury components
- [ ] Background color alternation works with Mercury's color palette
- [ ] Patterns that lack a direct Mercury equivalent (carousel, stats) have composed alternatives
- [ ] Unit tests for each pattern

## Dependencies
- TASK-369 (Mercury manifest and role map)

## Files/Modules Affected
- `packages/ds-mercury/src/section-builder.ts` (new)
- `packages/ds-mercury/src/composition-patterns.ts` (new)
