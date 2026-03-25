# TASK-411: Store image search queries in section metadata

**Story:** US-070
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
During image resolution in the Generate phase, store the Pexels search query used for each section in the section's `_meta.imageQuery` field.

## Technical Approach
1. Read `platform-app/src/lib/images/image-intent.ts` and `platform-app/src/lib/images/image-resolver.ts`
2. When `buildImageQuery()` constructs a search query, return it alongside the result
3. When the image resolver injects an image into a section's props, also set `section._meta.imageQuery = query`
4. Ensure `_meta` object is created if it doesn't exist on the section

## Acceptance Criteria
- [ ] Sections with images have `_meta.imageQuery` set (e.g., "family dental office modern")
- [ ] Sections without images have no `_meta.imageQuery` (not set to null/empty)
- [ ] Query is the actual string sent to Pexels API
- [ ] Blueprint payload size increase is negligible (~20 bytes per image section)

## Dependencies
- None

## Files Affected
- `platform-app/src/lib/images/image-intent.ts`
- `platform-app/src/lib/images/image-resolver.ts`
- `platform-app/src/lib/pipeline/phases/generate.ts` (wire _meta through)
