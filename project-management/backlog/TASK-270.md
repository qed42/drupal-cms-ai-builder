# TASK-270: Fix Sprint 13 QA Bugs (BUG-S13-001, BUG-S13-002, BUG-S13-003)

**Story:** Sprint 13 QA
**Priority:** P0
**Effort:** S
**Sprint:** 14

## Description

Fix the 3 bugs identified during Sprint 13 QA before proceeding with new features.

### BUG-S13-001 (High) — Dynamic Route Conflict
Next.js dynamic route conflict: `[id]` and `[siteId]` coexist at `/api/blueprint/`. Routes have already been consolidated under `[siteId]` in the bug fix commit (756c344), but verify this is fully resolved.

### BUG-S13-002 (Medium) — Duplicate Functions
`handleApprove` and `handleSkip` are identical duplicate functions in `ApproveButton.tsx`. Consolidate into a single function.

### BUG-S13-003 (Medium) — No Exit Navigation
No exit navigation from review page — user can't return to dashboard without approving. A back button was added in 756c344, verify it works correctly.

## Acceptance Criteria

- [ ] No duplicate route segments under `/api/blueprint/`
- [ ] `ApproveButton.tsx` has no duplicate function bodies
- [ ] Review page has working back-to-dashboard navigation
- [ ] All existing tests pass after fixes

## Dependencies

- None
