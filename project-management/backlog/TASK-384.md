# TASK-384: CivicTheme adapter — Restructure for Canvas compatibility

**Story:** M19 Design System Abstraction
**Priority:** Backlog (Deferred)
**Estimated Effort:** XL
**Milestone:** Multi-theme support

## Description

CivicTheme's SDC components are architecturally incompatible with Canvas's component registration system. 33 components use complex prop types (`image: {url, alt}`, `link: {text, url}`, `links: []`, `panels: []`) that Canvas has no field widget for. Canvas refuses to register these, causing 500 errors on page render.

The adapter must be restructured to compose pages using ONLY the ~22 Canvas-compatible atoms (heading, paragraph, button, content-link, image, basic-content, header, footer, etc.).

## Technical Approach

1. Rebuild `manifest.json` with only Canvas-registered components
2. Rewrite `tree-builders.ts` to compose pages from atoms in slots only
3. Update `composition-patterns.ts`, `role-map.ts`, `design-rules.ts`
4. End-to-end test: provision site, verify pages render without 500s

## Context

- Memory: `session_2026_03_23_civictheme_canvas_compat.md`
- Canvas discovery: `ComponentMetadataRequirementsChecker::check()` rejects complex prop shapes
- Mercury works because it uses `entity_reference` for images, primitive-only props
- Provisioning fixes (phased install, prerequisites) already done in `05-install-theme.ts`

## Dependencies
- None (standalone when resumed)
