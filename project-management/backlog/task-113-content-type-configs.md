# TASK-113: Content Type Config Definitions (v2)

**Story:** US-012 (Content Type Auto-Creation)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M3 — Blueprint & Provisioning

## Description
Refactor the `ai_site_builder_content` submodule to ship content type definitions as YAML config, organized for per-industry selective installation. Removes `field_site_profile` from all types (multisite isolation replaces ACL).

## Technical Approach
- Refactor existing content type configs from Sprint 03 to remove `field_site_profile` references
- Organize configs into industry groups so `import-config` can install selectively
- Create a config mapping file or service that maps industry → content types

- **Universal types (all industries):** page, service, team_member, testimonial
- **Healthcare:** provider, location
- **Legal:** practice_area, case_study
- **Real Estate:** listing
- **Restaurant:** menu_item, location
- **Professional Services:** case_study

- Config files include:
  - `node.type.{type}.yml`
  - `field.storage.node.field_{field}.yml`
  - `field.field.node.{type}.field_{field}.yml`
  - `core.entity_view_display.node.{type}.default.yml`
  - `core.entity_form_display.node.{type}.default.yml`
  - `pathauto.pattern.{type}.yml`

- Create industry mapping config: `ai_site_builder.industry_content_types.yml`

## Acceptance Criteria
- [ ] All content types defined as YAML config (no field_site_profile)
- [ ] Config files pass `drush config:import` validation
- [ ] Industry mapping correctly associates types to industries
- [ ] Universal types included for all industries
- [ ] Each content type has view display and form display configs
- [ ] Pathauto patterns defined for all types

## Dependencies
- None (builds on existing Sprint 03 content type work)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/modules/ai_site_builder_content/config/install/*.yml`
- `web/modules/custom/ai_site_builder/config/install/ai_site_builder.industry_content_types.yml`
