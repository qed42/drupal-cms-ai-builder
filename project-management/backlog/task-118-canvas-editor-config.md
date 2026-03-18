# TASK-118: Canvas Editor Configuration for Site Owners

**Story:** US-020 (Canvas Page Editor Integration)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M4 — Site Editing

## Description
Configure Canvas editor on each provisioned Drupal site so the site owner can visually edit pages. Includes role/permission setup, editor toolbar configuration, and Space component palette.

## Technical Approach
- Create `site_owner` role with permissions:
  - `edit site content` (custom)
  - `regenerate section` (custom)
  - Canvas editing permissions (per Canvas module)
  - `access content`
  - `edit any page content`, `edit any service content`, etc. (per content type)
  - `access toolbar`
  - `view own webform submission`
- Configure Canvas editor to show Space SDC components in the component palette
- Ensure Canvas "Add Section" shows available Space components organized by category
- Configure page editing to default to Canvas editor (not standard Drupal form)
- Hide Drupal admin toolbar items not relevant to site owners (Content, Structure, etc.)
- Only show: Canvas editor access, basic content listing

## Acceptance Criteria
- [ ] `site_owner` role created with correct permissions
- [ ] Site owner can access Canvas editor on pages
- [ ] Space SDC components visible in Canvas component palette
- [ ] Site owner cannot access Drupal admin pages (except content listing)
- [ ] Canvas "Add Section" shows categorized Space components
- [ ] Save in Canvas persists layout changes

## Dependencies
- TASK-111 (Provisioning — site must exist)
- Canvas module installed

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/config/install/user.role.site_owner.yml`
- `web/modules/custom/ai_site_builder/ai_site_builder.permissions.yml`
- `web/modules/custom/ai_site_builder/ai_site_builder.module` (toolbar alter)
