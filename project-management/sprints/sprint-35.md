# Sprint 35: Live Inference Cards on Input Steps

**Milestone:** M20 — AI Transparency
**Duration:** 2 days
**Predecessor:** Sprint 34 (AI Strategy Preview)
**Can parallel with:** Sprint 34 (no dependency between them)

## Sprint Goal

Show users what the AI inferred from their input immediately after they provide it — building trust at the earliest moment in the journey.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-398 | Build reusable `InferenceCard` component (inline card, CSS animation, auto-dismiss) | US-072 | M | — | DONE |
| TASK-399 | Enrich `/api/ai/analyze` response with `detectedServices` field | US-073 | M | — | DONE |
| TASK-400 | Enrich `/api/ai/suggest-audiences` response with `painPoints` field | US-073 | M | — | DONE |
| TASK-401 | Integrate InferenceCard on Idea step (industry, services, compliance from analyze response) | US-064 | M | TASK-398, TASK-399 | DONE |
| TASK-402 | Integrate InferenceCard on Audience step (audience label, pain points from suggest-audiences) | US-064 | S | TASK-398, TASK-400 | DONE |
| TASK-403 | Integrate InferenceCard on Tone step (tone characteristics + examples from local tone-samples.ts) | US-064 | S | TASK-398 | DONE |

**Note:** Original TASK-404 ("Looks right" / "Edit" interaction) was folded into TASK-401/402/403 — each step integration includes the confirm/edit callbacks with scroll-to-field behavior.

## Execution Order

```
Wave 1 (parallel): TASK-398, TASK-399, TASK-400
Wave 2 (parallel): TASK-401, TASK-402, TASK-403   ← each depends on TASK-398 + its API task
```

## Dependencies & Risks

- **Risk:** Enriching analyze/suggest-audiences prompts may add >500ms latency. Mitigation: measure baseline before/after; keep prompt additions to <100 tokens.
- **Dependency:** TASK-398 (component) must complete before TASK-401/402/403 (integrations).
- **No cross-sprint dependency:** This sprint can run in parallel with Sprint 34.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-402, TASK-403 |
| M | 4 | TASK-398, TASK-399, TASK-400, TASK-401 |
| **Total** | **6 tasks** | |

## Definition of Done

- [ ] Inference cards appear on Idea, Audience, and Tone steps after field validation
- [ ] Cards show relevant AI insights (industry, services, pain points, tone examples)
- [ ] Each card includes an explanation sentence about downstream impact
- [ ] "Looks right" dismisses the card; "Edit" scrolls to and focuses the input field
- [ ] Cards render inline in StepLayout's `insightSlot` (desktop and mobile)
- [ ] No additional API calls beyond existing validation endpoints (just enriched responses)
- [ ] Cards auto-dismiss after 30s if user doesn't interact
- [ ] `role="status"` and `aria-live="polite"` on cards for screen readers
- [ ] Playwright test: fill idea field → verify inference card appears with industry classification
