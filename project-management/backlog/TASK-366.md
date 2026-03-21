# TASK-366: Refactor Tree Builder to Use Adapter Section Composition

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M19 — Design System Decoupling
**Phase:** 4 — Section Builder Refactor

## Description
This is the most significant refactor. Transform `component-tree-builder.ts` from a Space DS-specific builder into a thin orchestrator that delegates section composition to the adapter's `buildContentSection()` method.

Currently the tree builder has ~938 lines with hardcoded `space_ds:*` references throughout. After this task, it should call adapter methods for all DS-specific logic while retaining the orchestration flow (iterate sections, apply backgrounds, sequence heroes).

## Technical Approach
1. Read `platform-app/src/lib/blueprint/component-tree-builder.ts` thoroughly
2. Replace `FULL_WIDTH_ORGANISMS` with `adapter.getFullWidthOrganisms()` (resolves from hero role)
3. Replace `ORGANISM_PATTERNS` with adapter pattern resolution
4. Replace `PROP_OVERRIDES` with `adapter.getPropOverrides()`
5. Refactor `buildComposedSection()` (~200 lines) to call `adapter.buildContentSection(pattern, children, options)` — this is the core change
6. Refactor `buildOrganismSection()` to call `adapter.buildHeroSection()` or `adapter.buildContentSection()` based on component type
7. Keep the orchestration logic in the tree builder:
   - Page-level section ordering
   - Background color alternation (using `adapter.getColorPalette()`)
   - Hero detection and special handling
   - Section heading injection
8. Remove `wrapInContainer()`, `createSectionHeading()`, `createItem()` — these move into adapter
9. **Critical:** Snapshot test before and after — generate a full page tree with the old code, then with the new code, and diff

## Acceptance Criteria
- [ ] No `space_ds:` string literals in `component-tree-builder.ts`
- [ ] No direct manifest import in this file
- [ ] `buildComposedSection()` delegates to `adapter.buildContentSection()`
- [ ] `buildOrganismSection()` delegates to adapter for component creation
- [ ] Background color alternation uses `adapter.getColorPalette()`
- [ ] Snapshot comparison: identical CanvasItem output for all page types
- [ ] File reduced from ~938 lines to ~300-400 lines (orchestration only)

## Dependencies
- TASK-363 (composition patterns in adapter)
- TASK-364 (page design rules in adapter)
- TASK-362 (placeholder image in adapter)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (major refactor)
