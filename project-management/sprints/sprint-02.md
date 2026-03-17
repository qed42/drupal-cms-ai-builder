# Sprint 02: Onboarding Wizard

**Milestone:** M1 — Platform Foundation & Onboarding
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Build the complete 5-step onboarding wizard (Steps 1–4), including the multi-step form framework, trial activation, and all static input steps.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-005 | Trial activation service | US-002 | /dev | M | Not Started |
| TASK-006 | Onboarding wizard framework | US-005, 007 | /dev | L | Not Started |
| TASK-007 | Wizard Step 1 — Site basics | US-005 | /dev | M | Not Started |
| TASK-008 | Wizard Step 2 — Industry selection | US-006 | /dev | S | Not Started |
| TASK-009 | Wizard Step 3 — Brand input | US-007 | /dev | M | Not Started |
| TASK-010 | Wizard Step 4 — Business context | US-008 | /dev | M | Not Started |

## Task Sequence
```
TASK-005 (deps: 002, 004 from Sprint 01)
TASK-006 (deps: 002, 004 from Sprint 01)
├── TASK-007 (deps: 006)
├── TASK-008 (deps: 003, 006)
├── TASK-009 (deps: 006, 008)
└── TASK-010 (deps: 006)
```

**Parallelization:** TASK-005 and TASK-006 can be developed in parallel. Steps 007/008/010 can be parallelized after TASK-006. TASK-009 depends on TASK-008 (industry selection drives default palette).

## Dependencies & Risks
- **Depends on:** Sprint 01 completion (SiteProfile entity, registration, industry taxonomy)
- **Risk:** Color picker and font selector JS libraries need evaluation — test lightweight options early in the sprint
- **Risk:** Alpine.js integration with Drupal Form API AJAX — prototype in TASK-006

## Definition of Done
- [ ] User registers → lands on onboarding wizard
- [ ] Steps 1–4 collect and save all data to SiteProfile
- [ ] Step navigation works (Next/Back) with AJAX transitions
- [ ] Progress indicator shows "Step X of 5"
- [ ] Trial activates automatically on registration (14-day)
- [ ] Color picker, font selector, file upload all functional
- [ ] Playwright: complete Steps 1–4 end-to-end test
- [ ] All code committed

## Sprint Deliverable
A user can register and complete the first 4 steps of the onboarding wizard. Step 5 (AI-generated questions) comes next sprint. **Demo-able**: walk through the wizard entering business information.
