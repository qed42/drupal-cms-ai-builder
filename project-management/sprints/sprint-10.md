# Sprint 10: Enhanced Onboarding Wizard

**Milestone:** M6 — Onboarding Enrichment
**Duration:** 1 week

## Sprint Goal
Add industry follow-up questions, tone/differentiator selection, enhanced page suggestions, and custom page addition to the onboarding wizard.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-200 | Industry Questions Configuration | US-033 | S | Done |
| TASK-201 | Follow-up Questions Onboarding Step | US-033 | M | Done |
| TASK-202 | Tone Selection & Differentiators Step | US-034 | M | Done |
| TASK-203 | Enhanced Page Suggestions API | US-036 | M | Done |
| TASK-204 | Custom Page Addition UI | US-037 | S | Done |

## Dependencies & Risks
- TASK-205 (from Sprint 09) must be complete — new steps need the extended schema
- TASK-200 → TASK-201 (config before UI)
- TASK-201 → TASK-202 (sequential wizard steps)
- TASK-203 → TASK-204 (enhanced suggestions before custom pages)
- Risk: Adding 2-3 steps may increase onboarding abandonment — monitor UX flow length

## Definition of Done
- [ ] Follow-up questions render correctly for healthcare, legal, and restaurant
- [ ] Tone selection shows 4 sample paragraphs with selection
- [ ] Differentiators input has industry-aware placeholder
- [ ] Page suggestions return title + description
- [ ] Custom pages can be added (max 3)
- [ ] Full wizard flow works end-to-end: start → ... → follow-up → tone → generate
- [ ] Playwright test covers the enhanced wizard flow
- [ ] All code committed
