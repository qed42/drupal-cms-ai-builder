# TASK-023: Page Add & Remove

**Story:** US-020 — Site owner manages pages
**Priority:** P1
**Sprint:** 06
**Workstream:** Drupal

## Description

Enable site owners to add new pages and remove existing pages from their Drupal site via the Canvas editor interface. New pages should be automatically added to the site navigation menu, and removed pages should be cleaned up from menus.

## Technical Approach

### 1. Page Creation
- Expose a "Add Page" action in the Canvas editor toolbar or dashboard
- Create new `page` nodes with a default Canvas component tree (e.g., hero banner + text section)
- Auto-generate URL alias via pathauto
- Auto-create menu link in the main navigation menu

### 2. Page Deletion
- "Delete Page" action with confirmation dialog
- Remove associated menu links
- Handle front page deletion gracefully (prevent deleting the home page, or reassign)

### 3. Menu Link Management
- When a page is added: create `menu_link_content` entity in the `main` menu
- When a page is removed: delete associated `menu_link_content`
- Respect menu weight/ordering

### 4. Permissions
- Site owner role (`site_owner`) must have: `create page content`, `delete own page content`
- Already configured in Sprint 05 (TASK-118) — verify and extend if needed

## Acceptance Criteria

- [ ] Site owner can add a new page from the Canvas editor
- [ ] New pages have a default component tree layout
- [ ] New pages get URL aliases and menu links automatically
- [ ] Site owner can delete a page (with confirmation)
- [ ] Deleting a page removes its menu link
- [ ] Cannot delete the front page (home)
- [ ] Page list in Canvas editor reflects additions/removals

## Dependencies

- TASK-118 (Sprint 05, Done): Canvas editor configured with site_owner permissions
- TASK-034 (Sprint 06): Data isolation — new pages must be scoped to current site

## Effort

Medium (M) — ~3 dev days
