# Sprint 39: Onboarding UX Polish — Conversational Labels, Archie Branding & AI Transparency

**Milestone:** M20 — Transparent AI Onboarding
**Duration:** 2 days
**Predecessor:** Sprint 38 (M21 Content Quality Hardening — DONE)

## Sprint Goal

Transform the onboarding journey from a mechanical configuration wizard into a conversational AI collaboration by introducing the "Archie" persona, rewriting all step copy to be conversational and input-quality-aware, and adding InferenceCards to 3 more steps.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-426 | Update `onboarding-steps.ts` with new labels and section names | US-077 | XS | None | DONE |
| TASK-427 | Update headings/subtitles/buttons on "Your Business" section (start, theme, name, idea, audience) | US-077, US-078 | S | TASK-426 | DONE |
| TASK-428 | Update headings/subtitles/buttons on "Site Structure" section (pages, design, brand, fonts) | US-077, US-078 | S | TASK-426 | DONE |
| TASK-429 | Update headings/subtitles/buttons on "Brand & Style" + "Review & Build" sections (follow-up, tone, review-settings) | US-077, US-078 | S | TASK-426 | DONE |
| TASK-430 | Rebrand existing InferenceCards to "Archie understood" | US-079 | XS | None | DONE |
| TASK-431 | Add InferenceCard to pages step — "Archie planned your site" | US-079 | S | None | DONE |
| TASK-432 | Add InferenceCard to brand step — "Archie extracted your brand" | US-079 | S | None | DONE |
| TASK-433 | Add InferenceCard to fonts step — "How Archie uses your fonts" | US-079 | S | None | DONE |
| TASK-434 | Add Archie-branded input quality feedback to idea, audience, follow-up | US-080 | M | TASK-427 | DONE |

## Execution Order

```
Wave 1 (parallel): TASK-426, TASK-430, TASK-431, TASK-432, TASK-433
Wave 2 (parallel): TASK-427, TASK-428, TASK-429  ← depend on TASK-426 (section names must exist first)
Wave 3:            TASK-434                        ← depends on TASK-427 (idea step copy must be in place before modifying validation messages)
```

**Wave 1** has no dependencies — the config file update, InferenceCard rebranding, and new InferenceCard additions are all independent. TASK-426 is tiny (XS) and will complete first in practice.

**Wave 2** updates all 12 step page files with new headings, subtitles, and buttons. These 3 tasks are split by progress stepper section so they can be developed in parallel without merge conflicts.

**Wave 3** adds input quality feedback, which depends on the idea step heading/subtitle being in place (TASK-427) since validation messages reference the same Archie persona and shouldn't contradict the step copy.

## Dependencies & Risks

- **No external dependencies** — all tasks modify existing UI files with no new APIs, packages, or services
- **Risk: Const assertion breakage** — `onboarding-steps.ts` uses `as const`. Changing label strings may break any code that pattern-matches on exact string values. Mitigation: grep for old label strings in the codebase before applying changes.
- **Risk: Test breakage** — Any Playwright tests that assert on old heading text or button labels will fail. Mitigation: update test assertions as part of each task.
- **Risk: Review-settings summary** — The review-settings page shows a full input summary. Ensure "Archie" references in the summary copy are consistent with step headings. Addressed in TASK-429.
- **Integration note:** TASK-430 and TASK-427 both touch `idea/page.tsx`. If developed in parallel, merge carefully. The InferenceCard title change (TASK-430) is a single prop change and should merge cleanly.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| XS | 2 | TASK-426, TASK-430 |
| S | 5 | TASK-427, TASK-428, TASK-429, TASK-431, TASK-432, TASK-433 |
| M | 1 | TASK-434 |
| **Total** | **9 tasks** | |

## Definition of Done

- [ ] All 12 onboarding step headings are conversational and reference "Archie" where appropriate
- [ ] Progress stepper shows "Your Business", "Site Structure", "Brand & Style", "Review & Build"
- [ ] All section-boundary buttons preview the next section name (e.g., "Next: Site Structure")
- [ ] All 3 existing InferenceCards show "Archie understood" instead of "AI understood"
- [ ] Pages step shows "Archie planned your site" InferenceCard with page count and list
- [ ] Brand step shows "Archie extracted your brand" InferenceCard after color extraction
- [ ] Fonts step shows "How Archie uses your fonts" InferenceCard with selected fonts
- [ ] Idea step validation messages use Archie-branded text
- [ ] Audience step shows tiered quality hints (< 30, 30-80, > 80 chars)
- [ ] Follow-up step shows per-field quality hints with Archie branding
- [ ] No TypeScript compilation errors
- [ ] Existing Playwright tests updated for new string values (if any exist)
- [ ] Visual walkthrough of all 12 steps confirms consistent voice and tone
