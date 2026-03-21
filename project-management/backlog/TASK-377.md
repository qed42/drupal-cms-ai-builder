# TASK-377: CivicTheme Header, Footer & Hero Tree Builders

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
Implement `buildHeaderTree()`, `buildFooterTree()`, and `buildHeroSection()` for CivicTheme.

## Technical Approach

### Header (`civictheme:header`)
- CivicTheme header is a complex organism with navigation, search, and mobile menu
- Props: theme (light/dark), logo variants
- Slots: primary_navigation, secondary_navigation, etc.
- Build: populate logo, primary navigation links, CTA in secondary navigation

### Footer (`civictheme:footer`)
- Multi-column footer with acknowledgment, social links, copyright
- Props: theme, acknowledgment text
- Slots: columns (nav link groups), social_links, copyright
- Build: brand info, link columns, legal links, copyright

### Heroes (2 variants)
- `civictheme:banner` — Full-width banner with background image, title, subtitle, breadcrumb, CTA
- `civictheme:campaign` — Rich hero with video support, larger typography, background options
- Select variant based on page type (campaign for landing pages, banner for others)

## Acceptance Criteria
- [ ] `buildHeaderTree()` produces valid `civictheme:header` with navigation
- [ ] `buildFooterTree()` produces valid `civictheme:footer` with columns and legal links
- [ ] `buildHeroSection()` handles both banner and campaign variants
- [ ] Each tree uses correct CivicTheme slot structure
- [ ] Unit tests for each builder

## Dependencies
- TASK-375 (CivicTheme manifest and role map)

## Files/Modules Affected
- `packages/ds-civictheme/src/tree-builders.ts` (new)
