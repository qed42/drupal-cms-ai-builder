# TASK-115: Brand Token Service (v2)

**Story:** US-016 (Brand Token Application)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Blueprint & Provisioning

## Description
Refactor `BrandTokenService` to read from `tokens.json` (blueprint format) instead of SiteProfile entity. Generates CSS custom properties and configures the Space theme.

## Technical Approach
- **`generateTokenCss(string $tokensPath): string`**
  - Reads tokens.json: `{ colors: { primary, secondary, accent, ... }, fonts: { heading, body }, logo, custom_fonts }`
  - Generates CSS:
    ```css
    @import url('https://fonts.googleapis.com/css2?family=...');
    :root {
      --space-color-primary: #2563eb;
      --space-color-secondary: #1e40af;
      --space-color-accent: #f59e0b;
      --space-font-heading: 'Nunito Sans', sans-serif;
      --space-font-body: 'Open Sans', sans-serif;
    }
    ```
  - For custom fonts: generates `@font-face` declarations

- **`applyTokens(string $tokensPath): void`**
  - Calls `generateTokenCss()` and writes to `public://css/brand-tokens.css`
  - Copies logo file to `public://logo.png`
  - Sets logo path in theme settings
  - Copies custom font files to `public://fonts/`

- **`hook_page_attachments`**
  - Attaches `public://css/brand-tokens.css` to every page
  - Simple: if file exists, attach it

## Acceptance Criteria
- [ ] Reads tokens.json and generates valid CSS
- [ ] Google Fonts import URL correctly constructed
- [ ] Custom font @font-face declarations generated when custom_fonts present
- [ ] CSS file written to public://css/brand-tokens.css
- [ ] CSS attached to every page via hook_page_attachments
- [ ] Logo copied and set as site logo
- [ ] Works with multisite (each site has own public:// directory)

## Dependencies
- None (standalone service)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Service/BrandTokenService.php`
- `web/modules/custom/ai_site_builder/src/Service/BrandTokenServiceInterface.php`
- `web/modules/custom/ai_site_builder/ai_site_builder.module` (hook_page_attachments)
