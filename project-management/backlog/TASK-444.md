# TASK-444: Provisioning — Copy User Images & Create Media for Unplaced Uploads

**Story:** US-084
**Effort:** M
**Milestone:** M22 — User-Uploaded Images

## Description
Extend provisioning step 08.5 to copy user-uploaded images alongside stock images, and add a post-import step that creates Media entities for images the matcher didn't place in the blueprint.

## Context — Architectural clarification (risk resolved)

**Blueprint-placed user images need NO special handling:**
- Step 08.5 already copies files matching `/uploads/` prefixes and rewrites to `/sites/{domain}/files/`
- `BlueprintImportService::resolveImageInputs()` already converts `{ src, alt }` → media entity ID
- User images placed by the matcher follow this exact path — they appear as `{ src, alt }` objects in component tree inputs, identical to stock photos

**What's new:**
1. Step 08.5 must also copy user images from `/uploads/{siteId}/images/` (currently only handles `/uploads/stock/` and `/uploads/{userId}/`)
2. A new post-import step must invoke `drush import-media` for unplaced uploads

## Implementation Details

### Part A: Extend step 08.5 (image copy + path rewrite)
- User images stored at `/uploads/{siteId}/images/{uuid}.ext`
- This already matches the `UPLOAD_PREFIXES` check (`/uploads/` prefix) — **verify this works**
- Destination: `sites/{domain}/files/user-images/{filename}` (not `stock/` — separate directory for clarity)
- Need to detect `user-images` vs `stock` based on source path:
  - `/uploads/stock/` → `files/stock/`
  - `/uploads/{siteId}/images/` → `files/user-images/`

### Part B: New step — create Media entities for unplaced uploads
- Runs AFTER step 08 (blueprint import), so placed images already have media entities
- Read `user_images` manifest from blueprint payload
- Filter to images NOT used in any blueprint section (check `_meta.imageSource !== "user"` across all sections, or track placed image IDs from enhance phase)
- Copy unplaced files to `sites/{domain}/files/user-images/` (if not already copied)
- Write manifest JSON for unplaced images only
- Invoke `drush ai-site-builder:import-media --manifest={path}` on the correct site
- If no unplaced images, step is a no-op

### Key path format contract
- Drupal's regex: `#/sites/[^/]+/files/(.+)$#` → `public://{rest}`
- User images: `/sites/{domain}/files/user-images/{uuid}.ext` → `public://user-images/{uuid}.ext`
- This matches the regex — **confirmed safe**

## Acceptance Criteria
- [ ] Blueprint-placed user images flow through existing 08.5 → 08 pipeline with no changes
- [ ] User image files copied to `sites/{domain}/files/user-images/` directory
- [ ] Path rewrite produces `/sites/{domain}/files/user-images/{filename}` format
- [ ] Unplaced uploads get Media entities via Drush command after blueprint import
- [ ] ALL user-uploaded images exist as Media entities in Drupal after provisioning
- [ ] No behavior change for sites without user images (backward compatible)
- [ ] Step skipped gracefully when `user_images` manifest is empty/undefined

## Dependencies
- TASK-442 (blueprint manifest — provides user_images list and placed image tracking)
- TASK-443 (Drush import-media command — for unplaced uploads)

## Files
- `provisioning/src/steps/08.5-copy-stock-images.ts` (edit — extend for user-images directory)
- `provisioning/src/steps/08.7-create-unplaced-media.ts` (new — post-import step for unplaced uploads)
- `provisioning/src/runner.ts` (edit — register new step)
