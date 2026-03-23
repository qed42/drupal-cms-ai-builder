# TASK-386: Header nav should use Drupal menus; footer needs grouped layout

**Story:** Onboarding UX Polish
**Priority:** P1
**Estimated Effort:** M
**Milestone:** UX Polish

## Problem

### Header
Navigation links and CTA are rendered as Canvas component tree items (mercury:button) inside a canvas_page entity placed in the header region. This bypasses Drupal's native menu system — no menu block, no menu_link_content entities, no menu UI for end users to manage.

### Footer
All footer content (brand text, nav links, social links, legal links, copyright) is placed flat into footer slots without semantic grouping. Mercury's `mercury:group` component exists but is not used, making the footer visually unstructured.

## Expected Behavior

### Header
- Nav links from the blueprint should create `menu_link_content` entities in Drupal's `main` menu
- A menu block should be placed in Mercury's header region (or the navbar component should consume the Drupal menu)
- CTA button can remain as a Canvas component
- End users should be able to manage navigation via Drupal's menu UI

### Footer
- Footer content should be organized using `mercury:group` components:
  - Group 1: Brand description
  - Group 2: Navigation links
  - Group 3: Social links
  - Group 4: Legal links + copyright
- Each group renders in the appropriate footer slot

## Technical Approach

### Header — Menu Integration
1. In `BlueprintImportService::importHeaderFooter()`, extract nav link items from the header component_tree
2. Create `menu_link_content` entities in the `main` menu for each nav page
3. Place a system menu block (`system_menu_block:main`) in the header region via config
4. Keep the CTA as a canvas component or a separate block
5. Alternatively: modify the `mercury:navbar` SDC to render the Drupal `main` menu natively

### Footer — Group Wrapping
1. Update `buildFooterTree()` in `packages/ds-mercury/src/tree-builders.ts`
2. Wrap related items in `mercury:group` components before placing in footer slots
3. Reference `drupal-site/web/themes/contrib/mercury/components/group/group.component.yml` for the group slot structure

## Key Files

| File | Change |
|------|--------|
| `packages/ds-mercury/src/tree-builders.ts` | Update `buildFooterTree()` to use `mercury:group` wrappers |
| `drupal-site/.../BlueprintImportService.php` | Add menu_link_content creation in `importHeaderFooter()` |
| `drupal-site/.../ai_site_builder.module` | May need updates to preprocess_page for menu block |
| `drupal-site/.../mercury/components/group/group.component.yml` | Reference for group slot structure |
| `drupal-site/.../mercury/components/footer/footer.component.yml` | Reference for footer slot structure |

## Acceptance Criteria

- [ ] Navigation links appear as Drupal menu items manageable via admin UI
- [ ] Header renders navbar with menu + CTA button
- [ ] Footer groups brand, nav, social, and legal content into separate visual sections
- [ ] Mercury theme renders header/footer correctly on all pages
- [ ] Existing Space DS adapter is not affected (Mercury-specific changes)

## Dependencies
- Depends on commit c4887ba (Canvas hydration fix — all manifest props backfilled)
- No other blockers
