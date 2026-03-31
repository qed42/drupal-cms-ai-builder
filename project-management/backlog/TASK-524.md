# TASK-524: Live section regeneration with undo

**Story:** US-116
**Priority:** P1
**Estimate:** L
**Status:** To Do

## Description

Implement the live regeneration flow: when a user regenerates a section, the new version renders immediately in the preview with an undo option to restore the previous version.

### Deliverables

1. **Regeneration flow** (in EditPanel + LivePreviewFrame):
   - Loading overlay on the regenerating section in iframe (semi-transparent with spinner)
   - API call to `POST /api/blueprint/{siteId}/regenerate-section` with `{ pageIndex, sectionIndex, guidance? }`
   - On success:
     - For code_components: new JSX transpiled inside iframe and rendered within 200ms
     - For design_system: new component_id and props update the approximate renderer
   - New section renders immediately without full page reload

2. **Undo mechanism**:
   - Store previous section state (props, JSX, component_id) before regeneration
   - "Undo" button appears in EditPanel after regeneration
   - Clicking Undo:
     - Restores previous section in iframe preview (via replace-section postMessage)
     - Restores previous section in server blueprint (API call)
   - Undo stack is 1 deep (only the most recent regeneration can be undone)

3. **API modification** — Update `platform-app/src/app/api/blueprint/[siteId]/regenerate-section/route.ts`:
   - Return `previousSection` alongside `section` in response (if not already)
   - For code_components: include updated `_codeComponents.configs` in response

4. **Tests**:
   - Regeneration shows loading overlay
   - New section renders in preview after API response
   - Undo restores previous section in preview
   - Undo restores previous section on server
   - Loading state clears on error

## Dependencies

- TASK-522 (postMessage protocol)
- TASK-523 (EditPanel regenerate button)

## Acceptance Criteria

- [ ] Loading overlay shown during regeneration
- [ ] New section renders immediately in preview (no page reload)
- [ ] Code components: new JSX transpiled and rendered within 200ms
- [ ] SDC: new component_id and props update approximate renderer
- [ ] "Undo" button appears after regeneration
- [ ] Undo restores previous section in both preview and server
- [ ] Loading state clears on error with user-friendly message
- [ ] Tests pass
