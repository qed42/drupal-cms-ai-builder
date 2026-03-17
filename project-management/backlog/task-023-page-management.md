# TASK-023: Page Add & Remove

**Story:** US-023
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Site Editing & Refinement

## Description
Allow site owners to add new pages and delete generated pages, with automatic menu management.

## Technical Approach
- "Add Page" action on the site editor dashboard
- Form: page title, optional template/layout selection (blank, or AI-suggested based on type)
- On create: create a new `page` node with Canvas layout, link to SiteProfile, add to main menu
- "Delete Page" action on each page (except Home)
- Confirmation dialog before deletion
- On delete: remove node, remove menu link
- Home page protected from deletion
- Menu system: use Drupal's menu link content entities, auto-manage the main menu

## Acceptance Criteria
- [ ] Site owner can add a new page with title
- [ ] New page appears in site navigation automatically
- [ ] Site owner can delete pages (except Home)
- [ ] Deletion removes the page and its menu link
- [ ] Home page shows "cannot delete" message

## Dependencies
- TASK-021 (Canvas editor config)

## Files/Modules Affected
- `ai_site_builder/src/Form/AddPageForm.php`
- `ai_site_builder/src/Form/DeletePageConfirmForm.php`
- `ai_site_builder/src/Controller/SiteEditorController.php` (add actions)
