# TASK-363: Migrate Composition Patterns to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 3 — Composition & Prompts

## Description
Move `COMPOSITION_PATTERNS` from `page-design-rules.ts` into the Space DS adapter. The consumer calls `adapter.getCompositionPatterns()` instead of importing the constant. Pattern names remain universal; the component IDs they reference become adapter-internal.

## Technical Approach
1. Read `platform-app/src/lib/ai/prompts/page-design-rules.ts`
2. Extract `COMPOSITION_PATTERNS` (14 named patterns with layout + children definitions)
3. Verify these are already ported into `packages/ds-space-ds/src/composition-patterns.ts` (TASK-356)
4. Replace the constant in `page-design-rules.ts` with `adapter.getCompositionPatterns()`
5. Update any functions that reference `COMPOSITION_PATTERNS` directly (e.g., `resolvePatternLabel()`)
6. Verify AI prompt output includes the same pattern definitions

## Acceptance Criteria
- [ ] `COMPOSITION_PATTERNS` removed from `page-design-rules.ts`
- [ ] Consumers call `adapter.getCompositionPatterns()`
- [ ] Pattern names unchanged (universal across adapters)
- [ ] No `space_ds:` string literals in composition pattern consumer code
- [ ] AI generation produces identical page designs

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-design-rules.ts`
- Any file importing `COMPOSITION_PATTERNS`
