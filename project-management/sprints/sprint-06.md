# Sprint 06: Site Editing & Form Notifications

**Milestone:** M3 — Site Editing & Refinement + M4 (completion)
**Duration:** 2 weeks (~9 dev days)

## Sprint Goal
Enable site owners to edit their generated site via Canvas, regenerate sections with AI, manage pages, and receive form submission notifications.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-021 | Canvas editor config for site owners | US-020 | /dev | M | Not Started |
| TASK-022 | Section-level AI regeneration | US-021 | /dev | L | Not Started |
| TASK-023 | Page add & remove | US-023 | /dev | M | Not Started |
| TASK-027 | Form submission storage & notifications | US-027 | /dev | M | Not Started |

## Task Sequence
```
TASK-021 (deps: 017, 004 from prior sprints)
├── TASK-022 (deps: 021, 018)
└── TASK-023 (deps: 021)

TASK-027 (deps: 026 from Sprint 05) — parallel with 021/022/023
```

**Parallelization:** TASK-027 is independent of Canvas tasks and can be developed in parallel.

## Dependencies & Risks
- **Depends on:** Sprint 05 (content generation, form generation)
- **Risk:** Canvas editor may need customization to show simplified toolbar for site owners
- **Risk:** Section regeneration requires JS integration with Canvas editor — may need Canvas hooks/API that aren't documented
- **Mitigation:** Focus on TASK-021 first to understand Canvas customization surface

## Definition of Done
- [ ] Site owner can open any page in Canvas and edit inline
- [ ] Canvas component palette shows Space SDC components
- [ ] "Regenerate with AI" button works on any section
- [ ] Regeneration accepts user guidance and updates only the selected section
- [ ] Site owner can add new pages (with menu link) and delete pages (except Home)
- [ ] Form submissions trigger email to site owner
- [ ] Submissions dashboard shows all submissions for the user's site
- [ ] Playwright: edit a section, regenerate it, add a page, submit a form
- [ ] All code committed

## Sprint Deliverable
Site owners can edit, regenerate, and manage pages on their generated site. Form submissions notify the owner. **Full edit workflow demo-able.**
