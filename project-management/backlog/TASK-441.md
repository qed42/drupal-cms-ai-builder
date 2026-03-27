# TASK-441: Modify Enhance Phase for User Image Priority

**Story:** US-083
**Effort:** M
**Milestone:** M22 — User-Uploaded Images

## Description
Modify `resolveImagesForSections()` in `image-resolver.ts` and the enhance phase in `enhance.ts` to prioritize user-uploaded images over Pexels stock photos when available.

## Implementation Details
- `resolveImagesForSections()` gains optional `userImages?: ImageUpload[]` parameter (backward compatible)
- `enhance.ts` loads `user_images` and `use_stock_only` from `OnboardingSession.data`
- If `use_stock_only` is true or no user images, behavior is identical to current flow
- Per image slot flow:
  1. Extract text context (existing `buildSearchQuery`)
  2. If userImages provided: `rankImages(userImages, context, usedImageIds)`
  3. If best match >= 0.25: inject user image, add to `usedImageIds`, tag `_meta.imageSource = "user"`
  4. Else: Pexels fallback (existing), tag `_meta.imageSource = "stock"`
- New `_meta` fields: `imageSource: "user" | "stock"`, `imageMatchScore?: number`

## Acceptance Criteria
- [ ] User images are tried first before Pexels for each slot
- [ ] Match threshold of 0.25 enforced
- [ ] Used images tracked to prevent cross-section duplicates
- [ ] `_meta.imageSource` set on every section with an image
- [ ] `_meta.imageMatchScore` set for user image matches
- [ ] No behavior change when `userImages` is undefined (backward compatible)
- [ ] Enhance phase loads user images from session data

## Dependencies
- TASK-440 (image matcher)

## Files
- `platform-app/src/lib/images/image-resolver.ts` (edit)
- `platform-app/src/lib/pipeline/phases/enhance.ts` (edit)
