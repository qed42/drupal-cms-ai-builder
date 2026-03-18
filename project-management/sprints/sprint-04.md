# Sprint 04: Provisioning Engine & End-to-End Flow

**Milestone:** M3 — Blueprint & Provisioning
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Build the provisioning engine and Drupal Drush commands. Achieve the end-to-end flow: user completes onboarding → blueprint generated → Drupal site provisioned and accessible.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-112 | Drupal Drush Commands | US-012, US-013, US-016 | Drupal | Not Started |
| TASK-111 | Provisioning Engine (Core Orchestrator) | Foundation | Provisioning | Not Started |
| TASK-122 | Provisioning Status UI | US-019 | Next.js | Not Started |

## Dependencies & Risks
- **TASK-112 before TASK-111:** Provisioning engine calls Drush commands — they must exist first
- **TASK-112 depends on Sprint 03:** Parser (114), brand service (115), content types (113) all used by Drush commands
- **TASK-111 depends on TASK-112:** Engine shells out to Drush
- **TASK-122 depends on TASK-111:** Status UI polls provisioning progress
- **Risk:** Drupal multisite setup — sites.php management, per-site settings.php generation. Test thoroughly.
- **Risk:** Canvas programmatic layout creation via Drush — Canvas may not expose full PHP API for CLI usage. May need workarounds.
- **Risk:** End-to-end is the integration test of the entire architecture. Budget time for debugging.

## Deliverable
Complete end-to-end flow works: register → onboard → blueprint → provision → live Drupal site. Progress UI shows real-time status during provisioning.

## Definition of Done
- [ ] `drush ai-site-builder:import-config` installs content types per industry
- [ ] `drush ai-site-builder:import-blueprint` creates pages with Canvas layouts
- [ ] `drush ai-site-builder:apply-brand` generates and applies CSS tokens
- [ ] `drush ai-site-builder:configure-site` sets up menus and pathauto
- [ ] Provisioning engine creates DB, installs Drupal, runs all Drush commands
- [ ] Provisioning engine callbacks update site status in platform DB
- [ ] Progress UI shows step-by-step status during provisioning
- [ ] Rollback works on provisioning failure
- [ ] End-to-end test: onboard → provision → site accessible at domain
- [ ] Code committed
