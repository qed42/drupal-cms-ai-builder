# Sprint 38: Content Quality Hardening — Hero Headlines, Image Dedup & Design Review

**Milestone:** M21 — Content Quality Hardening
**Duration:** 3 days
**Predecessor:** Sprint 37 (M20 AI Transparency complete)

## Sprint Goal

Eliminate generic "Welcome" hero headlines, guarantee unique images per section, and add automated visual quality checks to the pipeline — ensuring every generated site looks professionally designed without manual intervention.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-422 | Remove hardcoded "Welcome" fallback from Mercury hero tree-builder | US-074 | S | None | DONE |
| TASK-423 | Fix review agent hero heading check to use Mercury's `heading_text` prop | US-074 | S | None | DONE |
| TASK-424 | Add per-page image deduplication to image resolver | US-075 | M | None | DONE |
| TASK-425 | Add design review checks to review agent | US-076 | M | TASK-423 | DONE |

**Note:** Prompt-level fixes for hero headlines were already applied in the previous session (plan.ts, page-generation.ts, prompt-fragments.ts, page-design-rules.ts). This sprint addresses the code-level fixes that the prompt changes alone cannot solve.

## Execution Order

```
Wave 1 (parallel): TASK-422, TASK-423, TASK-424
Wave 2:            TASK-425  ← depends on TASK-423 (hero heading quality check consolidation)
```

TASK-422 and TASK-423 are both small and independent — they fix different layers (tree-builder vs review agent). TASK-424 is self-contained (image pipeline). TASK-425 extends the review agent and should incorporate the hero heading check from TASK-423.

## Dependencies & Risks

- **No external dependencies** — all tasks modify existing pipeline code with no new APIs or services.
- **Risk:** TASK-424 increases `per_page` from 1 to 5 on Pexels API. For a 5-page site with ~10 images each, this uses the same 50 API calls (cache prevents re-fetching). Pexels free tier (200/hr) is still comfortable.
- **Risk:** TASK-425 design checks as `error` severity (hero heading) trigger retries. If the AI keeps generating "Welcome" despite prompt fixes, the retry loop could exhaust attempts. Mitigation: TASK-422 eliminates the tree-builder fallback, so even if the AI fails, "Welcome" never appears.
- **Integration:** TASK-423 and TASK-425 both touch `review.ts`. If developed in parallel, merge carefully. Recommended: complete TASK-423 first, then build TASK-425 on top.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-422, TASK-423 |
| M | 2 | TASK-424, TASK-425 |
| **Total** | **4 tasks** | |

## Definition of Done

- [ ] No generated site displays "Welcome", "Welcome to [Name]", or any generic greeting as hero h1
- [ ] Hero heading on every page is a marketing-grade headline derived from business context
- [ ] Review agent correctly detects and rejects generic hero headings (error severity)
- [ ] No two sections on the same page display the same stock photo
- [ ] Cards in multi-column grids each have visually distinct images
- [ ] Review agent flags consecutive identical backgrounds (warning)
- [ ] Review agent flags non-alternating text-image sections (warning)
- [ ] Review agent flags consecutive identical composition patterns (warning)
- [ ] All review checks execute in <50ms per page (deterministic, no AI calls)
- [ ] Generate a test site end-to-end and verify: unique hero headlines, unique images, no visual quality warnings
