# TASK-022: Section-Level AI Regeneration

**Story:** US-021
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M3 — Site Editing & Refinement

## Description
Add "Regenerate with AI" functionality to the Canvas editor that allows users to regenerate a specific section/component with optional guidance.

## Technical Approach
- Add custom JavaScript behavior to Canvas editor that injects a "Regenerate with AI" button into the component action toolbar
- On click: show a modal/dialog with a textarea for optional guidance (e.g., "Make it more detailed")
- AJAX endpoint: `/site/regenerate/{node_id}/{component_instance_id}`
- Backend: invoke ContentGeneratorAgent with:
  - Component context (what component, current content)
  - User guidance text
  - Original SiteProfile context (business info, tone)
- Agent updates component props via `canvas_set_component_props` tool
- Return updated component HTML for live preview in Canvas
- Store previous state for "Undo" capability (use Drupal node revisions)

## Acceptance Criteria
- [ ] "Regenerate with AI" button appears on component selection in Canvas
- [ ] Modal accepts optional user guidance text
- [ ] Regeneration updates only the selected component
- [ ] Surrounding content is untouched
- [ ] User can undo regeneration via revision revert
- [ ] Regeneration completes within 5 seconds
- [ ] Error handling for failed regeneration (show error, keep original)

## Dependencies
- TASK-021 (Canvas editor config)
- TASK-018 (Content Generator Agent — reused for regeneration)

## Files/Modules Affected
- `ai_site_builder/js/canvas-regenerate.js`
- `ai_site_builder/src/Controller/RegenerateController.php`
- `ai_site_builder/ai_site_builder.routing.yml`
- `ai_site_builder/ai_site_builder.libraries.yml`
