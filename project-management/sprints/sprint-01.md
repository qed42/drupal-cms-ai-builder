# Sprint 01: Next.js Platform Foundation

**Milestone:** M1 — Platform Foundation
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Stand up the Next.js platform app with authentication, database, and the onboarding wizard framework — the foundation for the entire user-facing experience.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-100 | Next.js App Scaffold + DB Schema | Foundation | Next.js | Done |
| TASK-101 | Authentication System (NextAuth) | US-001 | Next.js | Done |
| TASK-102 | Onboarding Wizard Framework | US-005–009 | Next.js | Done |
| TASK-103 | Wizard Screens 1–3 (Name, Idea, Audience) | US-005, US-008 | Next.js | Done |

## Dependencies & Risks
- **Sequential dependency chain:** 100 → 101 → 102 → 103
- **Risk:** Next.js 15 App Router + NextAuth v5 may have integration quirks — allocate time for debugging
- **Risk:** PostgreSQL setup — ensure Docker Compose or local Postgres available

## Deliverable
User can register, log in, and complete the first 3 onboarding screens (project name, big idea, audience) with data persisting to the platform database.

## Definition of Done
- [x] Next.js app runs locally with PostgreSQL
- [x] User registration and login working
- [x] Onboarding wizard navigates through screens 1–3
- [x] Data persists across page refreshes (save/resume)
- [x] Dark gradient UI matches Figma designs
- [ ] Playwright tests for auth flow and wizard navigation
- [ ] Code committed
