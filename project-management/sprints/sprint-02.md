# Sprint 02: Onboarding Journey — AI & Brand

**Milestone:** M2 — Onboarding Journey
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Complete the full onboarding wizard with AI-powered industry inference, page suggestion, color extraction, and brand/font selection — user goes from "Start Building" to "Visualize my site".

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-104 | AI Industry Inference & Page Suggestion | US-006, US-009 | Next.js | Done |
| TASK-105 | Screen 4 — Page Map (AI-suggested) | US-009 | Next.js | Done |
| TASK-106 | Screen 5 — Design Source Selection | US-007 | Next.js | Done |
| TASK-107 | Screen 6 — Brand Assets + Color Extraction | US-007 | Next.js | Done |
| TASK-108 | Screen 7 — Font Selection | US-007 | Next.js | Done |

## Dependencies & Risks
- **Dependency:** TASK-103 (Sprint 01) must be complete — provides idea + audience data for AI
- **TASK-104 → TASK-105:** Page suggestion feeds the page map screen
- **TASK-107 → TASK-108:** Color extraction feeds font preview tiles
- **TASK-106 independent:** Can be built in parallel with 104-105
- **Risk:** OpenAI API integration — ensure API keys configured, handle rate limits
- **Risk:** Color extraction from images — node-vibrant for logos, Vision API for complex files. Two code paths.

## Deliverable
Complete onboarding flow from registration through all 7 screens. AI infers industry, suggests pages, extracts brand colors. User clicks "Visualize my site" to trigger blueprint generation (Sprint 03).

## Definition of Done
- [ ] All 7 wizard screens functional and styled per Figma
- [ ] AI industry inference returns valid results
- [ ] AI page suggestion generates appropriate pages per industry
- [ ] Color extraction works for PNG/JPG logos
- [ ] Font selection updates preview tiles
- [ ] "Visualize my site" button saves all data and marks onboarding complete
- [ ] Playwright tests for AI-powered screens
- [ ] Code committed
