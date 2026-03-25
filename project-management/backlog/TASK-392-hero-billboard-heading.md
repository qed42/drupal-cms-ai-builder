# TASK-392: Auto-inject h1 heading in hero billboard hero_slot

**Story:** Hardening Sprint — Mercury DS Grounding
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction
**Status:** COMPLETE

## Description
Hero billboard now auto-injects mercury:heading with level 1, text_size heading-responsive-8xl, text_color inverted when no heading child provided. Enforces overlay_opacity >= 40%. Fixed component-tree-builder to route hero sections to buildHeroSection instead of buildOrganismSection.

## Commits
- f8cba6d — feat: auto-inject h1 heading in hero billboard
- 4db5660 — fix: route hero sections to buildHeroSection

## Files Modified
- packages/ds-mercury/src/tree-builders.ts
- packages/ds-mercury/src/prompt-fragments.ts
- platform-app/src/lib/blueprint/component-tree-builder.ts
