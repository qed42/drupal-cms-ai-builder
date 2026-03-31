# TASK-521: PreviewToolbar component (viewport + zoom)

**Story:** US-114
**Priority:** P1
**Estimate:** M
**Status:** To Do

## Description

Create the responsive preview toolbar that lets users switch between viewport sizes and control zoom level.

### Deliverables

1. **`platform-app/src/app/onboarding/review/components/PreviewToolbar.tsx`** — Component:
   - Viewport switcher buttons: Desktop (100%), Tablet (768px), Mobile (375px)
   - Active viewport visually highlighted
   - Zoom controls: 75%, 100%, 125% with dropdown or buttons
   - Device frame border around iframe that adjusts with viewport
   - Viewport and zoom state managed via props (lifted to parent)
   - Clean, minimal UI consistent with existing onboarding design

2. **Integration** — Wire into review page:
   - Toolbar sits above the LivePreviewFrame
   - Viewport changes resize the iframe container (not the iframe content — iframe scales via CSS transform for zoom)
   - State persists across page navigation within the review session (React state, not localStorage)

3. **Tests**:
   - Toolbar renders all three viewport options
   - Active viewport is highlighted
   - Zoom changes apply correct CSS transform
   - Viewport state persists on re-render

## Dependencies

- TASK-517 (LivePreviewFrame — needs viewport prop support)

## Acceptance Criteria

- [ ] Three viewport sizes: Desktop, Tablet (768px), Mobile (375px)
- [ ] Active viewport visually distinguished
- [ ] Zoom controls at 75%, 100%, 125%
- [ ] Tailwind responsive breakpoints respond correctly to viewport width changes
- [ ] Viewport state persists across page navigation
- [ ] Tests pass
