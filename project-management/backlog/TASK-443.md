# TASK-443: Drush import-media Command for Unused Uploads

**Story:** US-084
**Effort:** S (reduced from M — simpler scope)
**Milestone:** M22 — User-Uploaded Images

## Description
Create a Drush command `ai-site-builder:import-media` that batch-creates Media entities for user-uploaded images that were **not** placed in the blueprint by the matcher. Blueprint-placed images are already handled by `BlueprintImportService::resolveImageInputs()` during step 08.

## Context — Why scope is narrower than originally planned

The existing `BlueprintImportService::resolveImageInputs()` (line 612–663) already:
1. Detects image props via `prop_field_definitions` (entity_reference targeting media)
2. Creates file entity + media entity from web path matching `/sites/{domain}/files/{path}`
3. Replaces `{ src, alt }` objects with scalar media entity IDs

**Images placed by the matcher flow through the existing pipeline unchanged:**
```
Enhance → { src: "/uploads/{siteId}/images/{uuid}.jpg" }
Step 08.5 → copies file, rewrites to /sites/{domain}/files/user-images/{uuid}.jpg
Step 08 (import) → resolveImageInputs() creates media entity automatically
```

**Only unplaced images need this Drush command** — they don't appear in any component tree prop, so the import service never sees them.

## Implementation Details
- Command: `drush ai-site-builder:import-media --manifest=/tmp/media-manifest.json`
- Manifest format: `[{ file: "public://user-images/{uuid}.jpg", alt: "...", name: "...", bundle: "image" }]`
- For each entry:
  1. Verify file exists at the URI
  2. Create `file_managed` entity
  3. Create `media` entity (type: `image`) with `field_media_image → file`
  4. Set alt text and name from manifest
- Returns JSON to stdout: `[{ image_id: "{uuid}", media_id: 42, fid: 101 }]`
- Error handling: log + skip failures, don't abort batch
- Reuses the same entity creation pattern as `BlueprintImportService::createMediaEntityFromImage()` but via Drush for images outside the component tree

## Acceptance Criteria
- [ ] Drush command accepts `--manifest` path to JSON file
- [ ] Creates file entity + media entity for each manifest entry
- [ ] Alt text and name set correctly
- [ ] Returns JSON with media IDs mapped to image IDs
- [ ] Handles individual failures without aborting
- [ ] Works in multisite context (respects active site)

## Dependencies
- None (standalone Drupal command)

## Files
- `drupal-site/web/modules/custom/ai_site_builder/src/Commands/ImportMediaCommand.php` (new)
