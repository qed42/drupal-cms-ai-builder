# Sprint 16: Provisioning Hardening, Layout Correctness & Dashboard Security

**Milestone:** M9 — Provisioning Hardening + M12 — Visual Content Enrichment (layout)
**Duration:** 1 week

## Sprint Goal
Harden the provisioning pipeline with step-level progress (user-friendly labels), per-site database isolation, and failure retry. Fix component layout containment and replace custom auth with Drupal's built-in one-time login.

## Tasks

### Phase 1: Provisioning Hardening (Days 1-3)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-250 | Provisioning Step Timing & Interim Callbacks | US-054 | L | Not Started |
| TASK-251 | Step-Level Provisioning Progress UI | US-054 | M | Not Started |
| TASK-283 | Provisioning Progress — User-Friendly Step Labels & Visibility | US-054 | M | Not Started |
| TASK-252 | Per-Site MariaDB User Creation | US-055 | M | Not Started |
| TASK-253 | Provisioning Failure Detail & Resume | US-056 | L | Not Started |

### Phase 2: Layout & Rendering Correctness (Day 4)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-282 | Enrich Space DS manifest with layout wrapper rules (container wrapping) | US-061 | M | Not Started |

### Phase 3: Dashboard & Auth Fixes (Day 5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-284 | Replace auto-login with Drupal one-time login link + "Visit Site" CTA | US-054 | S-M | Not Started |

### Phase 4: Deferred Review Features (Stretch)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-237 | Version Comparison Diff View | US-051 | M | Not Started |
| TASK-239 | Download Menu (JSON + Markdown ZIP) | US-053 | M | Not Started |
| TASK-221 | Phase Retry & Re-run | US-045 | M | Not Started |

## Dependencies & Risks

### Provisioning
- TASK-252 (per-site DB users) is independent — can start immediately
- TASK-250 → TASK-251 → TASK-283 (backend timing → UI → user-friendly labels)
- TASK-250 → TASK-253 (timing infrastructure before resume support)
- Risk: Per-site MariaDB users must work in DDEV local dev — test thoroughly
- Risk: Resume-from-step requires provisioning engine to skip completed steps reliably

### Layout
- TASK-282 is independent — can start Day 1 in parallel with provisioning work
- Risk: Container wrapping changes the Canvas component tree structure — must validate in Drupal that Canvas renders the parent-child container→organism hierarchy correctly

### Auth
- TASK-284 depends on Sprint 15 (TASK-276 dashboard redesign) for consistent UI
- Risk: Drush `user:login` execution requires the provisioning container to have access to the Drupal DDEV container

### Review Features (Stretch)
- TASK-237 depends on TASK-236 (version preservation from Sprint 13 — already done)
- TASK-239 depends on TASK-230 (markdown renderer from Sprint 13 — already done)
- TASK-221 depends on pipeline orchestrator (Sprint 12 — already done)

## Definition of Done

### Provisioning
- [ ] All 12 provisioning steps show individual status with elapsed time
- [ ] Step labels are user-friendly (no technical jargon — per TASK-283 mapping)
- [ ] Interim callbacks update progress after each step
- [ ] Each site has a unique MariaDB user with random 32-char password
- [ ] settings.php uses site-specific credentials (not root)
- [ ] Failed step shows user-friendly error + technical detail
- [ ] "Retry" button re-runs from the failed step
- [ ] ARIA live regions announce status changes
- [ ] Works in DDEV local dev environment

### Layout
- [ ] Component manifest includes `layout.requires_container` for all organisms
- [ ] Component tree builder wraps non-hero organisms in `space-container` with `boxed-width`
- [ ] Hero banners and CTA banners are NOT wrapped
- [ ] Generated Canvas trees render correctly in Drupal with proper containment

### Auth & Dashboard
- [ ] "Edit Site" generates Drupal one-time login link (via `drush uli`)
- [ ] One-time login redirects to `/canvas` after authentication
- [ ] "Visit Site" button visible on live site cards, opens homepage in new tab
- [ ] Custom JWT auto-login route removed/deprecated

### Review Features (Stretch)
- [ ] Version diff shows additions (green) and removals (red)
- [ ] Download menu offers JSON and Markdown ZIP
- [ ] Phase re-run available on completed pipeline phases
- [ ] All code committed with passing tests
