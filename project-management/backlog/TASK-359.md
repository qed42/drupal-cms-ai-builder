# TASK-359: Migrate markdown-renderer.ts to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Decoupling
**Phase:** 2 — Consumer Migration (Static Data)

## Description
Replace the hardcoded `COMPONENT_LABELS` map in `markdown-renderer.ts` with `adapter.getLabel()`. The label data is already ported into the Space DS adapter (TASK-356).

## Technical Approach
1. Read `platform-app/src/lib/blueprint/markdown-renderer.ts`
2. Remove `COMPONENT_LABELS` constant (31 entries)
3. Replace `getComponentLabel()` body with `getDefaultAdapter().getLabel(id)` or accept adapter as parameter
4. Update callers if function signature changes
5. Verify markdown output is identical

## Acceptance Criteria
- [ ] `COMPONENT_LABELS` removed from `markdown-renderer.ts`
- [ ] `getComponentLabel()` delegates to adapter
- [ ] No `space_ds:` string literals in this file
- [ ] Markdown rendering output unchanged

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/markdown-renderer.ts`
