# TASK-505: Enhance Phase — Image Replacement in JSX Components

**Story:** Code Components Initiative
**Priority:** P1
**Effort:** M
**Milestone:** M26 — Code Component Generation

## Description

Modify the Enhance phase to handle Code Components. Instead of matching SDC image props, parse JSX for image placeholders and replace with stock photo URLs.

## Technical Approach

- Detect generation mode from blueprint payload
- For Code Components: parse JSX strings for image prop defaults (placeholder URLs)
- Extract context from surrounding JSX (alt text, component name, section type)
- Match images via existing stock photo API (Pexels/Unsplash)
- Replace placeholder values in the compiled Code Component config YAML
- Update image prop default values in component.yml definitions

## Acceptance Criteria

- [ ] SDC enhance path unchanged (no regression)
- [ ] Code Component JSX placeholders replaced with real image URLs
- [ ] Image context extraction produces relevant search queries
- [ ] Component config YAML updated with real image URLs

## Dependencies
- TASK-504

## Files to Modify

- `platform-app/src/lib/pipeline/phases/enhance.ts`
