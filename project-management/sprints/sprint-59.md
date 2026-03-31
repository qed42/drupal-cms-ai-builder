# Sprint 59: Interactive Preview & Live Editing

**Milestone:** M28 — Live Blueprint Preview
**Duration:** 5 days

## Sprint Goal

Make the live preview interactive — users can resize viewport, click sections to edit props, regenerate individual sections with immediate visual feedback, and undo regenerations.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-521 | PreviewToolbar (viewport + zoom controls) | US-114 | M | TASK-517 | To Do |
| TASK-522 | Section click handlers + postMessage protocol | US-115 | M | TASK-517, TASK-519 | To Do |
| TASK-523 | EditPanel slide-over component | US-115 | L | TASK-522 | To Do |
| TASK-524 | Live section regeneration with undo | US-116 | L | TASK-522, TASK-523 | To Do |

## Execution Order

```
Wave 1 (parallel): TASK-521, TASK-522
  - TASK-521: PreviewToolbar — depends only on TASK-517 (from Sprint 58)
  - TASK-522: Section click/postMessage — depends on TASK-517 + TASK-519 (from Sprint 58)

Wave 2: TASK-523
  - EditPanel — depends on TASK-522 for postMessage protocol to send prop updates

Wave 3: TASK-524
  - Live regeneration + undo — depends on TASK-522 (postMessage) + TASK-523 (EditPanel regenerate button)
```

## User Stories Covered

| Story | Title | Priority | Coverage |
|-------|-------|----------|----------|
| US-114 | Responsive Preview Toolbar | P1 | Full |
| US-115 | Section Click-to-Edit | P0 | Full |
| US-116 | Live Regeneration with Visual Diff | P1 | Full |

## Dependencies & Risks

- **Sprint 58 must be complete** — all tasks depend on LivePreviewFrame (TASK-517) and security utilities (TASK-519) from Sprint 58
- **postMessage race conditions** — message queue with sequence numbers mitigates this (implemented in TASK-522)
- **Prop editor complexity** — dynamic form generation for all prop types (string, text, integer, boolean, list:text, enum, url) needs careful implementation
- **Regeneration API latency** — AI regeneration takes several seconds; loading overlay keeps users informed
- **Undo stack depth** — 1-deep undo is intentionally simple. Deeper undo is out of scope for M28.

## Definition of Done

- [ ] Viewport switcher: Desktop, Tablet (768px), Mobile (375px) all functional
- [ ] Active viewport visually distinguished
- [ ] Zoom controls at 75%, 100%, 125%
- [ ] Viewport state persists across page navigation within review session
- [ ] Clicking section in preview opens EditPanel with correct props
- [ ] All prop types render appropriate form controls
- [ ] Prop changes debounced at 150ms and live-update in preview
- [ ] "Regenerate Section" triggers API call with optional guidance text
- [ ] New section renders immediately in preview after regeneration (no page reload)
- [ ] "View Code" shows syntax-highlighted JSX (code_components only)
- [ ] "Undo" restores previous section in both preview and server
- [ ] Loading overlay shown during regeneration
- [ ] Auto-save prop changes to server
- [ ] All new tests pass
- [ ] All existing platform-app tests pass (no regression)
- [ ] No TypeScript compilation errors
