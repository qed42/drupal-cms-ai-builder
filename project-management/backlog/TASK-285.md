# TASK-285: Fix stock images not rendering on provisioned Drupal sites

**Type:** Bug
**Priority:** P0 — Critical (images are fetched and injected but never display on the live site)
**Estimated Effort:** Medium-Large (4-8 hours)
**Dependencies:** TASK-280 (Stock Image Pipeline — Done in Sprint 14.1)
**Sprint:** 16
**Affects:** All provisioned sites with stock images

## Problem

Stock images are successfully fetched from Pexels, downloaded locally, injected into the blueprint component tree, and copied to Drupal's `sites/{domain}/files/stock/` during provisioning — but they do not render on the provisioned site. The images are invisible or broken.

## Likely Root Causes (Require Investigation)

### 1. Canvas media handling mismatch
Canvas components may not consume raw `{ src, alt, width, height }` image objects directly. Drupal Canvas likely expects media items to be:
- **Managed file entities** (`file_managed` / `media` entities) referenced by ID, not raw file paths
- Or referenced via a **stream wrapper URI** (`public://stock/filename.jpg`) rather than a relative path (`/sites/{domain}/files/stock/filename.jpg`)
- Or stored in a specific **JSON structure** that Canvas's `BlueprintImportService` transforms into Drupal media references

### 2. Component tree `inputs` vs Canvas expected format
The current image injection puts the image object directly into `inputs`:
```json
{
  "component_id": "sdc.space_ds.space-hero-banner-style-01",
  "inputs": {
    "title": "Welcome",
    "background_image": {
      "src": "/sites/example.com/files/stock/abc123.jpg",
      "alt": "Professional office",
      "width": 1920,
      "height": 1080
    }
  }
}
```

Canvas may expect the image reference in a different format, such as:
- A Drupal file URI: `public://stock/abc123.jpg`
- A media entity ID: `{ "target_id": 123 }`
- A render array reference
- A different property structure per the Canvas image schema

### 3. File permissions or path resolution
The copied files may exist on disk but:
- Drupal's public file serving may not be configured for the `/stock/` subdirectory
- The `.htaccess` or Nginx rewrite rules may not serve files from per-site directories
- The `src` path in the component tree may not resolve correctly relative to the Drupal webroot

## Investigation Steps

1. **Inspect the Canvas image component schema** — Check `canvas/components/image/image.component.yml` and how `BlueprintImportService::prepareComponentTree()` processes image inputs
2. **Check how Canvas renders image props** — Look at the Twig templates for hero banner and other image-bearing components to see what variable format they expect
3. **Verify file existence post-provisioning** — Confirm files are at the expected path in the DDEV container
4. **Compare with a manually-created Canvas page** — Create a page in Canvas editor with an image, export the component tree, and compare the image reference format with what the pipeline generates
5. **Check Drupal file entity creation** — If Canvas expects managed files, the provisioning step needs to create `file` entities and reference them by ID

## Acceptance Criteria

1. Stock images render visibly on provisioned Drupal sites (hero banners, cards, text-media sections)
2. Image `src` paths resolve correctly to accessible files via the browser
3. Canvas component tree image format matches what Canvas actually renders
4. If managed file entities are required, the provisioning pipeline creates them during the image copy step
5. Fallback: components without images still render correctly (no broken image icons)
6. All existing tests continue to pass

## Files to Investigate

- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php` — How component tree inputs are processed
- `drupal-site/web/themes/contrib/space_ds/components/` — Twig templates for image-bearing components
- `provisioning/src/steps/08.5-copy-stock-images.ts` — Current file copy and path rewriting logic
- `platform-app/src/lib/images/image-intent.ts` — Image object structure being injected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` — How image props flow into the tree

## Notes

- This is a **cross-boundary bug** spanning Next.js (image injection), provisioning (file copy + path rewrite), and Drupal (Canvas rendering)
- The fix may require changes in all three layers depending on the root cause
- A fresh session with deep investigation of Canvas internals is recommended
