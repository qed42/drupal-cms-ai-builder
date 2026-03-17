# TASK-019: Brand Token Service

**Story:** US-016
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — AI Site Generation Engine

## Description
Create `BrandTokenService` that generates CSS custom property overrides from SiteProfile brand data and attaches them to the site.

## Technical Approach
- `generateTokenCss(SiteProfile)`: generate CSS file content:
  ```css
  :root {
    --space-color-primary: {color_primary};
    --space-color-secondary: {color_secondary};
    --space-color-accent: {color_accent};
    --space-font-heading: '{font_heading}', sans-serif;
    --space-font-body: '{font_body}', sans-serif;
  }
  ```
- Map Space theme's CSS custom property names from the actual theme source
- `applyTokens(SiteProfile)`:
  - Write CSS to `public://sites/{uuid}/brand-tokens.css`
  - Include Google Fonts `@import` if custom fonts selected
- Implement `hook_page_attachments` to attach the CSS file for the appropriate site
- Handle defaults: if no colors selected, use industry-aware defaults
- Ensure logo appears in site header via theme settings or block config

## Acceptance Criteria
- [ ] CSS file generated with correct custom property values
- [ ] CSS file written to per-site directory
- [ ] CSS attached to pages via hook_page_attachments
- [ ] Brand colors visibly apply to Space theme components
- [ ] Custom fonts load from Google Fonts
- [ ] Default palette works when no brand input provided
- [ ] Logo renders in site header

## Dependencies
- TASK-002 (SiteProfile entity — brand data source)
- Space theme uses CSS custom properties for theming

## Files/Modules Affected
- `ai_site_builder/src/Service/BrandTokenService.php`
- `ai_site_builder/src/Service/BrandTokenServiceInterface.php`
- `ai_site_builder/ai_site_builder.module` (hook_page_attachments)
- `ai_site_builder/ai_site_builder.services.yml`
