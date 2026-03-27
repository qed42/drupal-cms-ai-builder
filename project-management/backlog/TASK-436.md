# TASK-436: Extend Upload API Route for Image Type

**Story:** US-081
**Effort:** S
**Milestone:** M22 — User-Uploaded Images

## Description
Extend the existing `POST /api/upload` route to support `uploadType: "image"` alongside existing `logo`, `palette`, `font` types. Images are stored with UUID-based naming, EXIF stripped, and MIME validated via magic bytes.

## Implementation Details
- New upload type: `image` — max 10MB, accepts PNG/JPG/JPEG/WEBP
- Storage path: `/public/uploads/{siteId}/images/{uuid}.{ext}`
- UUID generated server-side (not timestamp-based)
- MIME type validated via `file-type` npm package (magic bytes, not just extension)
- EXIF metadata stripped via `sharp` before storage
- Returns: `{ url, filename, path, id }` where `id` is the UUID
- Max 20 files per site (enforce cumulative limit)

## Acceptance Criteria
- [ ] Upload route accepts `uploadType: "image"` with correct validation
- [ ] MIME type validated server-side via magic bytes check
- [ ] EXIF metadata stripped before storage
- [ ] UUID-based filenames used (no user-controlled path segments)
- [ ] Files exceeding 10MB are rejected with clear error
- [ ] Non-image MIME types are rejected

## Dependencies
- None

## Files
- `platform-app/src/app/api/upload/route.ts` (edit)
