# TASK-360: Migrate image-intent.ts to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Decoupling
**Phase:** 2 — Consumer Migration (Static Data)

## Description
Replace the hardcoded `IMAGE_PROP_MAP` in `image-intent.ts` with `adapter.getImageMapping()`. The image mapping data is already ported into the Space DS adapter (TASK-356).

## Technical Approach
1. Read `platform-app/src/lib/blueprint/image-intent.ts`
2. Remove `IMAGE_PROP_MAP` constant (11 component entries)
3. Replace lookups with `adapter.getImageMapping(componentId)`
4. Update callers to pass adapter or use registry
5. Verify image intent detection produces identical results

## Acceptance Criteria
- [ ] `IMAGE_PROP_MAP` removed from `image-intent.ts`
- [ ] Image mapping lookups delegate to adapter
- [ ] No `space_ds:` string literals in this file
- [ ] Image intent detection unchanged

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/image-intent.ts`
