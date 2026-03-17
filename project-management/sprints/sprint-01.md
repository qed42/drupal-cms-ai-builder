# Sprint 01: Platform Foundation

**Milestone:** M1 — Platform Foundation & Onboarding
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Stand up the Drupal 11 project with the core module, SiteProfile entity, user registration, and data isolation — the foundation everything else builds on.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-001 | Scaffold ai_site_builder core module | Foundation | /dev | M | Not Started |
| TASK-002 | Create SiteProfile custom entity | US-005–011 | /dev | L | Not Started |
| TASK-003 | Create industry taxonomy vocabulary | US-006 | /dev | S | Not Started |
| TASK-004 | Simplified user registration form | US-001 | /dev | M | Not Started |
| TASK-034 | Node access & data isolation | Security | /dev | M | Not Started |

## Task Sequence
```
TASK-001 (no deps)
├── TASK-002 (depends on 001)
│   ├── TASK-004 (depends on 001, 002)
│   └── TASK-034 (depends on 002) — can start once content types partially exist
└── TASK-003 (depends on 001, parallel with 002)
```

**Parallelization:** TASK-002 and TASK-003 can be developed in parallel after TASK-001.

## Dependencies & Risks
- **Risk:** Contrib module compatibility with Drupal 11 (ai, ai_agents, canvas, webform) — test during TASK-001
- **Risk:** Space theme availability and SDC component completeness — validate during TASK-001
- **Blocker if:** Canvas or AI Agents modules don't install on Drupal 11 — escalate to stakeholder immediately

## Definition of Done
- [ ] Drupal 11 project installs cleanly with all contrib dependencies
- [ ] SiteProfile entity CRUD works via entity API and admin UI
- [ ] User can register, gets site_owner role, SiteProfile created
- [ ] Node access isolation tested: user A cannot see user B's content
- [ ] Industry taxonomy with 6 terms installed
- [ ] Playwright: registration flow smoke test
- [ ] All code committed

## Sprint Deliverable
A functional Drupal 11 instance where a user can register, which creates their SiteProfile and sets up data isolation. Not yet visible to end users — this is plumbing.
