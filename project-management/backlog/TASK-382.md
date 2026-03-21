# TASK-382: Remove All Direct Space DS References from Non-Adapter Code

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 7 — Cleanup & Onboarding

## Description
Final cleanup: remove all remaining `space_ds:` string literals, direct manifest imports, and Space DS-specific constants from platform-app and provisioning code. After this task, no non-adapter code should reference Space DS directly.

## Technical Approach
1. Search entire codebase for `space_ds` string occurrences outside `packages/ds-space-ds/`
2. Search for imports of `space-component-manifest.json` outside adapters
3. Search for hardcoded component IDs (`space_ds:space-*`) outside adapters
4. For each occurrence:
   - If it's a consumer that should use adapter: replace with adapter call
   - If it's the old manifest file: delete it (data now in adapter package)
   - If it's a test: update to use adapter or be adapter-agnostic
5. Delete `platform-app/src/lib/ai/space-component-manifest.json` (moved to adapter)
6. Run full test suite to verify no regressions
7. Run TypeScript compilation to catch any broken imports

## Acceptance Criteria
- [ ] Zero `space_ds:` string literals in platform-app (outside adapter package)
- [ ] Zero `space_ds:` string literals in provisioning (outside adapter package)
- [ ] `space-component-manifest.json` removed from `platform-app/src/lib/ai/`
- [ ] All imports resolve correctly
- [ ] Full test suite passes
- [ ] Pipeline generates identical output for Space DS theme

## Dependencies
- TASK-366 (tree builder refactored)
- TASK-367 (header/footer in adapter)
- TASK-368 (provisioning migrated)
- TASK-365 (prompts migrated)

## Files/Modules Affected
- `platform-app/src/lib/ai/space-component-manifest.json` (delete)
- Any remaining files with `space_ds` references
