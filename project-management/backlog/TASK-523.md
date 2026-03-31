# TASK-523: EditPanel slide-over component

**Story:** US-115
**Priority:** P0
**Estimate:** L
**Status:** To Do

## Description

Create the slide-over edit panel that opens when a user clicks a section in the live preview. Supports prop editing, section regeneration, and code viewing.

### Deliverables

1. **`platform-app/src/app/onboarding/review/components/EditPanel.tsx`** — Component:
   - Slide-over panel from right side (overlays preview, does not push layout)
   - Section title and component type displayed in header
   - **Props editor**: dynamic form fields based on section prop types
     - `string` → text input
     - `text` → textarea
     - `integer` → number input
     - `boolean` → toggle
     - `list:text` → list editor (add/remove items)
     - `enum` → select dropdown
     - `url` → URL input with validation
   - **150ms debounce** on prop changes before sending to iframe via postMessage
   - **"Regenerate Section"** button:
     - Optional text input for guidance/instructions
     - Calls existing regenerate-section API endpoint
     - Shows loading spinner during regeneration
     - On success: sends new section to iframe via postMessage
   - **"View Code"** button (code_components mode only):
     - Shows syntax-highlighted JSX source in a code block
     - Read-only view
   - **Close button** to dismiss panel
   - Auto-save: prop changes saved to server via existing blueprint update mechanism

2. **Integration** — Wire into review page:
   - `onSectionClick` from LivePreviewFrame opens EditPanel with selected section
   - EditPanel receives current section data and blueprint context
   - Prop updates flow: EditPanel → parent state → postMessage to iframe

3. **Tests**:
   - Panel opens with correct section data
   - Prop changes are debounced at 150ms
   - Regenerate button triggers API call
   - Code view shows JSX source
   - Panel closes on close button click

## Dependencies

- TASK-522 (postMessage protocol for sending updates)
- TASK-517 (LivePreviewFrame onSectionClick callback)

## Acceptance Criteria

- [ ] Slide-over opens on section click with correct section data
- [ ] All prop types render appropriate form controls
- [ ] Prop changes debounced at 150ms and live-update in preview
- [ ] "Regenerate Section" triggers API call and updates preview
- [ ] "View Code" shows syntax-highlighted JSX (code_components only)
- [ ] Auto-save to server on prop changes
- [ ] Panel dismissible via close button
- [ ] Tests pass
