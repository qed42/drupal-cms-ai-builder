# TASK-304: Duplicate Home menu item in generated Drupal site navigation

**Type:** Bug
**Priority:** P1 — High
**Severity:** High
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Generated Drupal sites display two "Home" menu items in the top navigation. This is a visible, embarrassing defect on every generated site that immediately makes the output look unpolished.

## Steps to Reproduce

1. Complete the full onboarding flow and generate a site
2. View the generated Drupal site
3. Top navigation shows "Home" twice

## Expected Behavior

A single "Home" menu item in the navigation.

## Likely Root Cause

Two possible sources:
1. **Blueprint import creates a duplicate** — The import service may be creating a Home menu link AND the site already has a default Home link from Drupal CMS installation
2. **Canvas page creation triggers auto-menu** — When importing the Home page as a Canvas page, Drupal may auto-create a menu link, while the blueprint import also explicitly creates one

## Acceptance Criteria

- [ ] Generated sites have exactly one "Home" menu item in the main navigation
- [ ] Fix handles both fresh installs and re-imports without duplication
- [ ] Menu order is correct: Home is first item

## Files to Investigate

1. `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php` — Menu link creation during import
2. `provisioning/src/steps/08-import-blueprint.ts` — Blueprint import orchestration
3. Drupal CMS default configuration — Check if `system.menu.main` ships with a default Home link

## Technical Notes

- Check if `BlueprintImportService` creates menu links for all pages including Home
- Drupal CMS 2.0 may include a default "<front>" menu link in the main menu
- Fix could be: skip creating Home menu link if one already exists, OR delete existing before import, OR check for duplicates post-import
