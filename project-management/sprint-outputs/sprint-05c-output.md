# Sprint 05c Output: Provisioning Pipeline Stabilization

**Date:** 2026-03-19
**Status:** Complete
**Commit:** `11501a8`

## Summary

Fixed all 4 broken provisioning steps (8–11). The full 11-step pipeline now runs end-to-end, taking ~165 seconds to create a fully provisioned Drupal CMS site with Space DS theme, Canvas component pages, content, webforms, and brand styling.

## Task Deliverables

### TASK-128: Cross-Container File Path Fix

**Problem:** Brand tokens written to `/tmp/` in the platform container are invisible to the DDEV web container where drush runs.

**Fix:** Write tokens to `dirname(config.blueprintPath)` — the shared `drupal-site/blueprints/bp-XXX/` volume.

**File:** `provisioning/src/steps/09-apply-brand.ts` — 1 line changed

### TASK-129: Canvas Required Prop Defaults

**Problem:** Space DS components like `space-cta-banner-type-1` require `width` and `alignment` props, but the AI generator only produces content props. Canvas validation rejects the save.

**Fix:** Added `REQUIRED_PROP_DEFAULTS` map in `component-tree-builder.ts`:
```typescript
const REQUIRED_PROP_DEFAULTS: Record<string, Record<string, string>> = {
  "space_ds:space-cta-banner-type-1": { width: "boxed-width", alignment: "left-align" },
  "space_ds:space-cta-banner-type-2": { width: "boxed-width", image_type: "large-image" },
  "space_ds:space-cta-banner-type-3": { width: "boxed-width" },
  "space_ds:space-container": { width: "boxed-width" },
};
```

Defaults are merged under AI props (AI props take precedence).

**File:** `platform-app/src/lib/blueprint/component-tree-builder.ts`

### TASK-130: Pathauto Crash Fix

**Problem:** `ConfigureSiteCommands::runPathautoUpdate()` crashes on a pathauto alias type with an empty entity type ID (`The "" entity type does not exist`).

**Fix:** Wrapped per-alias-type loop body in try-catch. Broken types are logged as warnings and skipped.

**File:** `drupal-site/.../Drush/Commands/ConfigureSiteCommands.php`

### TASK-131: Callback Auth & Failure Handling

Three sub-fixes:

| Sub-fix | Before | After |
|---------|--------|-------|
| Auth header | Callback sent without `x-api-key` → 401 | Reads `PROVISION_CALLBACK_KEY` from env, sends as header |
| Failure notification | No failure callback → site stuck in "provisioning" | `sendFailureCallback()` called before rollback → status becomes `provisioning_failed` → UI shows retry |
| Smart rollback | Callback failure rolled back entire Drupal site | Callback-only failure skips rollback — site is preserved |
| Subdomain extraction | Hardcoded `.drupalcms.app` | Uses `SITE_DOMAIN_SUFFIX` env var |

**Files:**
- `provisioning/src/steps/11-callback.ts` — auth header + `sendFailureCallback()` export
- `provisioning/src/provision.ts` — failure callback before rollback, skip rollback for step 11
- `platform-app/src/app/api/provision/callback/route.ts` — configurable domain suffix

### TASK-132: Getting Started Guide Rewrite

Complete rewrite of `getting-started.md` covering:
- Architecture diagrams (component relationships, container networking)
- Prerequisites and first-time setup
- End-to-end user journey walkthrough
- File structure with descriptions
- Environment variables reference
- Troubleshooting for common failures

## Test Results

Full provisioning pipeline run (manual):

```
[1/11]  Create database .............. ✅ 0.1s
[2/11]  Generate settings.php ........ ✅ 0.0s
[3/11]  Update sites.php ............. ✅ 0.0s
[4/11]  Install Drupal CMS ........... ✅ 62.8s
[5/11]  Install Space DS theme ....... ✅ 6.5s
[6/11]  Enable modules ............... ✅ 22.6s
[7/11]  Import industry config ....... ✅ 17.6s
[8/11]  Import blueprint ............. ✅ 1.4s  ← NEW
[9/11]  Apply brand tokens ........... ✅ 0.6s  ← NEW
[10/11] Configure site ............... ✅ 3.8s  ← NEW
[11/11] Platform callback ............ ✅ 0.1s  ← FIXED
                                    Total: 164.9s
```

Database verification:
```sql
SELECT status, "drupalUrl" FROM sites WHERE id = 'cmmwrezx8000s0tpjhzbqfbof';
-- status: live
-- drupalUrl: https://basic-setup-mlko.ai-site-builder.ddev.site
```

## Known Issues (Not in Scope)

- ComponentValidator warnings (`Undefined array key "properties"`) from Space DS — cosmetic, doesn't affect functionality
- `site_owner` role permissions stripped during module install due to missing content types at install time — re-applied during config import step
- Industry "other" falls back to universal content types — works but shows warning
