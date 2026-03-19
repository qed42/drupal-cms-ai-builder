# Sprint 11: Content Pipeline — Research & Plan Phases

**Milestone:** M7 — AI Content Pipeline
**Duration:** 1 week

## Sprint Goal
Implement the Research and Plan phases of the content pipeline, producing structured research briefs and content plans stored in the database.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-215 | Research Phase Implementation | US-039 | L | Not Started |
| TASK-216 | Plan Phase Implementation | US-040 | L | Not Started |
| TASK-219 | Pipeline Phase Status API | US-042 | M | Not Started |

## Dependencies & Risks
- Requires Sprint 09 complete (provider abstraction, validation, Prisma models)
- Requires Sprint 10 complete (enhanced onboarding data feeds the research prompt)
- TASK-215 → TASK-216 (research brief feeds plan phase)
- TASK-219 depends on TASK-215 and TASK-216 (needs phase data to report)
- Risk: Research prompt quality is critical — expect 2-3 prompt iterations to get good output
- Risk: Plan phase must produce outlines the Generate phase can consume — define the interface carefully

## Definition of Done
- [ ] Research phase produces a valid ResearchBrief with industry terminology, compliance flags, and content themes
- [ ] Plan phase produces a valid ContentPlan with per-page outlines, SEO keywords, and word count targets
- [ ] Both phases complete within 15 seconds each
- [ ] Research briefs and content plans stored in database with versioning
- [ ] Status API returns phase-level progress (pending/in_progress/complete/failed)
- [ ] All code committed
