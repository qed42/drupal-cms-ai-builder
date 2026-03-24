# TASK-387: Export image-intent helpers and add composed section child support

**Story:** Infrastructure — Image Pipeline Refactoring
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction

## Description

The `extractImageIntents()` function in `image-intent.ts` only scans top-level `section.component_id` — it never iterates `section.children[]`. This means cards inside composed sections (e.g., `mercury:card` with `media` prop in a 3-column grid) never get real Pexels images. Additionally, `buildSearchQuery()` and `getComponentTypeHint()` are private functions that need to be exported for reuse by the new image resolver (TASK-388).

## Technical Approach

1. **Export `buildSearchQuery()`** — change from `function` to `export function`. No logic changes.
2. **Export `getComponentTypeHint()`** — same treatment.
3. **Add `childIndex?: number` to `ImageIntent` interface** — optional field to track which child in a composed section the intent targets.
4. **Extend `extractImageIntents()` loop** — after processing the top-level section (line 63), add a nested loop that iterates `section.children[]`:
   - For each child, call `adapter.getImageMapping(child.component_id)`
   - For each mapped image prop, skip if `child.props[propName]` already populated
   - Push intent with `childIndex` set
   - Use `buildSearchQuery(section, page, industry, audience)` for query context (parent section has better text context than individual cards)
5. **Update enhance phase injection** — in `enhance.ts`, when processing intents with `childIndex`, inject into `section.children[childIndex].props[propName]` instead of `section.props[propName]`

## Acceptance Criteria

- [ ] `buildSearchQuery()` and `getComponentTypeHint()` are exported
- [ ] `ImageIntent` interface has optional `childIndex` field
- [ ] `extractImageIntents()` produces intents for children of composed sections (e.g., `mercury:card` inside a `features-grid-3col` pattern)
- [ ] Existing top-level intent extraction unchanged (backward compatible)
- [ ] `enhance.ts` correctly injects images into child props when `childIndex` is present
- [ ] TypeScript compiles cleanly
- [ ] All existing tests pass

## Dependencies

- None

## Files/Modules Affected

- `platform-app/src/lib/images/image-intent.ts`
- `platform-app/src/lib/pipeline/phases/enhance.ts`
