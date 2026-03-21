# TASK-357: Wire Platform-App to Use Space DS Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 1 — Foundation

## Description
Update `platform-app` to import and register the Space DS adapter, then wire the pipeline context to use `getAdapter()`. This is the integration point — after this task, the adapter is available but consumers still use direct imports (migrated in Phase 2).

## Technical Approach
1. Add `@ai-builder/ds-space-ds` as dependency in `platform-app/package.json`
2. Create `platform-app/src/lib/design-systems/setup.ts` — imports and registers Space DS adapter
3. Import setup module in app initialization (e.g., `layout.tsx` or pipeline entry)
4. Add `designSystemId` field to onboarding session state (default: `"space_ds"`)
5. Update `PipelineContext` type to include `designSystem: DesignSystemAdapter`
6. At pipeline start, call `getAdapter(session.designSystemId)` and attach to context
7. Verify existing pipeline still works end-to-end with no behavioral changes

## Acceptance Criteria
- [ ] Space DS adapter is registered at app startup
- [ ] `getAdapter('space_ds')` returns the adapter throughout the app
- [ ] Onboarding session stores `designSystemId`
- [ ] Pipeline context has `designSystem` field populated
- [ ] All existing functionality unchanged — no regression
- [ ] Build succeeds with workspace resolution

## Dependencies
- TASK-356 (@ai-builder/ds-space-ds)

## Files/Modules Affected
- `platform-app/package.json`
- `platform-app/src/lib/design-systems/setup.ts` (new)
- `platform-app/src/lib/pipeline/context.ts` (or equivalent)
- Onboarding session type definition
