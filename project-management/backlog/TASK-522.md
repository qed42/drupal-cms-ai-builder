# TASK-522: Section click handlers and postMessage protocol

**Story:** US-115
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Implement the bi-directional postMessage protocol between the iframe preview and the parent page, including section click/hover handlers inside the iframe and message handling in the parent.

### Deliverables

1. **Inside iframe (in buildPreviewHtml renderer script)**:
   - Each section wrapped in `<div data-section-index="N">`
   - Click handler: posts `{ type: "section-click", sectionIndex: N }` to parent
   - Hover handler: adds/removes visual outline on section (2px dashed border)
   - Active section highlight (solid border) when selected
   - Handle incoming messages from parent:
     - `update-props`: update component props and re-render specific section
     - `replace-section`: replace section JSX/component, re-transpile, re-render

2. **In LivePreviewFrame component** — extend postMessage handling:
   - Send `update-props` message when EditPanel changes a prop
   - Send `replace-section` message when regeneration completes
   - Message queue with sequence numbers to handle race conditions
   - Acknowledge pattern: iframe confirms receipt of updates

3. **Tests**:
   - Section click posts correct message
   - Parent message handler processes update-props
   - Parent message handler processes replace-section
   - Unknown message types are rejected (security)

## Dependencies

- TASK-517 (LivePreviewFrame)
- TASK-519 (postMessage validation)

## Acceptance Criteria

- [ ] Clicking section in iframe triggers section-click postMessage
- [ ] Hovering section shows visual outline
- [ ] Active (selected) section has distinct visual indicator
- [ ] Parent can send prop updates that re-render specific sections
- [ ] Parent can replace section content (for regeneration)
- [ ] postMessage types validated against whitelist
- [ ] Tests pass
