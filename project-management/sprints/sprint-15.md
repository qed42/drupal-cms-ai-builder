# Sprint 15: Provisioning Hardening

**Milestone:** M9 — Provisioning Hardening
**Duration:** 1 week

## Sprint Goal
Add step-level provisioning progress with timing, per-site database isolation, and failure retry from the failed step.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-250 | Provisioning Step Timing & Interim Callbacks | US-054 | L | Not Started |
| TASK-251 | Step-Level Provisioning Progress UI | US-054 | M | Not Started |
| TASK-252 | Per-Site MariaDB User Creation | US-055 | M | Not Started |
| TASK-253 | Provisioning Failure Detail & Resume | US-056 | L | Not Started |

## Dependencies & Risks
- TASK-252 (per-site DB users) is independent — can start immediately
- TASK-250 → TASK-251 (backend before UI)
- TASK-250 → TASK-253 (timing infrastructure before resume support)
- Risk: Per-site MariaDB users must work in DDEV local dev — test thoroughly
- Risk: Resume-from-step requires provisioning engine to skip completed steps reliably
- Note: Some of this work was partially addressed in sprint-05c bug fixes — review existing implementation

## Definition of Done
- [ ] All 11 provisioning steps show individual status with elapsed time
- [ ] Interim callbacks update progress after each step
- [ ] Each site has a unique MariaDB user with random 32-char password
- [ ] settings.php uses site-specific credentials (not root)
- [ ] Failed step shows user-friendly error + technical detail
- [ ] "Retry" button re-runs from the failed step
- [ ] ARIA live regions announce status changes
- [ ] Works in DDEV local dev environment
- [ ] All code committed
