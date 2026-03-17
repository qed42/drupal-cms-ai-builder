# TASK-024: Component Swap

**Story:** US-024
**Priority:** P2
**Estimated Effort:** L
**Milestone:** M3 — Site Editing & Refinement

## Description
Allow site owners to swap one SDC component for another compatible component in the Canvas editor.

## Technical Approach
- Extend Canvas component toolbar with "Swap Component" action
- On click: show list of compatible components from the manifest
- Compatibility determined by: same category (e.g., hero ↔ hero-alt) or similar prop structure
- Build compatibility matrix in ComponentManifestService
- On swap: map existing props to new component's props (direct mapping for matching names)
- Highlight unmapped props for user to fill
- Use Canvas `canvas_remove_section` + `canvas_place_component` sequence

## Acceptance Criteria
- [ ] "Swap Component" action visible on component selection
- [ ] Only compatible alternatives shown
- [ ] Content mapped to new component where prop names match
- [ ] Unmapped fields highlighted for user input

## Dependencies
- TASK-021 (Canvas editor config)
- TASK-015 (Component Manifest — compatibility data)

## Files/Modules Affected
- `ai_site_builder/js/canvas-swap.js`
- `ai_site_builder/src/Controller/ComponentSwapController.php`
- `ai_site_builder/src/Service/ComponentManifestService.php` (add compatibility matrix)
