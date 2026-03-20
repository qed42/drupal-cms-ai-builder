# TASK-324: Fix NULL image props breaking Canvas component rendering

**Priority:** P0 (Bug — blocks rendering)
**Estimated Effort:** M
**Milestone:** M15 — Space DS v2 Theme Migration

## Description

Image props that have no value in the component tree are being saved as NULL in Canvas, which prevents the component from picking up the default value defined in the `.component.yml` file. This breaks component rendering on the UI.

## Root Cause

When the AI generates a component tree without populating an image prop (e.g., `image: null` or missing entirely), the BlueprintImportService passes this through to Canvas. Canvas stores NULL explicitly, which overrides the component's default value and causes rendering failure.

## Technical Approach

### Fix 1: Tree Builder — Strip empty image props
In `component-tree-builder.ts`, the `createItem()` function should strip any image-type props that are `null`, `undefined`, or empty objects. This allows Canvas to fall back to the component's default.

### Fix 2: BlueprintImportService — Filter NULL inputs
In `BlueprintImportService.php`, the `prepareComponentTree()` method should filter out NULL-valued inputs before saving. Specifically:
- Remove any input where value is `NULL`
- Remove any image-type input where the value is an empty object `{}`
- Log a warning when filtering these values

### Fix 3: Component Validator — Flag empty images
In `component-validator.ts`, the `validateSections()` function should strip null/empty image props during validation and issue a warning.

## Acceptance Criteria

- [ ] Image props with NULL value are stripped from component tree before Canvas save
- [ ] Image props with empty object `{}` are stripped
- [ ] Canvas components render correctly when image prop is not provided (falls back to component default)
- [ ] Warning logged when NULL image prop is filtered out
- [ ] No regression — components WITH valid images still work

## Files Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
- `platform-app/src/lib/blueprint/component-validator.ts`
