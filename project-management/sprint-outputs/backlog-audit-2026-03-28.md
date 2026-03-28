# Backlog Audit Report — 2026-03-28

## Executive Summary

Audited 235 backlog tasks across 17 milestones (M1–M25). Cross-referenced with 51 sprint execution records to determine actual completion state.

## Key Findings

### 1. Task Status Files Never Updated (CRITICAL)
All 235 backlog task markdown files still show `Status: Pending` despite ~265 tasks being executed across 51 sprints. **Sprint files are the only reliable source of truth** for task completion status.

**Recommendation:** Batch-update task file statuses to match sprint execution records, or adopt a convention that task files are write-once planning artifacts and sprints track execution.

### 2. Dead Backlog — Original Drupal-Only Tasks
Tasks `task-001` through `task-034` (34 tasks) were written for the original pure-Drupal architecture. The project pivoted to Next.js + Drupal multisite in Sprint 03, and these were replaced by `task-100+`.

**Recommendation:** Archive `task-001` through `task-034` into a `backlog/archive/` directory or add a `Status: Superseded` header to each.

### 3. Milestone Numbering Gaps
- **M11–M13**: No user stories — work was tracked only via backlog tasks and sprints
- **M14–M17**: Operational milestones (bug fixes, UX polish, stock images) — no user stories
- **M19**: Component coverage expansion — no user stories, tasks only

**Recommendation:** Accept these as "operational milestones" that don't need user stories. Document in README as done (already updated).

### 4. Milestone Definition Conflicts
M22 is double-defined:
- User stories: "User-Uploaded Images" (US-081–085, US-091)
- Some backlog tasks: "Onboarding UX Modernization" (TASK-480–485)

The Onboarding UX work was actually M25 per sprint files.

**Recommendation:** Standardize TASK-480–485 as M25 in their files.

### 5. Deferred Work Summary

**M5 — Publishing & Subscription (6 stories, never started):**
- Draft/publish workflow (US-029, US-030)
- Stripe subscription (US-004)
- Trial expiry handling (US-003)
- SSL provisioning (US-032)
- Custom domains (US-031)

**M10 — Quality Framework (3 stories remaining):**
- Content quality validation artifacts (US-060)
- Vision deck (US-061)
- Content quality dashboard (US-062)

**M20 — AI Transparency (4 stories remaining):**
- Live generation narrative (US-067, P2)
- "Why This?" tooltips (US-068, P2)
- Page-level insights panel (US-069, P2)
- Dashboard impact summary (US-071, P3)

### 6. Stale Backlog Items
The following tasks exist in backlog but have no sprint assignment and may be obsolete:
- TASK-277–279 (M17 UX Polish) — may have been superseded by M18/M25 UX work
- TASK-295–304 (M18 Auth & Dashboard Bugs) — likely fixed in later sprints
- TASK-305–311 (M19 Component Coverage) — partially superseded by Space DS v2 migration

**Recommendation:** Review each cluster against current codebase to determine if issues still exist.

## Statistics

| Category | Count |
|----------|-------|
| Total backlog task files | 235 |
| Executed via sprints | ~265 (includes sub-tasks, bugs) |
| Dead/superseded (task-001–034) | 34 |
| Truly pending (with user stories) | ~13 (M5 + M10 + M20 remainders) |
| Potentially stale | ~25 (M17, M18 bugs, M19) |

## Recommended Actions

1. **No immediate action needed** — sprint files serve as execution records
2. **Archive dead backlog** — move task-001 through task-034 if desired
3. **Prioritize M5** — Publishing & Subscription is the largest unaddressed PRD requirement
4. **Close stale bugs** — verify TASK-295–304 against current codebase
5. **Accept M20 remainder as backlog** — US-067/068/069/071 are P2/P3 polish items
