# Sprint 16: Provisioning Hardening & Deferred Review Features

**Milestone:** M9 — Provisioning Hardening
**Duration:** 1 week

## Sprint Goal
Harden the provisioning pipeline with step-level progress, per-site database isolation, and failure retry. Also deliver deferred review page features from Sprint 14.

## Tasks

### Phase 1: Provisioning Hardening (Days 1-3)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-250 | Provisioning Step Timing & Interim Callbacks | US-054 | L | Not Started |
| TASK-251 | Step-Level Provisioning Progress UI | US-054 | M | Not Started |
| TASK-252 | Per-Site MariaDB User Creation | US-055 | M | Not Started |
| TASK-253 | Provisioning Failure Detail & Resume | US-056 | L | Not Started |

### Phase 2: Deferred Review Features (Days 4-5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-237 | Version Comparison Diff View | US-051 | M | Not Started |
| TASK-239 | Download Menu (JSON + Markdown ZIP) | US-053 | M | Not Started |
| TASK-221 | Phase Retry & Re-run | US-045 | M | Not Started |

## Dependencies & Risks

### Provisioning
- TASK-252 (per-site DB users) is independent — can start immediately
- TASK-250 → TASK-251 (backend before UI)
- TASK-250 → TASK-253 (timing infrastructure before resume support)
- Risk: Per-site MariaDB users must work in DDEV local dev — test thoroughly
- Risk: Resume-from-step requires provisioning engine to skip completed steps reliably

### Review Features
- TASK-237 depends on TASK-236 (version preservation from Sprint 13 — already done)
- TASK-239 depends on TASK-230 (markdown renderer from Sprint 13 — already done)
- TASK-221 depends on pipeline orchestrator (Sprint 12 — already done)

## Definition of Done

### Provisioning
- [ ] All 11 provisioning steps show individual status with elapsed time
- [ ] Interim callbacks update progress after each step
- [ ] Each site has a unique MariaDB user with random 32-char password
- [ ] settings.php uses site-specific credentials (not root)
- [ ] Failed step shows user-friendly error + technical detail
- [ ] "Retry" button re-runs from the failed step
- [ ] ARIA live regions announce status changes
- [ ] Works in DDEV local dev environment

### Review Features
- [ ] Version diff shows additions (green) and removals (red)
- [ ] Download menu offers JSON and Markdown ZIP
- [ ] Phase re-run available on completed pipeline phases
- [ ] All code committed with passing tests
