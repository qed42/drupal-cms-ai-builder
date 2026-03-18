# Sprint 05b: End-to-End Provisioning & QA Stabilization

**Milestone:** M3 + M4 — Blueprint/Provisioning & Site Editing
**Duration:** 1 week (~5 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Wire the provisioning engine into the blueprint pipeline so sites are automatically provisioned after blueprint generation. Validate the full end-to-end flow with QA and Playwright tests for Sprint 05 + TASK-125.

## Context
TASK-125 code is already implemented (this session). TASK-122 (provisioning status UI) was largely addressed as part of TASK-125 — the progress page now tracks provisioning steps. This sprint focuses on **QA validation, environment wiring, and Playwright tests** rather than heavy development.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-125 | Wire Provisioning Engine to Blueprint Pipeline | US-019 | Next.js + Provisioning | M | Done |
| TASK-122 | Provisioning Status UI (polish) | US-019 | Next.js | S | Done |
| S05-QA | Sprint 05 QA — Playwright Tests | — | QA | M | Done |
| S05b-ENV | Environment Setup & Config | — | DevOps | S | Done |

## Task Details

### TASK-125: Wire Provisioning Engine (Code Complete)
- Auto-trigger provisioning from blueprint generator
- `/api/provision/start` route for manual trigger/retry
- `/api/provision/callback` route receives step-11 callback → site goes live
- `spawnProvisioning()` runs CLI as detached child process
- Progress UI updated to show provisioning steps
- **QA needed:** Validate the full flow in DDEV environment

### TASK-122: Provisioning Status UI (Polish)
- Progress page already updated: 6 steps (4 generation + provisioning + live)
- SiteCard handles `provisioning_failed` status
- **Remaining:** Verify progress polling works correctly during provisioning phase
- **Remaining:** Error state retry from dashboard for failed provisioning

### S05-QA: Sprint 05 Playwright Tests
Write and run Playwright tests covering:
- Dashboard-first UX flow (TASK-124): login → dashboard, "Add new website"
- Auto-login JWT flow (TASK-116): mock JWT validation, redirect verification
- Canvas editor permissions (TASK-118): site_owner role access checks
- Form submission notifications (TASK-121): webform submit → email handler
- Provisioning trigger (TASK-125): blueprint ready → provisioning starts → callback → live

### S05b-ENV: Environment Setup
- Configure `JWT_SHARED_SECRET` in both Next.js `.env` and Drupal `settings.php`
- Configure `PROVISION_CALLBACK_KEY` for callback auth
- Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` for provisioning
- Verify DDEV multisite setup works with provisioning engine
- Document env var requirements in project README

## Execution Order

```
Parallel (Days 1-2):
├── S05b-ENV: Environment configuration and DDEV setup
├── TASK-122: Polish provisioning status UI (minor)
└── S05-QA (prep): Test fixture setup, test scaffolding

Sequential (Days 3-5):
└── S05-QA: Full Playwright test suite
    └── Depends on: S05b-ENV (environment must be running)
    └── Covers: Sprint 05 + TASK-125 acceptance criteria
    └── Bug fixes as discovered → immediate fix-and-retest cycle
```

## Dependencies & Risks
- **DDEV required:** Provisioning engine spawns `ddev drush` commands — DDEV must be running
- **Database access:** Provisioning creates per-site databases — MySQL root or GRANT-capable user needed
- **Network:** Callback URL must be reachable from the provisioning process
- **Risk:** Child process spawning in Next.js dev server — may need `npx tsx` path resolution
- **Risk:** Multisite file permissions — `sites/{domain}/` directories need web server write access

## Deliverable
Complete end-to-end flow: user registers → onboarding → blueprint generation → **automatic Drupal site provisioning** → site goes live → dashboard shows live site → "Edit Site" opens Canvas editor. All covered by Playwright tests.

## Definition of Done
- [ ] Blueprint generation auto-triggers provisioning
- [ ] Provisioning callback updates site to `"live"` with `drupalUrl`
- [ ] Progress UI shows provisioning steps (not just blueprint generation)
- [ ] Failed provisioning shows error state with retry option
- [ ] Environment variables documented and configured
- [ ] DDEV multisite provisioning works end-to-end
- [ ] Playwright tests pass for Sprint 05 acceptance criteria
- [ ] Playwright tests pass for TASK-125 provisioning flow
- [ ] All code committed
