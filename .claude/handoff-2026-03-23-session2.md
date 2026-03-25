# Session Handoff — 2026-03-23 (Session 2)

## What Was Done

### Sprint 33: TASK-386 — Header/Footer Canvas & Image Pipeline
- **Footer restructured** with `mercury:group` wrappers: brand, nav+social links, 1 primary + 1 secondary CTA, legal+copyright
- **Header nav buttons restored** — Canvas is the single source of truth, not Drupal menus
- **Path aliases removed** from header/footer canvas_page entities — no more `/__header` / `/__footer` public URLs
- **FooterData type** extended with `ctaPrimary` / `ctaSecondary`, wired through `component-tree-builder.ts`, `generator.ts`, `generate.ts`

### Image Pipeline Fixes
- **`createMediaEntityFromImage()`** — Theme placeholder paths (`/themes/...`) now copied to `public://imported/` with proper variable for `prepareDirectory()` by-reference param
- **`copyStockImagesStep`** rewritten to process header/footer component trees, user upload paths (`/uploads/{userId}/...`), and `brand.logo_url`
- **URL prop fallback** — All three adapters (Mercury, Space DS, CivicTheme) now use `"/"` fallback instead of deleting required URL props, preventing Canvas `LogicException`

### Provisioning Fixes
- **Industry mapping** — `food_and_beverage` → `restaurant`, plus full mapping table in `07-import-config.ts`
- **`field.storage.node.body.yml`** removed from `ai_site_builder_content` config/install (conflicts with standard profile)
- **`standard.front_page`** menu link — disabled via `updateDefinition(enabled: FALSE)` instead of `removeDefinition()` which crashes on static plugins

### Other Commits (prior sprint work)
- CivicTheme + Mercury adapter rebuilds (manifests, role maps, image mappings, etc.)
- Docker build context → workspace root for monorepo packages
- CivicTheme provisioning prerequisites (full module dependency list)
- Dashboard component refactor, prompt updates, color-spike removal
- Backlog tasks TASK-328–334, TASK-384, sprint docs, designer command

## Open Issues for Next Session

### 1. Stock Images Not Reaching Drupal (CRITICAL)
**Symptom**: `/uploads/stock/{siteId}/{hash}.jpg` paths appear in Drupal import warnings as "Unrecognized image path format"
**Root cause**: The provisioning `copyStockImagesStep` runs but can't find files at `/app/public/uploads/stock/...` inside Docker. Either:
- Enhance phase didn't download images (check Pexels API key / rate limits)
- Docker volume mapping doesn't expose the platform-app `public/uploads/stock/` directory to the provisioning container
- **Check**: `docker-compose.yml` volume mounts — platform container maps `./platform-app:/workspace/platform-app` but provisioning step reads from `/app/public/...` (old path)

**Key file**: `provisioning/src/steps/08.5-copy-stock-images.ts` line 60 — `const sourcePath = path.join("/app", "public", imgObj.src)`
**Likely fix**: Update source path to match new Docker workspace layout (`/workspace/platform-app/public/...`) or adjust volume mounts

### 2. Images Still Show as Broken on Site
Even when images do get copied, the `createMediaEntityFromImage()` flow needs end-to-end validation:
- Verify file physically exists at `public://stock/{hash}.jpg` after copy
- Verify media entity creation succeeds
- Verify Canvas renders the media entity reference correctly

### 3. Enhance Phase Investigation
Check if the Enhance phase (Pexels image search + download) is actually running and succeeding:
- **File**: `platform-app/src/lib/pipeline/phases/enhance.ts`
- **File**: `platform-app/src/lib/images/stock-image-service.ts`
- Check for `PEXELS_API_KEY` env var in Docker

## Key Files Modified This Session

| File | Changes |
|------|---------|
| `packages/ds-mercury/src/tree-builders.ts` | Footer groups, header nav, URL fallback |
| `packages/ds-space-ds/src/tree-builders.ts` | URL fallback |
| `packages/ds-civictheme/src/tree-builders.ts` | URL fallback |
| `packages/ds-types/src/types.ts` | FooterData CTA fields |
| `platform-app/src/lib/blueprint/component-tree-builder.ts` | CTA passthrough |
| `platform-app/src/lib/blueprint/generator.ts` | Footer CTAs |
| `platform-app/src/lib/pipeline/phases/generate.ts` | Footer CTAs |
| `provisioning/src/steps/07-import-config.ts` | Industry mapping |
| `provisioning/src/steps/08.5-copy-stock-images.ts` | Header/footer/upload processing |
| `drupal-site/.../BlueprintImportService.php` | Path aliases, image resolution, menu link |
| `drupal-site/.../ai_site_builder_content/config/install/field.storage.node.body.yml` | DELETED |

## Branch State
- **Branch**: `feature/m19-design-system-abstraction`
- **Working tree**: Clean
- **All tests pass**: 139/139
- **Latest commit**: `3f576cb` — fix: disable standard.front_page menu link
