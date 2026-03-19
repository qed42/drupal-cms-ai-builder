# TASK-130: Fix Pathauto Crash in Configure Site Command

**Story:** US-019 (Provisioning Pipeline)
**Priority:** P1
**Estimated Effort:** XS
**Milestone:** M4 — Site Editing

## Description
Step 10 (Configure Site) crashes during pathauto bulk alias generation because one alias type plugin has an empty entity type ID, triggering `The "" entity type does not exist.` exception.

## Root Cause
A contributed or recipe-installed pathauto alias type plugin is registered but references a non-existent entity type. The `runPathautoUpdate()` method iterated all alias types without error handling.

## Fix
Wrapped the per-alias-type batch update loop in a try-catch. Broken alias types are logged as warnings and skipped instead of crashing the entire command.

## Files Changed
- `drupal-site/web/modules/custom/ai_site_builder/src/Drush/Commands/ConfigureSiteCommands.php` — try-catch in `runPathautoUpdate()`
