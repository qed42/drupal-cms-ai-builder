# Sprint 13: Content Review Page & Inline Editing

**Milestone:** M8 — Content Review & Editing
**Duration:** 1 week

## Sprint Goal
Build the content review page with markdown preview, inline text editing, and the approve-to-provision flow.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-230 | Blueprint-to-Markdown Renderer | US-046 | M | Not Started |
| TASK-231 | Review Page Layout | US-046 | L | Not Started |
| TASK-232 | Inline Section Editor | US-047 | L | Not Started |
| TASK-236 | Original Version Preservation | US-051 | M | Not Started |
| TASK-238 | Approve & Provision Flow | US-052 | M | Not Started |

## Dependencies & Risks
- Requires Sprint 12 complete (pipeline generates blueprints with site status "review")
- TASK-230 → TASK-231 (renderer before page layout)
- TASK-231 → TASK-232 (page layout before editor)
- TASK-232 → TASK-236 (edits trigger version preservation)
- TASK-238 can be developed in parallel with TASK-232
- Risk: Review page is the centerpiece of v2 — UX quality matters significantly
- Risk: Auto-save with debounce must handle rapid edits without data loss

## Definition of Done
- [ ] Review page renders all blueprint pages as formatted markdown with component labels
- [ ] Sidebar navigation lists all pages with click-to-navigate
- [ ] Inline editor switches sections between read-only and editable textarea
- [ ] Auto-save works with 500ms debounce
- [ ] Original blueprint preserved on first edit
- [ ] "Approve & Build Site" button tracks page views and triggers provisioning
- [ ] Review page loads within 2 seconds
- [ ] All code committed
