# TASK-383: Adapter Contract Test Suite

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 7 — Cleanup & Onboarding

## Description
Create a shared test suite that validates every adapter against the `DesignSystemAdapter` interface contract. This ensures all three adapters meet the same quality bar and new adapters can be validated automatically.

## Technical Approach
1. Create `packages/ds-types/src/__tests__/adapter-contract.test.ts`
2. Export a `runAdapterContractTests(adapter: DesignSystemAdapter)` function
3. Test categories:

**Registry Tests:**
- Adapter has valid `id`, `name`, `themeName`, `composerPackage`

**Role Resolution Tests:**
- All required roles (`container`, `heading`, `text`, `image`, `button`, `link`) resolve to at least one component
- Exception: CivicTheme `container` may resolve empty (handled by section builder)
- `resolveRole()` returns only IDs present in manifest
- `primaryComponent()` returns the first from `resolveRole()`
- `supportsRole()` matches `resolveRole().length > 0`

**Manifest Tests:**
- `getManifest()` returns non-empty array
- Every component has `id`, `name`, `props`
- No duplicate component IDs

**Composition Tests:**
- `getCompositionPatterns()` returns non-empty array
- All pattern names are unique
- `buildContentSection()` returns valid CanvasItem for every pattern
- CanvasItem component IDs match manifest entries

**Tree Builder Tests:**
- `buildHeaderTree()` returns valid CanvasItem
- `buildFooterTree()` returns valid CanvasItem
- `buildHeroSection()` works for each hero variant

**Metadata Tests:**
- `getVersionHash()` returns string for every manifest component
- `toCanvasId()` produces valid Canvas format
- `getLabel()` returns non-empty string for every manifest component
- `getColorPalette()` has non-empty values, darkBackgrounds, lightBackgrounds

**Prompt Tests:**
- `buildPromptComponentReference()` returns non-empty string
- Prompt string mentions at least the required role components

4. Import and run in each adapter's test file:
   ```typescript
   import { runAdapterContractTests } from '@ai-builder/ds-types/testing';
   import { spaceDsAdapter } from '../src';
   runAdapterContractTests(spaceDsAdapter);
   ```

## Acceptance Criteria
- [ ] Contract test suite covers all interface methods
- [ ] Space DS adapter passes all contract tests
- [ ] Mercury adapter passes all contract tests
- [ ] CivicTheme adapter passes all contract tests
- [ ] New adapter authors can run tests to validate their implementation

## Dependencies
- TASK-355 (ds-types package)
- TASK-356 (Space DS adapter)
- TASK-369 (Mercury adapter)
- TASK-375 (CivicTheme adapter)

## Files/Modules Affected
- `packages/ds-types/src/__tests__/adapter-contract.test.ts` (new)
- `packages/ds-space-ds/src/__tests__/` (new)
- `packages/ds-mercury/src/__tests__/` (new)
- `packages/ds-civictheme/src/__tests__/` (new)
