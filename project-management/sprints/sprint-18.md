# Sprint 18: Content Depth Enforcement & Quality Review Agent

**Milestone:** M13 — Content Quality & SEO Readiness
**Duration:** 1 week
**Predecessor:** Sprint 16 (Provisioning Hardening — DONE)

## Sprint Goal

Ensure AI-generated pages meet minimum content depth requirements and pass a quality review for content structure, SEO, and GEO before blueprint finalization.

## Tasks

### Phase 1: Quick Wins — Depth Enforcement (Days 1-2)
| ID | Task | Story | Effort | Assignee | Status | Parallel? |
|----|------|-------|--------|----------|--------|-----------|
| TASK-287 | Strengthen plan prompt with hard section count constraints | US-062 | S | `/dev` | Done | Yes (A) |
| TASK-289 | Increase token budget for content-heavy pages | US-062 | S | `/dev` | Done | Yes (B) |
| TASK-288 | Plan-level section count validation with retry | US-062 | M | `/dev` | Done | After TASK-287 |

### Phase 2: Review Agent Core (Days 3-4)
| ID | Task | Story | Effort | Assignee | Status | Parallel? |
|----|------|-------|--------|----------|--------|-----------|
| TASK-290 | Build quality review agent — content depth checks + unit tests | US-063 | M | `/dev` | Done | Yes (A) |
| TASK-291 | Add SEO quality checks to review agent + unit tests | US-063 | M | `/dev` | Done | After TASK-290 |
| TASK-292 | Add GEO quality checks to review agent + unit tests | US-063 | S | `/dev` | Done | After TASK-290 |

### Phase 3: Integration & Observability (Day 5)
| ID | Task | Story | Effort | Assignee | Status | Parallel? |
|----|------|-------|--------|----------|--------|-----------|
| TASK-293 | Integrate review agent into generate loop with retry | US-063 | M | `/dev` | Done | After TASK-290,291,292 |
| TASK-294 | Metrics logging for content depth & review scores | US-062,063 | S | `/dev` | Done | After TASK-293 |

## Architecture Reference

- **PRD:** `project-management/requirements/REQ-content-depth-and-review-agent.md`
- **Architecture:** `project-management/requirements/architecture/architecture-review-agent.md`
- **Key ADRs:** ADR-010 (deterministic rules, no AI), ADR-011 (two-stage validation), ADR-012 (plan retry capped at 1)

## Dependencies & Execution Plan

```
Day 1 (parallel):
  Track A: TASK-287 (prompt hardening) → TASK-288 (plan validation + retry)
  Track B: TASK-289 (token budget scaling)

Day 2:
  TASK-288 continues (needs TASK-287 done first)
  Test: Generate plans for 3 site types, verify section counts meet minimums

Day 3 (parallel after Phase 1 complete):
  TASK-290 (review agent core — content depth checks)

Day 4 (parallel, both depend on TASK-290):
  Track A: TASK-291 (SEO checks)
  Track B: TASK-292 (GEO checks)

Day 5:
  TASK-293 (wire review into generate loop)
  TASK-294 (metrics logging)
```

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Small (S) | 4 | TASK-287, TASK-289, TASK-292, TASK-294 |
| Medium (M) | 4 | TASK-288, TASK-290, TASK-291, TASK-293 |
| **Total** | **8 tasks** | 4S + 4M |

## Risks

1. **Plan retry adds latency** — Each plan retry is another AI call (~3-5s). Mitigated by stronger prompt reducing retry frequency.
2. **Word count estimation is approximate** — We're counting words in props, not rendered output. Acceptable for a quality gate; not pixel-perfect.
3. **Review feedback may confuse the AI** — If feedback is too prescriptive, the AI may produce worse output on retry. Keep feedback specific but allow creative freedom.
4. **GEO checks are novel** — No established standards. Keep as advisory (warnings) not blocking.

## Definition of Done

### Content Depth
- [ ] Plan prompt uses mandatory language for section counts
- [ ] Plan validation rejects pages with fewer sections than minimum, retries once
- [ ] Token budget scales with section count (base 4000 + 500/section above 3)
- [ ] Home pages consistently produce 5+ sections
- [ ] Services pages consistently produce 4+ sections

### Review Agent
- [ ] `review.ts` exists with content depth, SEO, and GEO checks
- [ ] Each check has unit tests (pass + fail scenarios)
- [ ] Review agent integrated into generate loop with max 2 retries
- [ ] Failed pages use best attempt (highest score) after retries exhausted
- [ ] Review scores logged per page and saved to blueprint metadata

### Validation
- [ ] Generate a restaurant site — Home has 5+ sections, Services has 4+ sections
- [ ] Generate a law firm site — all pages meet minimums, SEO checks pass
- [ ] Generate a dental clinic — verify depth + SEO + GEO checks produce meaningful scores
- [ ] No regression in generation time beyond +15 seconds for happy path
