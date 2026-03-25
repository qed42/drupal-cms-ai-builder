# TASK-395: Add all Drupal CMS recipes and installer to composer.json

**Story:** Hardening Sprint — Mercury DS Grounding
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction
**Status:** COMPLETE

## Description
Added 21 recipe packages (drupal_cms_*, easy_email_*, byte) and drupal/drupal_cms_installer. All packages resolve from packagist (no local path repo). drupal_cms_site_template_base uses @dev (no stable release). Lock file updated.

## Commits
- c2ab471 — feat: add Drupal CMS recipes to composer.json
- e6b76df — fix: recipe package resolution
- cee4d54 — chore: update composer.lock

## Files Modified
- drupal-site/composer.json
- drupal-site/composer.lock
