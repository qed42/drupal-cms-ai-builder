# TASK-391: Fix optional enum props defaulting to first value (background=primary)

**Story:** Hardening Sprint — Mercury DS Grounding
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M19 — Design System Abstraction
**Status:** COMPLETE

## Description
buildRequiredPropDefaults was setting optional enum props like background/background_color to first enum value ("primary"), causing unintended colored backgrounds on logo cards and groups. Now only required enum props get auto-defaulted. Also removed explicit background:"none" from footer brand group (invalid enum value was replaced with "primary").

## Commits
- 0ebafb7 — fix: optional enum props defaulting to first value

## Files Modified
- packages/ds-mercury/src/tree-builders.ts
