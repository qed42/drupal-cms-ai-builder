# TASK-358: Migrate canvas-component-versions.ts to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Decoupling
**Phase:** 2 — Consumer Migration (Static Data)

## Description
Replace direct version hash lookups in `canvas-component-versions.ts` with adapter calls. The hash map is already ported into the Space DS adapter (TASK-356). This task makes the consumer use the adapter instead of its local data.

## Technical Approach
1. Read `platform-app/src/lib/blueprint/canvas-component-versions.ts`
2. Replace `CANVAS_COMPONENT_VERSIONS` constant with `adapter.getVersionHash()`
3. Replace `toCanvasComponentId()` with `adapter.toCanvasId()`
4. Replace `getComponentVersion()` with `adapter.getVersionHash()`
5. Update all callers to get adapter from pipeline context or registry
6. If the file becomes a thin wrapper, consider inlining calls at usage sites
7. Run snapshot tests to verify identical output

## Acceptance Criteria
- [ ] No `CANVAS_COMPONENT_VERSIONS` constant in platform-app (data lives in adapter)
- [ ] `toCanvasComponentId()` delegates to adapter
- [ ] All callers produce identical version hashes as before
- [ ] No `space_ds` string literals remain in this file

## Dependencies
- TASK-357 (adapter wired into platform-app)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/canvas-component-versions.ts`
- All files that import from `canvas-component-versions.ts`
