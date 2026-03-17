# Sprint 05: Content Generation & Forms

**Milestone:** M2 (completion) + M4
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Build the Content Generator Agent (fills pages with real text, SEO meta, CTAs) and Form Generator Agent (creates webforms). After this sprint, generated sites have real content.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-018 | Content Generator AI Agent | US-014, 015, 017 | /dev | XL | Not Started |
| TASK-020 | Generation progress UI | US-019 | /dev | M | Not Started |
| TASK-026 | Form Generator AI Agent | US-026, 028 | /dev | L | Not Started |

## Task Sequence
```
TASK-018 (deps: 017, 014 from Sprint 03/04)
TASK-020 (deps: 016 from Sprint 04) — parallel with 018
TASK-026 (deps: 017, 016 from Sprint 04) — parallel with 018
```

**Parallelization:** All three tasks can start in parallel — TASK-018, TASK-020, and TASK-026 have independent dependencies already satisfied.

## Dependencies & Risks
- **Depends on:** Sprint 04 (generation pipeline, Page Builder Agent, content types)
- **Risk:** Content quality — LLM-generated text may need significant prompt engineering for industry-appropriate tone
- **Risk:** Content Generator must correctly fill {{generate}} markers via canvas_set_component_props — test integration thoroughly
- **Risk:** Webform creation via AI agent tools — verify Webform API compatibility
- **Mitigation:** Test with Healthcare scenario first (best documented industry); iterate prompts

## Definition of Done
- [ ] Content Generator fills all {{generate}} markers with industry-appropriate content
- [ ] Pages have meta titles (<60 chars) and descriptions (<160 chars)
- [ ] Entity instances created (services, team members, etc.) with realistic content
- [ ] CTAs placed with correct text and link destinations
- [ ] Compliance disclaimers included for Healthcare/Legal industries
- [ ] Contact form created with industry-appropriate fields
- [ ] Form submissions stored in Drupal
- [ ] Progress UI shows generation steps in real-time
- [ ] Playwright: full generation flow → verify content on pages
- [ ] All code committed

## Sprint Deliverable
**Full "magic moment" demo-able**: Register → Onboard → Generate → See a complete, branded website with real content, CTAs, SEO meta, and a contact form. This is the investor demo milestone.
