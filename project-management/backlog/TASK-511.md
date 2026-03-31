# TASK-511: Enable Design Rules by Default (Remove Feature Flag Gate)

**Story:** US-110 — Enable Design Rules by Default
**Priority:** P1
**Effort:** S
**Milestone:** M27 — Design Rules Engine

## Description

Change `getDesignRules()` to return rules by default instead of requiring `ENABLE_DESIGN_RULES=true`. Switch to opt-out: only skip rules when `ENABLE_DESIGN_RULES=false`.

## Technical Approach

1. In `platform-app/src/lib/rules/index.ts`, change:
   ```typescript
   // Before:
   if (process.env.ENABLE_DESIGN_RULES !== "true") return null;
   // After:
   if (process.env.ENABLE_DESIGN_RULES === "false") return null;
   ```
2. Update the `__tests__/index.test.ts` to reflect the new default behavior
3. Remove `ENABLE_DESIGN_RULES=true` from any `.env.example` or deployment config
4. Verify no other code checks this flag

## Acceptance Criteria

- [ ] Design rules resolve when no env var is set (default ON)
- [ ] `ENABLE_DESIGN_RULES=false` disables rules (opt-out)
- [ ] SDC mode still skips rules (generationMode check unchanged)
- [ ] Tests updated
- [ ] No regression

## Dependencies

- TASK-509 (Token integration verified)
- TASK-510 (P1 rules added)
