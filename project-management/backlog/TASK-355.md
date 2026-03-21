# TASK-355: Create @ai-builder/ds-types Workspace Package

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 1 — Foundation

## Description
Create the `packages/ds-types/` workspace package that defines the shared `DesignSystemAdapter` interface, all supporting types (`ComponentRole`, `ComponentDefinition`, `CompositionPattern`, `PageDesignRule`, `BrandTokens`, `CanvasItem`, etc.), the adapter registry, and a base adapter class with shared utility logic (fallback resolution, Canvas ID conversion).

## Technical Approach
1. Create `packages/ds-types/` directory with `package.json` (`@ai-builder/ds-types`)
2. Create `src/types.ts` — all interfaces and types from architecture doc Section 5.1 and 5.2
3. Create `src/registry.ts` — `registerAdapter()`, `getAdapter()`, `listAdapters()`
4. Create `src/base-adapter.ts` — abstract base with `resolveWithFallback()`, default `toCanvasId()`, default `getLabel()` implementations
5. Create `src/index.ts` — re-export all public API
6. Configure TypeScript compilation (`tsconfig.json`)
7. Update root `package.json` with workspace config if not already present
8. Add `@ai-builder/ds-types` as dependency in `platform-app/package.json`

## Acceptance Criteria
- [ ] `packages/ds-types/` exists with valid `package.json`
- [ ] All types from architecture doc Section 5.1 and 5.2 are defined and exported
- [ ] Registry correctly stores, retrieves, and lists adapters
- [ ] Base adapter provides fallback chain from architecture doc Section 9
- [ ] TypeScript compiles with no errors
- [ ] `platform-app` can import `@ai-builder/ds-types` via workspace resolution

## Dependencies
- None (first task in the chain)

## Files/Modules Affected
- `packages/ds-types/` (new)
- `package.json` (root — workspace config)
- `platform-app/package.json` (new dependency)
