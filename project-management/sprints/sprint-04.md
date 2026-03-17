# Sprint 04: AI Generation Engine

**Milestone:** M2 — AI Site Generation Engine
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Build the core generation pipeline: queue-based orchestration, Page Builder Agent (creates pages with SDC components via Canvas), and brand token application. This is the "magic moment" sprint.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-016 | Generation pipeline service & queue | US-012, 019 | /dev | L | Not Started |
| TASK-017 | Page Builder AI Agent | US-013 | /dev | XL | Not Started |
| TASK-019 | Brand Token Service | US-016 | /dev | M | Not Started |

## Task Sequence
```
TASK-016 (deps: 002, 011 from prior sprints)
└── TASK-017 (deps: 015, 016, 014 from Sprint 03 + this sprint)

TASK-019 (deps: 002 from Sprint 01) — parallel with 016/017
```

**Parallelization:** TASK-019 (Brand Tokens) is independent and can be developed in parallel with TASK-016/017.

## Dependencies & Risks
- **Depends on:** Sprint 03 (content types, component manifest, Industry Analyzer Agent)
- **HIGHEST RISK SPRINT** — Page Builder Agent (TASK-017) is the most complex task in the project:
  - First integration between AI Agents and Canvas skills
  - Agent must correctly select and place SDC components
  - Output must be valid Canvas layout data
- **Risk:** Canvas skill tools may not exist yet — may need to implement custom tool plugins that wrap Canvas PHP API
- **Risk:** Generation may exceed 5-minute target — optimize prompt chains
- **Mitigation:** Start TASK-017 early in sprint; allocate extra time for prompt engineering and debugging

## Definition of Done
- [ ] Generation pipeline dispatches and processes queue items sequentially
- [ ] Page Builder Agent creates pages with SDC components via Canvas skills
- [ ] Generated pages render correctly with Space theme components
- [ ] Brand colors and fonts applied via CSS custom properties
- [ ] Logo appears in site header
- [ ] Status endpoint returns generation progress
- [ ] Playwright: trigger generation and verify pages exist with components
- [ ] All code committed

## Sprint Deliverable
Click "Generate My Website" → AI creates pages with real SDC components and applies branding. Pages are skeletons ({{generate}} markers) but visually structured. **The "magic moment" is partially demo-able** — you can see page layouts with the right components in place.
