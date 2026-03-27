# TASK-451: Separate Image Resolution from Content Generation Phase

**Story:** US-091
**Effort:** M
**Milestone:** M22 — User-Uploaded Images (bug fix)

## Description
Remove image resolution from Generate phase. Enhance phase becomes sole owner of image injection (user uploads + Pexels fallback). Currently Generate fills all image slots via resolveImagesForSections(), making Enhance a no-op and preventing user image matching.

## Implementation Details

### Part A: Strip image resolution from Generate (`generate.ts`)
- Remove `resolveImagesForSections()` call (~line 340)
- Remove imports: `resolveImagesForSections`, `clearImageCache`, `UserImage`
- Remove `extractUserImagesFromData()` helper function
- Remove image-related console.log
- Keep `buildComponentTree()` — trees still built, image inputs will be empty/undefined

### Part B: Enhance phase takes over
- Add `clearImageCache()` at start of `runEnhancePhase()`
- Import `clearImageCache` from stock-image-service
- Verify `isImagePopulated()` returns false for undefined/missing image props
- Verify component tree builder handles empty image inputs

### Part C: Verify component tree builder resilience
- Test `buildComponentTree()` with sections where image props are undefined
- Existing placeholder logic should handle — verify with test run

## Acceptance Criteria
- [ ] Generate phase makes zero Pexels API calls
- [ ] Enhance phase resolves all images (user-first, Pexels fallback)
- [ ] Component trees correct with images after Enhance
- [ ] User images matched when available (score >= 0.25)
- [ ] `_meta.imageSource` set correctly
- [ ] No TypeScript compilation errors
- [ ] E2E: upload images → generate → user images appear in blueprint

## Architecture
- See `architecture-image-pipeline-refactor.md`

## Files
- `platform-app/src/lib/pipeline/phases/generate.ts` (edit — remove image resolution)
- `platform-app/src/lib/pipeline/phases/enhance.ts` (edit — add clearImageCache)
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (verify — empty image handling)
