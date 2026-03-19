# Sprint 14: AI Regeneration & Review Enhancements

**Milestone:** M8 — Content Review & Editing
**Duration:** 1 week

## Sprint Goal
Add per-section and per-page AI regeneration, page add/remove, version comparison, and download options to the review page.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-233 | Per-Section AI Regeneration | US-048 | L | Not Started |
| TASK-234 | Per-Page Regeneration | US-049 | M | Not Started |
| TASK-235 | Page Add/Remove from Review | US-050 | M | Not Started |
| TASK-237 | Version Comparison Diff View | US-051 | M | Not Started |
| TASK-239 | Download Menu | US-053 | M | Not Started |
| TASK-221 | Phase Retry & Re-run | US-045 | M | Not Started |

## Dependencies & Risks
- Requires Sprint 13 complete (review page with editing)
- TASK-233 → TASK-234 (section regen before page regen)
- TASK-237 depends on TASK-236 (version preservation from Sprint 13)
- TASK-221 (phase re-run) is M7 but deferred here as P1
- Risk: Regeneration must maintain consistency with original research brief/plan
- Risk: Adding/removing pages must update sidebar and blueprint atomically

## Definition of Done
- [ ] "Regenerate" button on each section with optional guidance input
- [ ] Section regeneration completes within 15 seconds
- [ ] "Undo" restores previous version after regeneration
- [ ] Page regeneration rebuilds entire page from brief/plan
- [ ] Add page generates new content consistent with existing site
- [ ] Remove page prompts confirmation and updates blueprint
- [ ] Version diff shows additions (green) and removals (red)
- [ ] Download menu offers JSON and Markdown ZIP
- [ ] Phase re-run available on completed pipeline phases
- [ ] All code committed
