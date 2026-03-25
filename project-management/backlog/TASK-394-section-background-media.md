# TASK-394: Skip background_media on mercury:section components

**Story:** Hardening Sprint — Mercury DS Grounding
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction
**Status:** COMPLETE

## Description
createItem() now deletes background_media on mercury:section instead of filling with placeholder image. Added prompt guidance to not populate background_media on sections.

## Commits
- 07f4fb5 — fix: Canvas assertion error on failed image refs and Mercury grounding rules

## Files Modified
- packages/ds-mercury/src/tree-builders.ts
- packages/ds-mercury/src/prompt-fragments.ts
