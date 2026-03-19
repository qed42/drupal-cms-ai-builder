# TASK-123: Drupal CMS Foundation Spike

**Story:** Foundation (infrastructure prerequisite)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Blueprint & Provisioning

## Description
Set up Drupal CMS 2.0 locally via DDEV with Space DS theme, validate multisite provisioning assumptions, document the Canvas component tree format (for Next.js blueprint generation), and resolve open questions before Sprint 04 implementation begins. Time-boxed spike (2 days max).

## Technical Approach

### 1. Drupal CMS Local Setup
- `composer create-project drupal/cms drupal-site`
- Configure DDEV for local development
- Complete web installer with "Starter" template
- Install Space DS theme: `composer require drupal/space_ds` and set as default
- Verify Canvas is active and Space DS components appear in the Canvas sidebar

### 2. Validate CLI Installation
- Test: `drush site:install drupal_cms_installer` — does it work or fail?
- If it fails, document the error and test alternatives:
  - `drush site:install --existing-config` after copying config
  - Custom minimal install profile that applies recipes via `drush recipe:apply`
  - Automating the web installer via HTTP
- **Deliverable:** Document the working CLI install command for provisioning

### 3. Space DS + Canvas Compatibility Validation
- Verify Space DS SDC components render correctly in Canvas
- Test drag-and-drop placement of Space DS organism components (hero banners, CTAs, cards, etc.)
- Confirm component props from the YAML schemas are editable in Canvas sidebar
- Document any Space DS components that don't work with Canvas (if any)
- **Deliverable:** Confirmed Space DS ↔ Canvas compatibility report

### 4. Canvas Component Tree Format Documentation
- **This is critical.** The Next.js blueprint generator needs to produce Canvas-ready component trees.
- Create a Canvas page manually with several Space DS components (hero, CTA, card grid, text-media)
- Export/inspect the stored `component_tree` field from the `canvas_page` entity
- Document the exact JSON/array structure:
  - How components are keyed (UUIDs?)
  - How nesting works (slots, regions)
  - How props are stored per component
  - How component IDs reference SDC components
- Test: can you create a `canvas_page` entity with a pre-built component tree via PHP and have it render correctly?
  ```php
  $page = \Drupal::entityTypeManager()->getStorage('canvas_page')->create([
    'title' => 'Test Page',
    'component_tree' => $tree_array,
  ]);
  $page->save();
  ```
- **Deliverable:** Documented component tree schema + working PHP snippet for programmatic page creation from a pre-built tree

### 5. Multisite Validation
- Test creating a second site in the same codebase
- Verify sites.php routing works
- Verify each site gets isolated DB and file system
- Verify recipes apply per-site correctly

## Acceptance Criteria
- [ ] Drupal CMS 2.0 running locally on DDEV
- [ ] Space DS theme installed and rendering in Canvas
- [ ] CLI install method documented (or blocker identified with workaround)
- [ ] Space DS component compatibility with Canvas confirmed
- [ ] Canvas component tree format fully documented with schema
- [ ] Programmatic `canvas_page` creation from pre-built tree validated
- [ ] Multisite setup tested and validated
- [ ] All findings documented in spike output file

## Dependencies
- None (this is the first task)

## Files/Modules Affected
- `drupal-site/` (new Drupal CMS codebase — may be `drupal/` in final structure)
- `project-management/sprint-outputs/spike-123-drupal-cms.md` (findings)
