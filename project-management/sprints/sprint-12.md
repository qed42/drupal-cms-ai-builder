# Sprint 12: Content Pipeline — Generate Phase & Orchestrator

**Milestone:** M7 — AI Content Pipeline
**Duration:** 1 week

## Sprint Goal
Implement per-page content generation, the pipeline orchestrator, and the phase visibility UI — completing the full Research → Plan → Generate pipeline.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-217 | Per-Page Content Generation | US-041 | XL | Not Started |
| TASK-218 | Pipeline Orchestrator | US-039/040/041 | L | Not Started |
| TASK-220 | Pipeline Phase Visibility UI | US-042 | L | Not Started |

## Dependencies & Risks
- Requires Sprint 11 complete (Research + Plan phases)
- TASK-217 is the heaviest task — per-page prompts must produce 150-300 word sections
- TASK-218 wires everything together: Research → Plan → Generate → site status "review"
- TASK-220 replaces the current single-spinner progress page
- Risk: Per-page generation quality varies — expect significant prompt tuning
- Risk: Total generation time for 6 pages must stay under 120 seconds (NFR-03)
- Risk: Component tree building from richer content may surface new edge cases

## Definition of Done
- [ ] Per-page generation produces 150-300 word service descriptions, 300-500 word about pages
- [ ] Total site content is 2,000+ words for a 6-page site
- [ ] Pipeline orchestrator runs all 3 phases sequentially with status tracking
- [ ] Site transitions to "review" status after generation (not "provisioning")
- [ ] Phase visibility UI shows Research → Plan → Generate with real-time progress
- [ ] Per-page progress visible during Generate phase
- [ ] v1 `generateBlueprint()` still works for backward compatibility
- [ ] Playwright test covers full pipeline execution
- [ ] All code committed
