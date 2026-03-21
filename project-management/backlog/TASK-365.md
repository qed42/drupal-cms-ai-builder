# TASK-365: Migrate Prompt Generation to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 3 — Composition & Prompts

## Description
Move `buildComponentPropReference()` and accessibility rules from `page-generation.ts` into the Space DS adapter's `buildPromptComponentReference()` and `buildPromptAccessibilityRules()` methods. The consumer calls the adapter methods instead of building prompts from hardcoded component lists.

## Technical Approach
1. Read `platform-app/src/lib/ai/prompts/page-generation.ts`
2. Extract `buildComponentPropReference()` (lists 23 components with props/slots)
3. Extract accessibility rules section (dark background restrictions, etc.)
4. Verify these are already implemented in `packages/ds-space-ds/src/prompt-fragments.ts` (TASK-356)
5. Replace direct calls with `adapter.buildPromptComponentReference()` and `adapter.buildPromptAccessibilityRules()`
6. Add call to `adapter.buildPromptDesignGuidance()` for DS-specific instructions
7. Verify generated prompts produce identical AI output

## Acceptance Criteria
- [ ] `buildComponentPropReference()` removed from `page-generation.ts`
- [ ] Accessibility rules sourced from adapter
- [ ] No `space_ds:` string literals in `page-generation.ts`
- [ ] AI prompts contain identical component reference information
- [ ] Prompt includes DS-specific design guidance from adapter

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-generation.ts`
