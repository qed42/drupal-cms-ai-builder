# Sprint 07: Publishing & Trial Management

**Milestone:** M5 — Publishing & Subscription
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Enable one-click publishing, draft mode enforcement, trial expiry management, SSL provisioning, and save/resume onboarding. After this sprint, the end-to-end flow is complete.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-028 | Draft mode & content preview | US-029 | /dev | M | Not Started |
| TASK-029 | Publish service & one-click publish | US-030 | /dev | M | Not Started |
| TASK-032 | SSL provisioning | US-032 | /dev | M | Not Started |
| TASK-030 | Trial expiry cron & notifications | US-003 | /dev | M | Not Started |
| TASK-013 | Save & resume onboarding | US-011 | /dev | S | Not Started |

## Task Sequence
```
TASK-028 (deps: 018, 021 from prior sprints)
└── TASK-029 (deps: 028, 005)
    ├── TASK-032 (deps: 029)
    └── TASK-030 (deps: 005, 029)

TASK-013 (deps: 006–012) — parallel, independent
```

**Parallelization:** TASK-013 and TASK-028 can start in parallel. TASK-032 and TASK-030 can start in parallel after TASK-029.

## Dependencies & Risks
- **Depends on:** Sprint 06 (Canvas config, content generation — for draft content to exist)
- **Risk:** SSL provisioning depends on hosting infrastructure decisions (OQ-5 in PRD) — may need to stub this for MVP demo
- **Risk:** Platform subdomain routing requires DNS/server configuration beyond Drupal
- **Mitigation:** For investor demo, SSL and subdomain can be simulated on a pre-configured staging server

## Definition of Done
- [ ] All generated content is unpublished (draft) by default
- [ ] Anonymous users cannot access draft content
- [ ] Preview button opens site in new tab with draft content visible
- [ ] One-click publish makes all content live
- [ ] Published site accessible on platform subdomain
- [ ] HTTPS enabled for platform subdomains
- [ ] Trial expiry emails sent at 4-day and 1-day marks
- [ ] Expired sites taken offline (content preserved)
- [ ] Incomplete onboarding resumes on login
- [ ] Playwright: publish flow, trial expiry flow
- [ ] All code committed

## Sprint Deliverable
**Complete end-to-end flow**: Register → Onboard → Generate → Edit → Publish → Live site. Trial management handles lifecycle. **Full MVP demo-able for investors.**
