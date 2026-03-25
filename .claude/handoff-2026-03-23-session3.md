# Session Handoff — 2026-03-23 (Session 3)

## What Was Done

### 1. Stock Image Docker Path Fix (`82a4d7c`)
- **Root cause**: `copyStockImagesStep` and `applyBrandStep` used `/app/public/...` as source path, but Docker mounts platform-app at `/workspace/platform-app`
- **Fix**: Updated both to `/workspace/platform-app/public/...`
- Image downloader writes correctly (uses `process.cwd()`), copy step was the broken link

### 2. Drupal CMS Installer Restored (`6e9c2b1`)
- Reverted prior session's switch from `drupal_cms_installer` to `standard` profile
- Restored full `drupal_cms_installer` profile directory from git
- Re-added `field.storage.node.body.yml` config (needed since this profile doesn't provide it)

### 3. Canvas Slot Validation (`f89f187`)
- **Root cause**: AI passes composition role names ("heading", "testimonial-card") as slot values. Canvas crashes in `ComponentTreeItemList::getHydratedValue()` at line 498 when a child references a nonexistent parent slot
- **Fix**: Added `COMPONENT_SLOTS` registry (all Space DS slots from `.component.yml`) and `resolveSlot()` function
- Applied to all 3 code paths: `buildContentSection` (flexi), `buildOrganismSection` full-width, `buildOrganismSection` container-wrapped
- Mercury unaffected — always hardcodes `"main_slot"`

### 4. Header/Footer → Canvas Global Regions (`42e2b38`)
- **Before**: Header/footer stored as `canvas_page` entities, required `preprocess_page` glue in module file, stored IDs in `ai_site_builder.layout` config
- **After**: Uses Canvas's native `page_region` config entities placed into theme's global regions
- `DesignSystemAdapter` type extended with `headerRegion`/`footerRegion`
- Blueprint JSON now includes `region` field in header/footer configs
- `importHeaderFooter()` creates `page_region` entities for ALL theme regions (empty for non-header/footer), required by `CanvasPageVariant::build()`
- Removed dead `preprocess_page` hook from module file

## Key Files Modified

| File | Changes |
|------|---------|
| `provisioning/src/steps/08.5-copy-stock-images.ts` | `/app` → `/workspace/platform-app` |
| `provisioning/src/steps/09-apply-brand.ts` | Same path fix |
| `provisioning/src/steps/04-install-drupal.ts` | Reverted to `drupal_cms_installer` |
| `packages/ds-space-ds/src/tree-builders.ts` | COMPONENT_SLOTS registry + resolveSlot() |
| `packages/ds-types/src/types.ts` | headerRegion/footerRegion on adapter |
| `packages/ds-{space-ds,mercury,civictheme}/src/index.ts` | Region values |
| `platform-app/src/lib/blueprint/types.ts` | `region` field on HeaderConfig/FooterConfig |
| `platform-app/src/lib/blueprint/generator.ts` | Populates region from adapter |
| `platform-app/src/lib/pipeline/phases/generate.ts` | Same |
| `drupal-site/.../BlueprintImportService.php` | page_region instead of canvas_page |
| `drupal-site/.../ai_site_builder.module` | Removed preprocess_page hook |

## Open Items for Next Session

### 1. End-to-End Provisioning Test
All fixes are code-level. A full provisioning run is needed to verify:
- Stock images actually copy and render
- Header/footer appear in Canvas global regions
- Page rendering works without slot errors

### 2. Mercury Slot Registry
The `COMPONENT_SLOTS` registry was only added to Space DS. Mercury hardcodes slots so isn't affected today, but if Mercury ever passes through AI-provided slots, it would need the same treatment. Low priority.

### 3. CivicTheme Region Names
CivicTheme's header/footer region names may differ from "header"/"footer". Verify when CivicTheme support is tested.

## Branch State
- **Branch**: `feature/m19-design-system-abstraction`
- **Tests**: 139/139 passing
- **Latest commit**: `42e2b38`
