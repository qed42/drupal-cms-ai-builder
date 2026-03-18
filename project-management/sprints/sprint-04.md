# Sprint 04: Drupal Foundation & Provisioning Engine

**Milestone:** M3 — Blueprint & Provisioning
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Set up the Drupal multisite foundation, build all Drush commands for blueprint import, and wire up the provisioning engine. Achieve the end-to-end flow: blueprint → Drupal site provisioned and accessible.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-113 | Content Type Configs (v2) | US-012 | Drupal | Not Started |
| TASK-114 | Blueprint Parser Service | US-013 | Drupal | Not Started |
| TASK-115 | Brand Token Service (v2) | US-016 | Drupal | Not Started |
| TASK-112 | Drupal Drush Commands | US-012, US-013, US-016 | Drupal | Not Started |
| TASK-111 | Provisioning Engine (Core Orchestrator) | Foundation | Provisioning | Not Started |

## Dependencies & Risks
- **TASK-113 → TASK-114:** Parser creates entities of configured content types
- **TASK-113 + TASK-114 + TASK-115 → TASK-112:** Drush commands orchestrate parser, brand service, and config import
- **TASK-112 → TASK-111:** Provisioning engine shells out to Drush commands
- **Sprint 03 must be complete:** Blueprint format defined and generator working
- **Risk:** Drupal multisite setup — sites.php management, per-site settings.php. Test on DDEV.
- **Risk:** Canvas programmatic layout creation — Canvas may not expose full PHP API for CLI use
- **Risk:** End-to-end integration debugging — budget extra time
- **Parallel opportunity:** Content types (113), brand service (115) can be developed in parallel

## Deliverable
Complete end-to-end flow: blueprint generated in Sprint 03 → provisioning engine creates Drupal site → all pages, content, brand tokens applied → site accessible at domain.

## Definition of Done
- [ ] Content type configs install cleanly per industry
- [ ] Blueprint parser correctly reads markdown format from Sprint 03 generator
- [ ] Brand token service generates CSS custom properties from tokens.json
- [ ] `drush ai-site-builder:import-config` installs content types per industry
- [ ] `drush ai-site-builder:import-blueprint` creates pages with Canvas layouts
- [ ] `drush ai-site-builder:apply-brand` generates and applies CSS tokens
- [ ] `drush ai-site-builder:configure-site` sets up menus and pathauto
- [ ] Provisioning engine creates DB, installs Drupal, runs all Drush commands
- [ ] Provisioning engine callbacks update site status in platform DB
- [ ] Rollback works on provisioning failure
- [ ] End-to-end test: blueprint → provision → site accessible at domain
- [ ] Code committed
