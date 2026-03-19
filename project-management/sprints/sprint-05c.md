# Sprint 05c: Provisioning Pipeline Stabilization

**Milestone:** M4 — Site Editing
**Duration:** Ad-hoc (1 session)
**Architecture:** v2 (Split Platform)
**Date:** 2026-03-19

## Sprint Goal
Fix all remaining provisioning pipeline failures (steps 8–11) so that end-to-end site creation works from onboarding through to a live Drupal site. Rewrite developer onboarding docs.

## Context
After Sprint 05b established Docker Compose orchestration and multi-site progress tracking, provisioning steps 8–10 were still commented out due to unresolved failures. Step 11 (callback) was also failing with 401 auth errors. This sprint addresses all four steps and adds error resilience.

## Tasks
| ID | Task | Workstream | Effort | Status |
|----|------|------------|--------|--------|
| TASK-128 | Fix cross-container file path in apply-brand step | Provisioning | XS | Done |
| TASK-129 | Add required prop defaults for Space DS components | Next.js | S | Done |
| TASK-130 | Fix pathauto crash in configure-site command | Drupal | XS | Done |
| TASK-131 | Fix provisioning callback auth & failure handling | Provisioning + Next.js | S | Done |
| TASK-132 | Rewrite getting-started guide | Docs | S | Done |

## Execution Order

All fixes were applied sequentially, testing after each change:

```
1. TASK-128: Fix /tmp/ path → shared volume path
   └── Unblocks step 9 (Apply Brand Tokens)

2. TASK-129: Add REQUIRED_PROP_DEFAULTS map
   └── Unblocks step 8 (Import Blueprint)
   └── Patched existing blueprint JSON for testing

3. TASK-130: Try-catch in pathauto bulk update
   └── Unblocks step 10 (Configure Site)

4. TASK-131: Callback auth header + failure handling
   └── Fixes step 11 (Platform Callback)
   └── Adds failure callback + smart rollback

5. TASK-132: Rewrite getting-started.md
   └── Independent — done after all pipeline fixes verified
```

## Verification

Full 11-step provisioning run verified end-to-end:
- All 11 steps completed successfully (164.9s total)
- Site status updated to `live` in PostgreSQL
- Blueprint import created 6 pages with Canvas component trees
- Brand tokens CSS generated and applied
- Pathauto aliases generated (broken alias type gracefully skipped)

## Definition of Done
- [x] Steps 8–10 uncommented in `provision.ts`
- [x] Step 8 (Import Blueprint) succeeds with component trees
- [x] Step 9 (Apply Brand Tokens) writes CSS to `public://css/brand-tokens.css`
- [x] Step 10 (Configure Site) rebuilds routes, runs pathauto, clears caches
- [x] Step 11 (Platform Callback) authenticates and updates site status to `live`
- [x] On failure: site status set to `provisioning_failed` (enables UI retry)
- [x] On callback-only failure: site preserved (no rollback)
- [x] Full pipeline tested: 11/11 steps pass
- [x] `getting-started.md` rewritten with architecture, setup, troubleshooting
- [x] Code committed
