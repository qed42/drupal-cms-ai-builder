# TASK-109b: Blueprint Generator — Canvas Component Tree Output

**Story:** US-013 (Page Generation)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Blueprint & Provisioning

## Description
Update the Next.js blueprint generator to produce Canvas-ready `component_tree` structures for each page, in addition to the existing `sections` array. The component tree format is documented in the TASK-123 spike output.

## Context
Sprint 03's blueprint generator (TASK-109) produces pages with `sections: [{ component_id, props }]` — a human-readable representation. For Drupal provisioning, each page needs a `component_tree` field containing the exact Canvas entity structure that can be saved directly to `canvas_page` entities without any Drupal-side transformation.

## Technical Approach

### 1. Add Component Tree Builder
- New module: `platform-app/src/lib/blueprint/component-tree-builder.ts`
- Input: `PageSection[]` (existing sections array) + Space DS manifest
- Output: Canvas `component_tree` object matching the format from TASK-123 spike
- Handles:
  - UUID generation for each component node
  - Proper nesting of components into regions/slots
  - Prop mapping from our simplified format → Canvas prop format
  - Space DS SDC component ID references (`space_ds:space-*`)

### 2. Update Generator Pipeline
- Modify `platform-app/src/lib/blueprint/generator.ts`:
  - After page layout AI call produces `sections`, run component tree builder
  - Add `component_tree` to each page in the `BlueprintBundle`
- Modify fallback page generation to also produce component trees

### 3. Update Types
- Add `component_tree` to `PageLayout` interface in `types.ts`:
  ```typescript
  export interface PageLayout {
    slug: string;
    title: string;
    seo: { meta_title: string; meta_description: string };
    sections: PageSection[];           // Human-readable (retained)
    component_tree: Record<string, unknown>;  // Canvas-ready (new)
  }
  ```

## Acceptance Criteria
- [ ] Each page in blueprint output includes `component_tree` field
- [ ] Component tree format matches Canvas entity structure (per TASK-123 spike doc)
- [ ] Tree contains valid Space DS SDC component references
- [ ] Props correctly mapped from sections format to Canvas tree format
- [ ] Fallback pages also include valid component trees
- [ ] Existing blueprint generation tests updated and passing
- [ ] Integration test: generated tree can be saved to `canvas_page` entity in Drupal

## Dependencies
- TASK-123 (Spike — documents the Canvas component tree format) — **BLOCKER**
- TASK-109 (Blueprint generator — base to modify) ✅ Done

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (new)
- `platform-app/src/lib/blueprint/generator.ts` (modified)
- `platform-app/src/lib/blueprint/types.ts` (modified)
- `platform-app/tests/task-109-blueprint-generation.spec.ts` (modified)
