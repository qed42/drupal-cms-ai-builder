# Sprint 05: Site Editing, Auto-Login & Dashboard UX

**Milestone:** M4 — Site Editing
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Fix the dashboard-first UX flow for returning users, implement JWT-based auto-login from platform to Drupal Canvas editor, configure Canvas editing permissions, and wire up form submission notifications. Also resolve deferred Sprint 04 minor bugs.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-124 | Dashboard-First UX Flow | US-020 | Next.js | S | Done |
| TASK-116 | Auto-Login System (JWT Auth Handoff) | US-020 | Next.js + Drupal | M | Done |
| TASK-118 | Canvas Editor Config | US-020 | Drupal | M | Done |
| TASK-121 | Form Submission & Notifications | US-027 | Drupal | S | Done |
| S04-BUGS | Sprint 04 Deferred Minor Bugs (BUG-007–010) | — | Drupal + Provisioning | S | Done |

## Notes
- **TASK-124 is P0** — returning users currently hit a dead-end after login. This must land first as it affects the entire dashboard flow that TASK-116 builds on.
- **TASK-117 (Dashboard)** was completed in Sprint 03. TASK-124 enhances it with the "Add new website" action and fixes auth redirect.
- **S04-BUGS** covers 4 deferred minor bugs: BUG-007 (dead ternary in BrandTokenService), BUG-008 (double file read), BUG-009 (settings.php quote escaping), BUG-010 (unnecessary dynamic import). All cosmetic/perf — no functional blockers.

## Execution Order

```
Phase 1 — UX Fix (Days 1-2):
└── TASK-124: Dashboard-first UX flow
    └── Auth redirect → dashboard for returning users
    └── "Add new website" button + API route
    └── No dependencies — only touches existing Next.js dashboard

Phase 2 — Parallel (Days 3-7):
├── TASK-116: Auto-login system (JWT)
│   └── Next.js API creates JWT token
│   └── Drupal controller validates + creates session
│   └── Dashboard "Edit Site" button wires to auto-login URL
│   └── Depends on: TASK-124 (dashboard must be the landing page)
├── TASK-121: Form submission & notifications (independent)
│   └── Webform email handler config
│   └── Submission storage + notification emails
└── S04-BUGS: Minor bug fixes (independent, low effort)

Phase 3 — Sequential (Days 8-10):
└── TASK-118: Canvas editor config
    └── site_owner role permissions
    └── Space DS component palette
    └── Admin toolbar customization
    └── Depends on: TASK-116 (auto-login must work to test Canvas editing flow)
```

## Dependencies & Risks
- **Sprint 04 must be complete:** Provisioned Drupal CMS site with Space DS + Canvas required ✅
- **TASK-124 → TASK-116:** Dashboard must be the post-login landing before wiring "Edit Site" to auto-login
- **TASK-116 → TASK-118:** Auto-login lands user in Canvas editor; Canvas config defines the editing experience
- **TASK-121 independent:** Can be built in parallel (Webform already installed via Drupal CMS recipe)
- **S04-BUGS independent:** All minor fixes, no cross-task dependencies
- **Risk:** JWT shared secret management across Next.js and Drupal — ensure env vars are consistent
- **Risk:** Canvas editor UX for site owners — Drupal CMS uses Gin admin theme; may need to hide admin chrome for `site_owner` role
- **Note:** Webform is pre-installed via `drupal_cms_forms` recipe — TASK-121 only configures submission handling + email notifications, not module installation

## Deliverable
Returning users land on their dashboard with site listing. "Add new website" starts a new onboarding flow. "Edit Site" opens Canvas editor via seamless JWT auth. Contact form submissions are stored and email notifications sent. All Sprint 04 minor bugs resolved.

## Definition of Done
- [ ] Returning users land on `/dashboard` after login (not `/onboarding/name`)
- [ ] "Add new website" creates onboarding session and redirects to wizard
- [ ] JWT auto-login creates Drupal session from platform dashboard
- [ ] "Edit Site" opens Canvas editor in new tab (no re-authentication)
- [ ] `site_owner` role has correct permissions (Canvas editing, no admin access)
- [ ] Invalid/expired JWT tokens are rejected with user-friendly error
- [ ] Form submissions stored in Webform
- [ ] Email notifications sent on form submission
- [ ] BUG-007 through BUG-010 resolved
- [ ] Playwright tests for dashboard → Canvas flow
- [ ] Code committed
