# TASK-128: Fix Cross-Container File Path in Provisioning

**Story:** US-019 (Provisioning Pipeline)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M4 — Site Editing

## Description
The provisioning engine's "Apply Brand Tokens" step (step 9) writes a tokens JSON file to `/tmp/` inside the platform container, then passes that path to a drush command executed via `docker exec` in the DDEV web container. Since `/tmp/` is container-local, the file doesn't exist in the DDEV container, causing the step to fail.

## Root Cause
`provisioning/src/steps/09-apply-brand.ts` used `join("/tmp", ...)` for the tokens file. The `drush.ts` path translation only handles `/drupal-site/` → `/var/www/html/`, not `/tmp/` paths.

## Fix
Write the tokens file to `dirname(config.blueprintPath)` — alongside the blueprint in the shared `/drupal-site/blueprints/` volume that both containers can access. The existing path translation handles the rest.

## Files Changed
- `provisioning/src/steps/09-apply-brand.ts` — tokens path from `/tmp/` to shared blueprint directory
