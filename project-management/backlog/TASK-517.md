# TASK-517: LivePreviewFrame React component

**Story:** US-111
**Priority:** P0
**Estimate:** L
**Status:** To Do

## Description

Create the main LivePreviewFrame component — the sandboxed iframe wrapper that renders the preview HTML and handles postMessage communication with the parent page.

### Deliverables

1. **`platform-app/src/app/onboarding/review/components/LivePreviewFrame.tsx`** — Component:
   - Props: `payload: PreviewPayload`, `onSectionClick: (index: number) => void`, `onReady: () => void`, `viewport: ViewportSize`
   - Calls `buildPreviewHtml(payload)` to generate srcdoc
   - Renders `<iframe sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc={html} />`
   - Sets up `postMessage` listener:
     - `section-click` → calls `onSectionClick`
     - `ready` → calls `onReady`
     - `error` → logs to console
   - Validates postMessage origin (must be `null` for srcdoc iframes)
   - Validates postMessage type against whitelist
   - Exposes `updateSectionProps(index, props)` and `replaceSection(index, section, jsx?, css?)` methods via ref
   - Rebuilds srcdoc when `payload` changes (page switch)
   - Applies viewport width based on `viewport` prop
   - Loading skeleton shown until `ready` message received

2. **Integrate into review page** — Modify `platform-app/src/app/onboarding/review/page.tsx`:
   - Add "Visual Preview" / "Data View" toggle (retain existing PagePreview for data view)
   - Default to "Visual Preview" when blueprint has code_components
   - Pass blueprint data as PreviewPayload to LivePreviewFrame
   - Wire `onSectionClick` to open EditPanel (placeholder for now, full implementation in TASK-525)

3. **Tests**:
   - Component renders iframe with correct sandbox attributes
   - postMessage handler processes section-click events
   - srcdoc rebuilds on payload change
   - Loading state shown before ready message

## Dependencies

- TASK-514 (types)
- TASK-516 (buildPreviewHtml)

## Acceptance Criteria

- [ ] iframe has `sandbox="allow-scripts"` and NO `allow-same-origin`
- [ ] srcdoc contains complete preview HTML
- [ ] postMessage listener validates message types against whitelist
- [ ] Loading skeleton shown until iframe posts "ready"
- [ ] Viewport width changes based on viewport prop
- [ ] Review page has toggle between Visual Preview and Data View
- [ ] No parent DOM, cookie, or storage access from iframe
- [ ] Tests pass
