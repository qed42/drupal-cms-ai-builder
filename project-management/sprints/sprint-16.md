# Sprint 16: Provisioning Hardening, Layout Correctness & Dashboard Security

**Milestone:** M9 — Provisioning Hardening + M12 — Visual Content Enrichment (layout)
**Duration:** 1 week
**Predecessor:** Sprint 15 (CLOSED — UX Overhaul Phase 1 complete)

## Sprint Goal
Harden the provisioning pipeline with step-level progress (user-friendly labels), per-site database isolation, and failure retry. Fix stock image rendering (P0), component layout containment, and replace custom auth with Drupal's built-in one-time login.

## Tasks

### Phase 1: Critical Bug Fix + Provisioning Hardening (Days 1-3)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-285 | Fix stock images not rendering on provisioned Drupal sites (path rewriting) | US-061 | M-L | Done |
| TASK-286 | Fix stock images rendering as empty src (Canvas image field entity resolution) | US-061 | M | Done |
| TASK-250 | Provisioning Step Timing & Interim Callbacks | US-054 | L | Done |
| TASK-251 | Step-Level Provisioning Progress UI (includes TASK-283 user-friendly labels) | US-054 | M | Done |
| TASK-252 | Per-Site MariaDB User Creation | US-055 | M | Done |
| TASK-253 | Provisioning Failure Detail & Resume | US-056 | L | Done |

> **Note:** TASK-283 (user-friendly step labels) is merged into TASK-251. The label mapping from TASK-283 was implemented as part of the progress UI.

### Phase 2: Layout Correctness (Day 4)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-282 | Enrich Space DS manifest with layout wrapper rules (container wrapping + anti-monotony) | US-061 | M | Done |

### Phase 3: Dashboard & Auth Fixes (Day 5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-284 | Replace auto-login with Drupal one-time login link + "Visit Site" CTA | US-054 | S-M | Done |

### Phase 4: Deferred Review Features (Stretch)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-237 | Version Comparison Diff View | US-051 | M | Not Started |
| TASK-239 | Download Menu (JSON + Markdown ZIP) | US-053 | M | Not Started |
| TASK-221 | Phase Retry & Re-run | US-045 | M | Not Started |

## Dependencies & Risks

### Phase 1 Parallelism
```
Day 1 (parallel tracks):
  Track A: TASK-285 (stock images investigation — P0, start immediately)
  Track B: TASK-250 (provisioning timing — backend foundation)
  Track C: TASK-252 (per-site DB users — independent)

Day 2-3 (sequential after Track B):
  TASK-250 → TASK-251 (timing → progress UI + friendly labels)
  TASK-250 → TASK-253 (timing → failure retry)
```

### Stock Images (TASK-285)
- **P0 — highest priority in this sprint**
- Cross-boundary bug spanning Next.js, provisioning, and Drupal Canvas
- Requires deep investigation of Canvas `BlueprintImportService` internals
- May need changes in all three layers (image injection, file copy, Canvas rendering)
- Risk: If Canvas requires managed file entities, provisioning pipeline needs significant rework

### Provisioning
- TASK-252 (per-site DB users) is independent — can start immediately
- TASK-250 → TASK-251 (backend timing → UI with user-friendly labels from TASK-283)
- TASK-250 → TASK-253 (timing infrastructure before resume support)
- Risk: Per-site MariaDB users must work in DDEV local dev — test thoroughly
- Risk: Resume-from-step requires provisioning engine to skip completed steps reliably

### Layout
- TASK-282 is independent — can start Day 1 in parallel but scheduled Day 4 to focus capacity
- Risk: Container wrapping changes the Canvas component tree structure — must validate in Drupal that Canvas renders the parent-child container→organism hierarchy correctly

### Auth
- TASK-284 depends on Sprint 15 (TASK-276 dashboard redesign — DONE)
- Risk: Drush `user:login` execution requires the provisioning container to have access to the Drupal DDEV container

### Review Features (Stretch)
- TASK-237 depends on TASK-236 (version preservation from Sprint 13 — already done)
- TASK-239 depends on TASK-230 (markdown renderer from Sprint 13 — already done)
- TASK-221 depends on pipeline orchestrator (Sprint 12 — already done)

## Definition of Done

### Stock Images
- [x] Stock images render visibly on provisioned Drupal sites (hero banners, cards, text-media)
- [x] Image `src` paths resolve correctly to accessible files via the browser
- [x] Canvas component tree image format matches what Canvas actually renders
- [x] If managed file entities are required, provisioning pipeline creates them during image copy
- [x] Components without images still render correctly (no broken image icons)

### Provisioning
- [x] All 12 provisioning steps show individual status with elapsed time
- [x] Step labels are user-friendly (no technical jargon — per TASK-283 label mapping)
- [x] Interim callbacks update progress after each step
- [x] Each site has a unique MariaDB user with random 32-char password
- [x] settings.php uses site-specific credentials (not root)
- [x] Failed step shows user-friendly error + technical detail
- [x] "Retry" button re-runs from the failed step
- [x] ARIA live regions announce status changes
- [ ] Works in DDEV local dev environment

### Layout
- [x] Component tree builder wraps non-hero organisms in `space-container` with `boxed-width`
- [x] Hero banners and CTA banners are NOT wrapped
- [x] Anti-monotony: consecutive identical components are auto-substituted with variants
- [ ] Generated Canvas trees render correctly in Drupal with proper containment

### Auth & Dashboard
- [x] "Edit Site" generates Drupal one-time login link (via `drush uli`)
- [x] One-time login redirects to `/canvas` after authentication
- [x] "Visit Site" button visible on live site cards, opens homepage in new tab
- [x] Custom JWT auto-login route replaced with `drush uli`

### Review Features (Stretch)
- [ ] Version diff shows additions (green) and removals (red)
- [ ] Download menu offers JSON and Markdown ZIP
- [ ] Phase re-run available on completed pipeline phases
- [ ] All code committed with passing tests
