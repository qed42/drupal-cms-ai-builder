# TASK-286: Fix stock images rendering as empty src in Canvas Twig templates

**Type:** Bug
**Priority:** P0 — Critical (images are in DB but render as `src=""`)
**Estimated Effort:** Medium (4-6 hours investigation + fix)
**Dependencies:** TASK-285 (path rewriting — Done)
**Sprint:** 16 (carry-over)
**Affects:** All provisioned sites with stock images

## Problem

Stock images are correctly stored in the Drupal database with proper paths, but render as `src=""` in the browser HTML. The Twig templates output empty image sources.

## Investigation Findings

### What works:
- Images are copied to `sites/{domain}/files/stock/` (confirmed: 16 files on disk)
- Paths are correctly rewritten in blueprint JSON before import
- Nginx serves the files correctly (200 OK, `image/jpeg`)
- Component `inputs` JSON in `canvas_page__components` table contains correct image data:
  ```json
  {"background_image": {"src": "/sites/{domain}/files/stock/fe3dd9386a20.jpg", "alt": "...", "width": 1920, "height": 1080}}
  ```

### What fails:
- Twig templates render `<img src="" alt="">` — empty src attribute
- 5 `<img>` tags on homepage, all with `src=""` for stock images
- Logo renders correctly (different code path via BrandTokenService)

## Root Cause (Confirmed)

Canvas uses a "collapsed StaticPropSource" storage optimization. For image props (defined with `$ref: json-schema-definitions://canvas.module/image`), Canvas maps them to Drupal's `image` field type, which requires file entity references (`{ target_id: <fid>, alt: "..." }`).

**Data flow that causes the bug:**
1. Blueprint stores `{ "src": "/sites/.../image.jpg", "alt": "...", "width": 1920, "height": 1080 }`
2. At render time, Canvas enters the "uncollapse" path (`ComponentInputs::getPropSources()` line 191)
3. `StaticPropSource::withValue()` is called with the raw object on an image field item list
4. Drupal's image field type ignores `src` (not a valid property) — it needs `target_id`
5. The field evaluates as empty → `src=""` in HTML

**Key code path:** `GeneratedFieldExplicitInputUxComponentSourceBase::uncollapse()` → `getDefaultStaticPropSource()->withValue()` → image FieldItemList can't resolve `src` key.

## Fix Applied

Modified `BlueprintImportService::prepareComponentTree()` to detect image-type props via the component's `prop_field_definitions` config and convert raw `{ src, alt }` objects to proper Drupal file entity references `{ target_id, alt }` before saving.

**Changes:**
1. `BlueprintImportService.php` — Added `resolveImageInputs()` to detect image props and create file entities
2. `BlueprintImportService.php` — Added `createFileEntityFromPath()` to convert web paths to `public://` URIs and create managed file entities
3. `ai_site_builder.services.yml` — Injected `file_system` service

## Acceptance Criteria

1. Stock images render visibly with correct `src` attributes in browser HTML
2. Image `src` values resolve to accessible files
3. All image-bearing components (hero banners, text-media, cards) render images
4. Fix doesn't break non-image component rendering
