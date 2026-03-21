# TASK-361: Migrate component-validator.ts to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Decoupling
**Phase:** 2 — Consumer Migration (Static Data)

## Description
Replace the direct manifest JSON import in `component-validator.ts` with `adapter.getManifest()`. This file is already largely manifest-driven (no hardcoded component IDs), so the change is minimal.

## Technical Approach
1. Read `platform-app/src/lib/blueprint/component-validator.ts`
2. Replace `import manifest from '../ai/space-component-manifest.json'` with adapter call
3. Build the component index from `adapter.getManifest()` instead of direct JSON import
4. Verify validation produces identical results (strips invalid props, fills defaults)

## Acceptance Criteria
- [ ] No direct import of `space-component-manifest.json`
- [ ] Validator uses `adapter.getManifest()` for component lookup
- [ ] Validation behavior unchanged
- [ ] Props stripping and default filling work identically

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-validator.ts`
