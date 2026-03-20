# TASK-326: Update footer generation to use menu items for navigation links

**Priority:** P1
**Estimated Effort:** M
**Milestone:** M15 — Space DS v2 Theme Migration

## Description

Footer navigation should use Drupal menu items (same as header) rather than static links. The footer `columns` slot should render navigation columns derived from the main menu structure. Social media links should also be included in the footer via the `social_links` slot.

## Current State

TASK-317 implemented basic footer generation with:
- Brand props (name, slogan, description, copyright)
- Legal links (Privacy, Terms) via `footer_bottom_links` slot
- No navigation columns in `columns` slot
- No social media links in `social_links` slot

## Technical Approach

### Footer Navigation Columns
- `buildFooterTree()` should accept the page list and create navigation links in the `columns` slot (mirroring the header nav approach)
- Use `space-link` components in the `columns` slot, one per page

### Social Media Links
- Content generation prompt already generates `cta_text` but needs to also generate `social_media_links` array
- `buildFooterTree()` should create `space-link` components in the `social_links` slot with icon props for each platform
- Valid social platform icons (Phosphor): `twitter-logo`, `linkedin-logo`, `facebook-logo`, `instagram-logo`, `youtube-logo`

### BlueprintImportService
- Footer menu links should be created the same way as header — from the page list
- Social links stored as footer component tree children

## Acceptance Criteria

- [ ] Footer `columns` slot populated with navigation links from page list
- [ ] Footer `social_links` slot populated with social media links
- [ ] Social link icons use valid Phosphor icon names
- [ ] Footer renders navigation columns on the site
- [ ] Footer renders social media icons

## Dependencies
- TASK-317 (done — base footer generation)

## Files Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (update buildFooterTree)
- `platform-app/src/lib/ai/prompts/content-generation.ts` (add social_media_links)
- `platform-app/src/lib/blueprint/generator.ts` (pass page list to footer builder)
