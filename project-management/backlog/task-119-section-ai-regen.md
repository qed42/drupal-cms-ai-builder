# TASK-119: Section-Level AI Regeneration

**Story:** US-021 (Section-Level AI Regeneration)
**Priority:** P1
**Estimated Effort:** L
**Milestone:** M4 — Site Editing

## Description
Add a "Regenerate with AI" button to Canvas section toolbar. When clicked, the ContentGeneratorAgent regenerates that section's content based on optional user guidance.

## Technical Approach
- Add JavaScript behavior to Canvas editor that injects "Regenerate with AI" button to section toolbar
- Button click opens a small modal/popover:
  - Text input: "Any guidance for the AI?" (optional)
  - "Regenerate" button
- AJAX endpoint:
  - Route: `/api/regenerate/{node_id}/{section_id}`
  - Input: `{ guidance: string }`
  - Loads current section component + props
  - Invokes ContentGeneratorAgent with context: site name, industry (from blueprint metadata), current component, user guidance
  - Agent returns new props for the component
  - Updates component via Canvas API
  - Returns updated section HTML for live preview

- **ContentGeneratorAgent** (Drupal AI Agent plugin):
  - System prompt includes site context + component manifest
  - Receives current component props + user guidance
  - Returns updated props only (not full layout)

## Acceptance Criteria
- [ ] "Regenerate with AI" button appears on Canvas section toolbar
- [ ] Clicking opens guidance input modal
- [ ] Submitting regenerates section content via AI
- [ ] Updated content renders in Canvas preview
- [ ] User can provide optional guidance text
- [ ] Regeneration preserves component type and layout — only changes content/props
- [ ] Error handling for AI failures (show error message, keep original content)

## Dependencies
- TASK-118 (Canvas editor config)
- Canvas module's section toolbar extensibility

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Plugin/AiAgent/ContentGeneratorAgent.php`
- `web/modules/custom/ai_site_builder/src/Controller/RegenerateController.php`
- `web/modules/custom/ai_site_builder/ai_site_builder.routing.yml`
- `web/modules/custom/ai_site_builder/js/canvas-regenerate.js`
- `web/modules/custom/ai_site_builder/ai_site_builder.libraries.yml`
