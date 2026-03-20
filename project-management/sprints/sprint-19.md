# Sprint 19: Bug Bash — Auth, Dashboard, Page Quality & Onboarding Fixes

**Milestone:** M14 — Production Readiness
**Duration:** 5 days
**Predecessor:** Sprint 18 (Content Depth & Review Agent — DONE)

## Sprint Goal

Fix all bugs found during end-user visual QA review — prioritizing critical auth/session issues, then page generation quality (depth, composition, menus), dashboard consistency, and UX polish.

## Tasks

### Phase 1: Critical — Auth & Session (Day 1)
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-295 | Fix auth redirects using localhost instead of dynamic origin | P0 | S | `/dev` | Done | Yes (A) |
| TASK-296 | Fix sign-out not clearing session | P0 | S | `/dev` | Done | Yes (B) |

### Phase 2: High — Dashboard, Navigation & Drupal Site Fixes (Day 2)
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-297 | Dashboard shows "Untitled Site" after naming project in onboarding | P1 | M | `/dev` | Done | Yes (A) |
| TASK-298 | Settings and Help nav links return 404 | P1 | S | `/dev` | Done | Yes (B) |
| TASK-304 | Duplicate Home menu item in generated Drupal site | P1 | S | `/dev` | Done | Yes (C) |

### Phase 3: High — Page Generation Quality (Day 3-4)
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-302 | Revise section count ranges — raise min/max by +2 across all page types | P1 | M | `/dev` | Done | Yes (A) |
| TASK-303 | Add organism-level component composition rules to page generation | P1 | L | `/dev` | Done | Yes (B) |
| TASK-301 | Contact page missing form component — form never embedded in page tree | P1 | L | `/dev` | Done | After TASK-302 |

### Phase 4: Medium — UX Polish (Day 5)
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-299 | Industry field shows "Other" — no detection/selection | P2 | M | `/dev` | Done | Yes (A) |
| TASK-300 | Add input validation and guidance to onboarding text fields | P2 | M | `/dev` | Done | Yes (B) |

## Dependencies & Execution Plan

```
Day 1 (parallel — no dependencies):
  Track A: TASK-295 (auth redirects) — find all hardcoded localhost refs in auth routes
  Track B: TASK-296 (session clearing) — fix sign-out cookie/token invalidation

  QA: After both done, re-run Playwright visual test to verify register → login → sign-out flow

Day 2 (parallel — no dependencies):
  Track A: TASK-297 (site name persistence) — trace onboarding name step → API → DB
  Track B: TASK-298 (Settings/Help 404) — add placeholder pages or hide nav items
  Track C: TASK-304 (duplicate Home menu) — fix in BlueprintImportService or provisioning

Day 3 (parallel — TASK-302 + TASK-303 can run simultaneously):
  Track A: TASK-302 (section count revision +2) — update all sectionCountRange, token budget cap, tests
  Track B: TASK-303 (organism composition) — add carousel/accordion/grid composition rules to prompts & tree builder

Day 4 (depends on TASK-302):
  TASK-301 (contact form) — wire space-form components into contact page tree
  Note: TASK-301 builds on TASK-302's contact page range change (2-3 → 4-5)

Day 5 (parallel — no dependencies):
  Track A: TASK-299 (industry detection) — add AI-based industry inference or dropdown
  Track B: TASK-300 (input validation) — add char counts and min-length to onboarding fields
```

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Small (S) | 4 | TASK-295, TASK-296, TASK-298, TASK-304 |
| Medium (M) | 4 | TASK-297, TASK-299, TASK-300, TASK-302 |
| Large (L) | 2 | TASK-301, TASK-303 |
| **Total** | **10 tasks** | 4S + 4M + 2L |

## Risks

1. **Auth redirect fix may have multiple locations** — Search broadly for `localhost` across all API routes, middleware, and env configs. Not just auth.
2. **Site name persistence may require schema check** — If the onboarding wizard only stores name in client state (not API), fixing this requires wiring up an API call.
3. **Industry detection adds AI latency** — If we add AI inference, it should piggyback on the existing page map AI call (step 5) rather than being a separate call.
4. **Higher section counts increase token usage** — +2 sections per page means ~1000 more tokens per page. Token budget cap needs raising from 8000 to ~10000.
5. **Organism composition rules may conflict with AI creativity** — Rules should guide (prefer carousels for testimonials) not mandate. Keep fallback to flat layout if organism component isn't available.
6. **Duplicate Home menu may be a Drupal CMS default** — Need to check if Drupal CMS 2.0 ships with a default Home menu link that conflicts with blueprint import.

## Definition of Done

### Auth & Session (P0)
- [ ] Registration → redirect works from any origin (not just localhost)
- [ ] Sign-out clears session and redirects to login page
- [ ] Login page shows login form when not authenticated
- [ ] Full auth flow verified via Playwright MCP visual test

### Dashboard, Nav & Drupal Site (P1)
- [ ] Dashboard shows the project name entered during onboarding
- [ ] Site avatar reflects first letter of project name
- [ ] Settings and Help links don't produce 404s
- [ ] All navigation links in header lead to valid pages
- [ ] Generated Drupal sites have exactly one "Home" menu item

### Page Generation Quality (P1)
- [ ] All page type section minimums raised by +2 — no page type has minimum below 4
- [ ] Token budget cap raised to accommodate higher section counts
- [ ] Contact page includes a form section with `space-form` + input components
- [ ] Contact page design rules allow 4-5 sections
- [ ] Form fields from `forms.contact.fields` are mapped into the page component tree
- [ ] Testimonials use carousel/slider organisms instead of vertical stacking
- [ ] FAQ items structured as accordion items within accordion containers
- [ ] Team members placed in team grid organisms
- [ ] Feature cards grouped into grid layouts
- [ ] Composition rules documented in page-design-rules or prompts
- [ ] Existing page-design-rules tests updated for new ranges

### UX Polish (P2)
- [ ] Industry populated with detected value on review page
- [ ] Onboarding text fields show character counts
- [ ] Short inputs trigger helpful nudges
- [ ] Continue buttons disabled until minimum input length met

### Sprint-Level
- [ ] All 10 tasks verified fixed via Playwright MCP re-test
- [ ] No regression in existing onboarding flow
- [ ] Code committed with descriptive messages
