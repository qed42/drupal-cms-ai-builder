# TASK-021: Canvas Editor Configuration for Site Owners

**Story:** US-020
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Site Editing & Refinement

## Description
Configure Canvas editor for the `site_owner` role: set up permissions, component palette, and simplified toolbar. Ensure generated pages are editable via Canvas.

## Technical Approach
- Configure Canvas permissions for `site_owner` role
- Set up Canvas to use Space theme SDC components as the available component palette
- Restrict Canvas toolbar to essential actions (no developer tools, no layout override)
- Ensure all generated pages (from TASK-017) are Canvas-editable
- Create a "Site Editor" dashboard page where site owners land after login (if site is generated)
- Route: `/site/edit` → lists all pages with "Edit in Canvas" links
- Add a preview toggle (draft preview vs. live view)

## Acceptance Criteria
- [ ] Site owner can open any generated page in Canvas editor
- [ ] Canvas shows Space SDC components in the component palette
- [ ] Site owner can drag/drop, reorder sections
- [ ] Site owner CANNOT access Drupal admin routes (/admin/*)
- [ ] "Site Editor" dashboard lists all pages for the user's site
- [ ] Canvas toolbar is simplified (no layout config, no developer options)

## Dependencies
- TASK-017 (Page Builder Agent — creates Canvas-editable pages)
- TASK-004 (User registration — site_owner role)

## Files/Modules Affected
- `ai_site_builder/config/install/user.role.site_owner.yml` (add Canvas permissions)
- `ai_site_builder/src/Controller/SiteEditorController.php`
- `ai_site_builder/ai_site_builder.routing.yml`
