# TASK-014: Shared Content Type Definitions

**Story:** US-012
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M2 — AI Site Generation Engine

## Description
Create all predefined content type configs (node types, field storage, field instances, form/view display modes) shipped with the module. All content types include `field_site_profile` for data isolation.

## Technical Approach
- Export config YAML for each node type: page, service, team_member, testimonial, location, provider, practice_area, listing, menu_item, case_study
- Create shared field storage configs: field_description, field_image, field_bio, field_photo, field_cta_text, field_cta_link, field_weight, field_site_profile, etc.
- Create field instance configs per content type
- Create form display and view display configs
- Set up pathauto patterns for each content type
- Set up metatag defaults for each content type
- Create `menu_category` taxonomy vocabulary config (for restaurant menu items)

## Acceptance Criteria
- [ ] All 10 content types install correctly on module install
- [ ] Each content type has `field_site_profile` entity reference field
- [ ] Fields have appropriate widgets and formatters configured
- [ ] Pathauto patterns generate clean URLs (e.g., /services/{title})
- [ ] Content can be created and edited via Drupal forms

## Dependencies
- TASK-001 (Module scaffold)
- TASK-002 (SiteProfile entity — referenced by field_site_profile)

## Files/Modules Affected
- `ai_site_builder/config/install/node.type.*.yml` (10 files)
- `ai_site_builder/config/install/field.storage.node.*.yml` (~20 files)
- `ai_site_builder/config/install/field.field.node.*.yml` (~50 files)
- `ai_site_builder/config/install/core.entity_form_display.node.*.yml`
- `ai_site_builder/config/install/core.entity_view_display.node.*.yml`
- `ai_site_builder/config/install/pathauto.pattern.*.yml`
