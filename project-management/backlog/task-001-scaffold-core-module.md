# TASK-001: Scaffold ai_site_builder Core Module

**Story:** Foundation (supports all stories)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Create the `ai_site_builder` module skeleton with info.yml, routing, services, permissions, and directory structure. Install contrib dependencies (ai, ai_agents, canvas, webform, metatag, pathauto, key). Set up the Space theme as default frontend theme.

## Technical Approach
- Create `ai_site_builder.info.yml` with dependencies on ai, ai_agents, canvas, webform, metatag, pathauto, key
- Create empty `.module`, `.routing.yml`, `.services.yml`, `.permissions.yml` files
- Create `src/` directory structure: Entity, Form, Controller, Service, Plugin, EventSubscriber, Event, Access
- Create `config/install/ai_site_builder.settings.yml` with default settings
- Install and configure Space theme. Space theme available at: https://www.drupal.org/project/space_ds. Follow README.md to also compile the CSS & JS for the theme.
- Verify all contrib modules install cleanly on Drupal 11

## Acceptance Criteria
- [ ] Module installs without errors on a clean Drupal 11 site
- [ ] All contrib dependencies are installable and compatible
- [ ] Space theme is set as default theme
- [ ] Module settings config is importable

## Dependencies
- None (first task)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/`
- `composer.json` (add contrib dependencies)
