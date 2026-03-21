# TASK-362: Migrate Placeholder Image Path to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Decoupling
**Phase:** 2 — Consumer Migration (Static Data)

## Description
Replace the hardcoded Space DS placeholder image path in `component-tree-builder.ts` (line ~269) with `adapter.getPlaceholderImagePath()`.

## Technical Approach
1. Read `platform-app/src/lib/blueprint/component-tree-builder.ts`
2. Find the hardcoded path: `/themes/contrib/space_ds/components/01-atoms/space-image/images/city.jpeg`
3. Replace with `adapter.getPlaceholderImagePath()`
4. Verify tree builder uses correct path in generated trees

## Acceptance Criteria
- [ ] No hardcoded Space DS theme path in `component-tree-builder.ts`
- [ ] Placeholder images resolve to the correct theme-specific path
- [ ] Generated component trees have correct image paths

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (single line change)
