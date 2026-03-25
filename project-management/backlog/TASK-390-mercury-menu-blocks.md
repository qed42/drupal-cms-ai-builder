# TASK-390: Add Canvas menu block components to Mercury header/footer

**Story:** Hardening Sprint — Mercury DS Grounding
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M19 — Design System Abstraction
**Status:** COMPLETE

## Description
Added block.system_menu_block.main to navbar navigation slot and block.system_menu_block.footer to footer utility slot. Created createBlockItem() helper for block components. Updated versions.ts with block IDs. Fixed depth validation (null to 1). Removed section wrapper from header — navbar is root element. Fixed BlueprintImportService to omit null parent_uuid/slot keys.

## Commits
- 07f4fb5 — fix: Canvas assertion error on failed image refs and Mercury grounding rules
- c1d0b07 — feat: component tree grounding rules and prod Docker support
- 128fcac — fix: restructure Mercury header/footer to match Canvas global region layout
- 1398e0b — fix: Mercury header/footer grounding rules and broken placeholder image

## Files Modified
- packages/ds-mercury/src/tree-builders.ts
- packages/ds-mercury/src/versions.ts
- drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php
