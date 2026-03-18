# Sprint 05: Site Editing & Dashboard

**Milestone:** M4 — Site Editing
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Enable site owners to edit their provisioned Drupal sites via Canvas, with JWT-based auto-login from the platform dashboard. Add form submission handling.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-116 | Auto-Login System (JWT) | US-020 | Next.js + Drupal | Not Started |
| TASK-117 | Platform Dashboard | Foundation | Next.js | Not Started |
| TASK-118 | Canvas Editor Config | US-020 | Drupal | Not Started |
| TASK-121 | Form Submission & Notifications | US-027 | Drupal | Not Started |

## Dependencies & Risks
- **TASK-116 depends on Sprint 04:** Site must be provisioned before auto-login can work
- **TASK-117 depends on TASK-116:** Dashboard "Edit Site" button uses auto-login
- **TASK-118 depends on Sprint 04:** Canvas must be installed on provisioned site
- **TASK-121 independent:** Can be built in parallel (Webform configuration)
- **Risk:** JWT shared secret management across Next.js and Drupal — ensure env vars are consistent
- **Risk:** Canvas editor UX for site owners — may need to hide/simplify Drupal admin chrome

## Deliverable
User logs into platform dashboard, sees their site status, clicks "Edit Site", lands in Canvas editor on their Drupal site. Contact form submissions stored and email notifications sent.

## Definition of Done
- [ ] JWT auto-login creates Drupal session from platform dashboard
- [ ] Dashboard shows site status (live, domain URL)
- [ ] "Edit Site" opens Canvas editor in new tab
- [ ] site_owner role has correct permissions (Canvas editing, no admin access)
- [ ] Form submissions stored in Webform
- [ ] Email notifications sent on form submission
- [ ] Playwright tests for dashboard → Canvas flow
- [ ] Code committed
