# TASK-308: Gallery organism — compose slider + imagecard for portfolio pages

**Story:** REQ-space-ds-component-gap-analysis §3.1 (Image Gallery gap)
**Priority:** P1
**Estimated Effort:** M
**Milestone:** Component Coverage Expansion

## Description

Portfolio pages currently use `space-text-media-with-images` as a workaround for gallery sections. The manifest already has `space-slider` and `space-imagecard` components that can be composed into a proper gallery section.

This task:
1. Wires `space-slider` + `space-imagecard` into a gallery composition pattern
2. Updates portfolio page design rules to use the gallery pattern
3. Updates component-tree-builder to handle slider → imagecard parent-child nesting
4. Adds gallery section support to the AI generation prompts

## Technical Approach

1. **Read `space-slider` manifest entry** — understand its props and slots (likely has a `slides` or `content` slot for child components)

2. **Read `space-imagecard` manifest entry** — understand how it renders image + caption

3. **Update `component-tree-builder.ts`:**
   - Add `buildGalleryTree(images: GalleryImage[])` function
   - Create parent `space-slider` component
   - Create child `space-imagecard` components in the slider's content slot
   - Add `space-slider` to `SKIP_CONTAINER` if it's full-width

4. **Update portfolio page design rule:**
   - Change `gallery` section's `preferredComponents` from text-media-with-images to `space-slider`
   - Add `compositionGuidance` for gallery: "GALLERY: MUST use space-slider organism with space-imagecard children for portfolio/gallery sections"

5. **Update AI generation prompt** to generate gallery content with image URLs and captions

6. **Update blueprint schema** to support gallery data structure

## Acceptance Criteria

- [ ] `space-slider` manifest props documented and understood
- [ ] `buildGalleryTree()` creates correct parent-child component tree
- [ ] Portfolio page design rule references `space-slider` for gallery sections
- [ ] AI generates gallery content with image array
- [ ] Component tree builder produces valid Canvas tree for gallery
- [ ] Existing portfolio generation still works (backward compatible)

## Dependencies
- TASK-305 (wires slider into page rules — this task adds the composition logic)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `platform-app/src/lib/ai/page-design-rules.ts`
- `platform-app/src/lib/ai/prompts/page-layout.ts` (or equivalent generation prompt)
