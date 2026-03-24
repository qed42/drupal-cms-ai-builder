# TASK-389: Integrate image resolver into generate phase pipeline

**Story:** Infrastructure — Image Pipeline Refactoring
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction

## Description

Wire the new `resolveImagesForSections()` function into the generate phase so that Pexels images are fetched and injected into section props **before** `buildComponentTree()` runs. This eliminates the double-build pattern where trees are first built with placeholders then rebuilt in the enhance phase.

The enhance phase remains as a no-op safety net — `extractImageIntents()` skips already-populated props, so it finds 0 intents and returns instantly.

## Technical Approach

1. **In `platform-app/src/lib/pipeline/phases/generate.ts`:**
   - Import `resolveImagesForSections` from `@/lib/images/image-resolver`
   - Import `clearImageCache` from `@/lib/images/stock-image-service`
   - Call `clearImageCache()` at the top of `runGeneratePhase()` (before page loop)
   - After line 277 (`const finalPage = ...`) and before line 278 (`const componentTree = buildComponentTree(...)`), insert:
     ```typescript
     const imageResult = await resolveImagesForSections(
       siteId,
       finalPage.sections,
       finalPage.title,
       research.industry,
       research.targetAudience.primary
     );
     console.log(`[generate] Images for "${finalPage.title}": ${imageResult.imagesAdded} added, ${imageResult.imagesFailed} failed`);
     ```

2. **No changes to `enhance.ts`** — it naturally becomes a no-op:
   - `extractImageIntents()` line 50: `if (section.props[propName]) continue` skips populated props
   - With 0 intents, enhance returns `{ imagesAdded: 0, imagesFailed: 0 }` immediately

3. **Why tree-builders need no changes:**
   - `createItem()` in tree-builders.ts has a `needsFill` check for image props
   - When `section.props.media` already contains `{ src, alt, width, height }`, `needsFill` evaluates to `false` and the placeholder is skipped

## Acceptance Criteria

- [ ] Generate phase fetches real Pexels images per page before tree building
- [ ] Console logs show `[generate] Images for "Page Name": X added, Y failed` per page
- [ ] Component trees contain real `/uploads/stock/` image paths (not placeholder)
- [ ] Enhance phase logs `Found 0 image slots` (confirms all slots filled during generate)
- [ ] Fallback works: with `PEXELS_API_KEY` unset, placeholder images are used (no errors)
- [ ] TypeScript compiles cleanly
- [ ] All existing tests pass
- [ ] End-to-end: provisioned Drupal site renders real Pexels images

## Dependencies

- TASK-388 (creates `resolveImagesForSections()`)

## Files/Modules Affected

- `platform-app/src/lib/pipeline/phases/generate.ts`
