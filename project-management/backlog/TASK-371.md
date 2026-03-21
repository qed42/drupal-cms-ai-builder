# TASK-371: Mercury Header, Footer & Hero Tree Builders

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
Implement `buildHeaderTree()`, `buildFooterTree()`, and `buildHeroSection()` for Mercury. These use Mercury-specific components with their own slot structures.

## Technical Approach

### Header (`mercury:navbar`)
- 3 slots: `logo` (image), `navigation` (links), `links` (CTA buttons)
- Props: none significant
- Build: logo in logo slot, nav links as `mercury:button` items in navigation slot, CTA buttons in links slot

### Footer (`mercury:footer`)
- 4 slots: `branding` (logo + description), `cta_slot` (newsletter/CTA), `utility_links` (legal links), `copyright`
- Build: branding info + logo, CTA if provided, legal links, copyright text

### Heroes (3 variants)
- `mercury:hero-billboard` — full-screen with background image, slot for content (heading, text, buttons)
- `mercury:hero-side-by-side` — two-column hero with image + content slot
- `mercury:hero-blog` — blog post hero with props (heading, date, author, image), no slots
- Select variant based on `variant` parameter from page design rules

## Acceptance Criteria
- [ ] `buildHeaderTree()` produces valid `mercury:navbar` with populated slots
- [ ] `buildFooterTree()` produces valid `mercury:footer` with populated slots
- [ ] `buildHeroSection()` handles all 3 Mercury hero variants
- [ ] Each tree is a valid CanvasItem with correct component IDs and version hashes
- [ ] Unit tests for each builder

## Dependencies
- TASK-369 (Mercury manifest and role map)

## Files/Modules Affected
- `packages/ds-mercury/src/tree-builders.ts` (new)
