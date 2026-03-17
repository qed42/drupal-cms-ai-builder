# Sprint 03: AI Agent Foundation & Onboarding Completion

**Milestone:** M1 (completion) + M2 (start)
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Build the Industry Analyzer AI Agent, complete the onboarding wizard (Step 5 with dynamic questions), and lay groundwork for generation (content types + component manifest).

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-011 | Industry Analyzer AI Agent | US-009, 010 | /dev | L | Not Started |
| TASK-012 | Wizard Step 5 — Dynamic questions | US-009 | /dev | M | Not Started |
| TASK-014 | Shared content type definitions | US-012 | /dev | L | Not Started |
| TASK-015 | SDC component manifest service | US-013 | /dev | M | Not Started |

## Task Sequence
```
TASK-011 (deps: 001, 002, 003 from Sprint 01)
└── TASK-012 (deps: 006 from Sprint 02, 011)

TASK-014 (deps: 001, 002 from Sprint 01) — parallel with 011
TASK-015 (deps: 001 from Sprint 01) — parallel with 011, 014
```

**Parallelization:** TASK-011, TASK-014, and TASK-015 have no dependencies on each other — all three can be developed in parallel. TASK-012 depends on TASK-011 completion.

## Dependencies & Risks
- **Depends on:** Sprint 01 + 02 completion (SiteProfile with data, wizard framework)
- **Risk:** First real AI Agent integration — may uncover API gaps in ai_agents module. Budget extra time for debugging.
- **Risk:** Space theme SDC component analysis for manifest — components may have inconsistent YAML schemas
- **Risk:** LLM response quality for industry questions — prompt engineering iteration needed

## Definition of Done
- [ ] Industry Analyzer Agent generates 3–5 relevant questions for Healthcare, Legal, and Real Estate industries
- [ ] Step 5 renders AI-generated questions with appropriate input types
- [ ] "Generate My Website" button visible after completing Step 5
- [ ] All 10 content types install with correct fields and field_site_profile reference
- [ ] Component manifest service returns structured catalog of Space SDC components
- [ ] Playwright: full onboarding flow (Steps 1–5) end-to-end test
- [ ] All code committed

## Sprint Deliverable
Complete onboarding flow — user registers, answers all 5 steps including AI-generated questions, and clicks "Generate My Website." Content types and component manifest ready for generation pipeline. **First AI interaction demo-able.**
