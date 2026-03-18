# TASK-119: Section-Level AI Regeneration

**Story:** US-021 — AI-powered content regeneration
**Priority:** P1
**Sprint:** 06
**Workstream:** Drupal

## Description

Allow site owners to regenerate individual page sections using AI from within the Canvas editor. The user selects a section, clicks "Regenerate with AI", optionally provides guidance text, and the AI replaces the section content while preserving the component type and layout structure.

## Technical Approach

### 1. Canvas AI Integration
- Drupal CMS includes `canvas_ai` submodule (pre-installed via recipe)
- Investigate if `canvas_ai` already provides section-level regeneration UI
- If yes: configure and extend; if no: implement custom Canvas toolbar action

### 2. Custom Regeneration (if canvas_ai insufficient)
- Add a custom Canvas toolbar button: "Regenerate with AI"
- On click: show modal with optional guidance textarea + "Regenerate" button
- Call Drupal AI Agent API (or direct OpenAI via `ai` module) with:
  - Current section content (component type, existing text)
  - User guidance text
  - Site context (industry, tone, audience from blueprint)
- Replace section component inputs with AI-generated content
- Preserve component_id, version, and structural props

### 3. AI Prompt Engineering
- System prompt includes site metadata (industry, tone, audience)
- User prompt includes current content + guidance
- Response format: JSON matching Canvas component input schema
- Temperature: 0.5 (creative but consistent)

### 4. Content Preservation
- Only regenerate text/content fields, not structural props (layout, spacing, colors)
- Keep media references intact unless user explicitly requests new images
- Show "before" preview so user can revert (undo)

## Acceptance Criteria

- [ ] "Regenerate with AI" button appears on Canvas section toolbar
- [ ] User can provide optional guidance text for regeneration
- [ ] AI regeneration replaces section text content
- [ ] Component type and layout structure preserved after regeneration
- [ ] Site context (industry, tone) influences regeneration output
- [ ] User can undo/revert regeneration
- [ ] Works with all Space DS component types

## Dependencies

- TASK-118 (Sprint 05, Done): Canvas editor configured
- TASK-023 (Sprint 06): Pages must be manageable (contextually — regen depends on having editable pages)
- `canvas_ai` module investigation needed — may reduce scope significantly

## Effort

Large (L) — ~5 dev days (potentially less if `canvas_ai` provides the UI)

## Open Questions

1. Does `canvas_ai` already provide section-level regeneration? If so, this task becomes configuration + prompt tuning.
2. What AI model does `canvas_ai` use? Can we configure it to use the same OpenAI key?
3. Does Canvas support custom toolbar actions via plugins, or do we need core patches?
