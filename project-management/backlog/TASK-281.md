# TASK-281: Fix brand-tokens.css deleted by cache flush during provisioning

**Type:** Bug
**Priority:** P0 — Critical (brand colors never appear on provisioned sites)
**Estimated Effort:** Small (1-2 hours)
**Dependencies:** None
**Affects:** All provisioned sites

## Problem

Brand token CSS is written in provisioning step 09 (`apply-brand`) but immediately destroyed by step 10 (`configure-site`) which calls `drupal_flush_all_caches()`. This function triggers `\Drupal::service('asset.css.collection_optimizer')->deleteAll()` which **wipes everything in `public://css/`** — including `brand-tokens.css`.

**Evidence from provisioning log:**
```
11:47:22 [success] Brand tokens applied successfully. CSS written to public://css/brand-tokens.css
11:47:22 [10/11] Configure site...
11:47:24 [notice] Clearing caches...
11:47:24 [success] Site configuration complete.
```

After provisioning completes, `brand-tokens.css` does not exist in `sites/{domain}/files/css/`.

## Secondary Bug: Logo URL path resolution

The `logo_url` stored in the blueprint is a relative path from the Next.js platform app (`/uploads/cmmw.../logo.jpeg`). The Drush command runs inside the DDEV web container where this path does not exist.

**Log evidence:**
```
[warning] file_get_contents(/uploads/cmmw9up3500001bob8h02y2oi/1773920159325-qed42_logo.jpeg):
  Failed to open stream: No such file or directory BrandTokenService.php:316
```

## Root Cause

1. **CSS deletion:** `drupal_flush_all_caches()` in `ConfigureSiteCommands.php:55` deletes all files in `public://css/`, not just Drupal's aggregated CSS files.
2. **Logo path:** Blueprint stores a platform-relative path (`/uploads/...`) but the Drush command executes in a different container where that path doesn't resolve.

## Acceptance Criteria

1. After provisioning completes, `public://css/brand-tokens.css` exists and contains correct `:root` CSS variables matching the brand tokens from the blueprint
2. The logo file is successfully copied to `public://logo.png` and theme settings reference it correctly
3. Visiting the provisioned site renders with the user's brand colors (not Space DS defaults)
4. A `drush cr` on the provisioned site does NOT delete brand-tokens.css

## Proposed Fix

### CSS Deletion Fix (choose one):
- **Option A (recommended):** Move `brand-tokens.css` to `public://brand/brand-tokens.css` — a directory not managed by Drupal's CSS aggregation. Update the `hook_page_attachments()` in `ai_site_builder.module` and the `BrandTokenService` constant to use the new path.
- **Option B:** Swap step order — run apply-brand (step 09) AFTER configure-site (step 10). Risk: configure-site might depend on a clean cache state.
- **Option C:** Re-apply brand CSS at the end of configure-site command, after the cache flush.

### Logo Path Fix:
- During blueprint assembly (`platform-app/src/lib/blueprint/generator.ts`), convert the relative `logo_url` to an absolute URL pointing to the platform app (e.g., `http://localhost:3000/uploads/...`) or copy the logo file into the shared blueprint directory alongside `tokens-{siteId}.json`.

## Files to Modify

- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BrandTokenService.php` — Update CSS output URI
- `drupal-site/web/modules/custom/ai_site_builder/ai_site_builder.module` — Update `hook_page_attachments()` CSS path
- `platform-app/src/lib/blueprint/generator.ts` — Fix logo_url to be resolvable from Drupal container
- `provisioning/src/steps/09-apply-brand.ts` — Potentially copy logo file to shared volume
