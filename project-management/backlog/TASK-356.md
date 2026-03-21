# TASK-356: Create @ai-builder/ds-space-ds Adapter Package

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 1 — Foundation

## Description
Create the `packages/ds-space-ds/` workspace package implementing the `DesignSystemAdapter` interface for Space DS v2. Port all existing hardcoded data (manifest, role map, labels, versions, image mappings, prop overrides, composition patterns, design rules) into this package.

## Technical Approach
1. Create `packages/ds-space-ds/` with `package.json` (`@ai-builder/ds-space-ds`)
2. Move `platform-app/src/lib/ai/space-component-manifest.json` → `packages/ds-space-ds/src/manifest.json`
3. Create `src/role-map.ts` — map all ComponentRoles to `space_ds:*` IDs (from architecture doc Section 8)
4. Create `src/labels.ts` — port `COMPONENT_LABELS` from `markdown-renderer.ts`
5. Create `src/versions.ts` — port `CANVAS_COMPONENT_VERSIONS` from `canvas-component-versions.ts`
6. Create `src/image-mappings.ts` — port `IMAGE_PROP_MAP` from `image-intent.ts`
7. Create `src/prop-overrides.ts` — port `PROP_OVERRIDES` from `component-tree-builder.ts`
8. Create `src/composition-patterns.ts` — port `COMPOSITION_PATTERNS` from `page-design-rules.ts`
9. Create `src/design-rules.ts` — port `PAGE_DESIGN_RULES` from `page-design-rules.ts` (convert hardcoded IDs to roles where possible)
10. Create `src/section-builder.ts` — implement `buildContentSection()` using container→flexi→atoms model
11. Create `src/tree-builders.ts` — port `buildHeaderTree()` and `buildFooterTree()` from `component-tree-builder.ts`
12. Create `src/prompt-fragments.ts` — port `buildComponentPropReference()` and accessibility rules from `page-generation.ts`
13. Create `src/brand-tokens.ts` — implement `prepareBrandPayload()` returning `drupal-config` type with `space_ds.settings` mapping
14. Create `src/index.ts` — assemble and export the adapter object
15. Register adapter in a setup module

## Acceptance Criteria
- [ ] `packages/ds-space-ds/` exists with valid `package.json` depending on `@ai-builder/ds-types`
- [ ] Adapter satisfies the `DesignSystemAdapter` interface (TypeScript compilation passes)
- [ ] All 31 Space DS v2 components present in manifest
- [ ] All required + standard roles resolve to valid component IDs
- [ ] `buildContentSection()` produces identical CanvasItem trees to current `component-tree-builder.ts` output for all patterns
- [ ] `buildHeaderTree()` and `buildFooterTree()` produce identical output to current implementations
- [ ] `buildPromptComponentReference()` produces equivalent prompt text
- [ ] `prepareBrandPayload()` returns correct `space_ds.settings` config shape

## Dependencies
- TASK-355 (@ai-builder/ds-types)

## Files/Modules Affected
- `packages/ds-space-ds/` (new)
- Data ported from:
  - `platform-app/src/lib/ai/space-component-manifest.json`
  - `platform-app/src/lib/blueprint/canvas-component-versions.ts`
  - `platform-app/src/lib/blueprint/markdown-renderer.ts`
  - `platform-app/src/lib/blueprint/component-tree-builder.ts`
  - `platform-app/src/lib/ai/prompts/page-generation.ts`
  - `platform-app/src/lib/ai/prompts/page-design-rules.ts`
  - `platform-app/src/lib/blueprint/image-intent.ts`
