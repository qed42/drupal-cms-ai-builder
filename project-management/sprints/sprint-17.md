# Sprint 17: Quality Framework & UX Phase 2

**Milestone:** M10 — Quality Framework + M11 — UX Phase 2
**Duration:** 1 week

## Sprint Goal
Build the content quality evaluation framework and deliver UX Phase 2 (trust & delight) improvements.

## Tasks

### Phase 1: Quality Framework (Days 1-3)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-260 | Synthetic Test Case Definitions | US-057 | L | Not Started |
| TASK-261 | Manual Test Scripts | US-057 | M | Not Started |
| TASK-262 | Playwright E2E Test Framework | US-058 | L | Not Started |
| TASK-263 | Content Evaluation Rubric | US-059 | M | Not Started |
| TASK-264 | Content Uniqueness Validator | US-060 | M | Not Started |

### Phase 2: UX Trust & Delight (Days 4-5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-277 | Onboarding UX Polish — Skip Labels, Helper Text, Layout Variation | ONB-3, ONB-4, ONB-5 | M | Not Started |
| TASK-278 | Generation Contextual Messages & Error Clarity | GEN-2, GEN-6 | M | Not Started |
| TASK-279 | Dashboard Welcome State & Subscription Clarity | DASH-3, DASH-6 | S | Not Started |

### Deferred (Sprint 18+ or Post-MVP)
| ID | Item | Priority | Reason |
|----|------|----------|--------|
| TASK-265 | Before/After Comparison Artifacts | P1 | Depends on quality framework maturity |
| TASK-266 | Vision Deck | P2 | Communication artifact, not product feature |
| TASK-267 | Content Quality Dashboard | P2 | Nice-to-have |
| AUTH-3 | Google Social Login | P1 | Needs architect input |
| DS-4 | Light Mode Support | P1 | Significant theme rework |
| DS-6 | Illustration Assets | P1 | External design resource needed |

## Dependencies & Risks
- TASK-260 → TASK-261 (definitions before scripts)
- TASK-260 → TASK-262 (definitions before Playwright tests)
- TASK-263 → TASK-264 (rubric before quality validation)
- UX Phase 2 tasks depend on TASK-271 (Sprint 15 brand identity)
- Risk: Playwright tests depend on AI output which is non-deterministic — use threshold-based assertions
- Risk: 10-minute timeout per test case means full suite takes 50+ minutes

## Definition of Done

### Quality Framework
- [ ] 10+ synthetic test cases covering 10 industries
- [ ] Manual test scripts for each test case
- [ ] 5+ Playwright E2E tests passing (word count, keywords, no placeholders)
- [ ] Evaluation rubric codified with automated scoring for 4+ dimensions
- [ ] Content uniqueness validated (< 20% shared between any two sites)

### UX Phase 2
- [ ] Optional onboarding steps show "Skip" or "Optional" label
- [ ] Text input steps include contextual examples/inspiration
- [ ] Generation shows specific contextual messages during each phase
- [ ] Error states explain issues in plain language with data safety reassurance
- [ ] First-time dashboard users see welcome guidance
- [ ] Subscription status communicates value and limits
- [ ] All code committed with passing tests
