# TASK-367: Move Header/Footer Tree Builders into Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 4 — Section Builder Refactor

## Description
Move `buildHeaderTree()` (~60 lines) and `buildFooterTree()` (~75 lines) from `component-tree-builder.ts` into the Space DS adapter. These are inherently DS-specific: Space DS header uses `space_ds:space-header` with specific slot structure; Mercury uses `mercury:navbar` with different slots; CivicTheme uses `civictheme:header`.

## Technical Approach
1. Extract `buildHeaderTree()` (lines 789-851) from `component-tree-builder.ts`
2. Extract `buildFooterTree()` (lines 861-937) from `component-tree-builder.ts`
3. Verify these are already implemented in `packages/ds-space-ds/src/tree-builders.ts` (TASK-356)
4. Replace calls in `component-tree-builder.ts` with `adapter.buildHeaderTree(data)` and `adapter.buildFooterTree(data)`
5. Map existing header/footer data to `HeaderData` and `FooterData` interfaces from ds-types
6. Verify header and footer trees are identical

## Acceptance Criteria
- [ ] `buildHeaderTree()` and `buildFooterTree()` removed from `component-tree-builder.ts`
- [ ] Adapter methods produce identical CanvasItem trees
- [ ] HeaderData and FooterData correctly populated from pipeline data
- [ ] No `space_ds:space-header` or `space_ds:space-footer` references outside adapter

## Dependencies
- TASK-366 (tree builder refactor in progress)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `packages/ds-space-ds/src/tree-builders.ts`
