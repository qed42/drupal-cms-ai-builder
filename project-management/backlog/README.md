# Technical Backlog

Generated from user stories and Drupal technical design on 2026-03-17.

## Task Summary

| ID | Task | Story | Priority | Effort | Milestone | Dependencies |
|----|------|-------|----------|--------|-----------|-------------|
| TASK-001 | Scaffold ai_site_builder core module | Foundation | P0 | M | M1 | None |
| TASK-002 | Create SiteProfile custom entity | US-005–011 | P0 | L | M1 | TASK-001 |
| TASK-003 | Create industry taxonomy vocabulary | US-006 | P0 | S | M1 | TASK-001 |
| TASK-004 | Simplified user registration form | US-001 | P0 | M | M1 | TASK-001, 002 |
| TASK-005 | Trial activation service | US-002 | P0 | M | M1 | TASK-002, 004 |
| TASK-006 | Onboarding wizard framework | US-005, 007 | P0 | L | M1 | TASK-002, 004 |
| TASK-007 | Wizard Step 1 — Site basics | US-005 | P0 | M | M1 | TASK-006 |
| TASK-008 | Wizard Step 2 — Industry selection | US-006 | P0 | S | M1 | TASK-003, 006 |
| TASK-009 | Wizard Step 3 — Brand input | US-007 | P0 | M | M1 | TASK-006, 008 |
| TASK-010 | Wizard Step 4 — Business context | US-008 | P0 | M | M1 | TASK-006 |
| TASK-011 | Industry Analyzer AI Agent | US-009, 010 | P0 | L | M1 | TASK-001, 002, 003 |
| TASK-012 | Wizard Step 5 — Dynamic questions | US-009 | P0 | M | M1 | TASK-006, 011 |
| TASK-013 | Save & resume onboarding | US-011 | P2 | S | M1 | TASK-006–012 |
| TASK-014 | Shared content type definitions | US-012 | P0 | L | M2 | TASK-001, 002 |
| TASK-015 | SDC component manifest service | US-013 | P0 | M | M2 | TASK-001 |
| TASK-016 | Generation pipeline service & queue | US-012, 019 | P0 | L | M2 | TASK-002, 011 |
| TASK-017 | Page Builder AI Agent | US-013 | P0 | XL | M2 | TASK-015, 016, 014 |
| TASK-018 | Content Generator AI Agent | US-014, 015, 017 | P0 | XL | M2 | TASK-017, 014 |
| TASK-019 | Brand Token Service | US-016 | P0 | M | M2 | TASK-002 |
| TASK-020 | Generation progress UI | US-019 | P1 | M | M2 | TASK-016 |
| TASK-021 | Canvas editor config for site owners | US-020 | P0 | M | M3 | TASK-017, 004 |
| TASK-022 | Section-level AI regeneration | US-021 | P0 | L | M3 | TASK-021, 018 |
| TASK-023 | Page add & remove | US-023 | P0 | M | M3 | TASK-021 |
| TASK-024 | Component swap | US-024 | P2 | L | M3 | TASK-021, 015 |
| TASK-025 | Media management configuration | US-025 | P2 | M | M3 | TASK-021 |
| TASK-026 | Form Generator AI Agent | US-026, 028 | P0 | L | M4 | TASK-017, 016 |
| TASK-027 | Form submission storage & notifications | US-027 | P0 | M | M4 | TASK-026 |
| TASK-028 | Draft mode & content preview | US-029 | P0 | M | M5 | TASK-018, 021 |
| TASK-029 | Publish service & one-click publish | US-030 | P0 | M | M5 | TASK-028, 005 |
| TASK-030 | Trial expiry cron & notifications | US-003 | P1 | M | M5 | TASK-005, 029 |
| TASK-031 | Subscription integration (Stripe) | US-004 | P1 | XL | M5 | TASK-005, 029 |
| TASK-032 | SSL provisioning | US-032 | P0 | M | M5 | TASK-029 |
| TASK-033 | Custom domain support | US-031 | P2 | L | M5 | TASK-029, 032 |
| TASK-034 | Node access & data isolation | Security | P0 | M | M1 | TASK-002, 014 |

## Totals

| Metric | Count |
|--------|-------|
| Total Tasks | 34 |
| P0 Tasks | 25 |
| P1 Tasks | 4 |
| P2 Tasks | 5 |
| Small (S) | 3 |
| Medium (M) | 17 |
| Large (L) | 9 |
| XL | 5 |

## Effort Legend

| Size | Approximate Duration |
|------|---------------------|
| S | 0.5–1 day |
| M | 1–2 days |
| L | 2–3 days |
| XL | 3–5 days |

## Critical Path

```
TASK-001 → TASK-002 → TASK-006 → TASK-007/008/009/010 → TASK-011 → TASK-012
                                                              ↓
TASK-003 ──────────────────────────────────────────────→ TASK-011
                                                              ↓
TASK-014 ─────────────────────────────────────────────→ TASK-016 → TASK-017 → TASK-018
                                                                        ↓
TASK-015 ─────────────────────────────────────────────────────────→ TASK-017
                                                                        ↓
                                                              TASK-021 → TASK-022
                                                                   ↓
                                                              TASK-028 → TASK-029 → TASK-032
```

## Next Steps

Invoke `/tpm sprint` to plan sprints from this backlog, or `/dev TASK-NNN` to begin implementation.
