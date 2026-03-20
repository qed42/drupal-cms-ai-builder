# TASK-327: Align color palette generation with Space DS theme settings keys

**Priority:** P0
**Estimated Effort:** M
**Milestone:** M15 — Space DS v2 Theme Migration

## Description

The AI-generated color palette must use the exact color token names defined in `space_ds.settings.yml`. Currently the onboarding/brand token flow uses generic keys (e.g., `brand`, `primary`, `secondary`) which are then mapped via `BrandTokenService::COLOR_MAP`. This mapping is fragile and incomplete — particularly for the 10 background colors.

The color palette should be generated using Space DS's native token names directly, eliminating the mapping layer and ensuring all 24 configurable colors are accounted for.

## Space DS Settings Color Tokens (ground truth)

From `drupal-site/web/themes/contrib/space_ds/config/install/space_ds.settings.yml`:

| Setting Key | Default | Purpose |
|-------------|---------|---------|
| `base_brand_color` | #cbddbb | Primary brand color |
| `accent_color_primary` | #658844 | Primary accent / CTA color |
| `accent_color_secondary` | #ffffff | Secondary accent color |
| `neutral_color` | #192211 | Body text / neutral color |
| `heading_color` | #2f3941 | Heading text color |
| `border_color` | #ebe6e7 | Border color |
| `gray_color` | #efefef | Gray backgrounds/accents |
| `success_color` | #dcfce7 | Success state |
| `danger_color` | #ffe2e2 | Danger/error state |
| `warning_color` | #fef9c2 | Warning state |
| `info_color` | #dbeafe | Info state |
| `background_color_1` | #ffffff | Background option 1 (white) |
| `background_color_2` | #f8f9fa | Background option 2 (light gray) |
| `background_color_3` | #e2e6ea | Background option 3 |
| `background_color_4` | #ced4da | Background option 4 |
| `background_color_5` | #adb5bd | Background option 5 |
| `background_color_6` | #6c757d | Background option 6 |
| `background_color_7` | #343a40 | Background option 7 (dark) |
| `background_color_8` | #007bff | Background option 8 (blue accent) |
| `background_color_9` | #f6f9f2 | Background option 9 (brand tint) |
| `background_color_10` | #dc3545 | Background option 10 (red accent) |
| `base_font_size` | 18 | Base font size in px |
| `font_family` | Geist | Primary font family |

## Technical Approach

### 1. Update AI color palette prompt
The AI should generate colors using Space DS token names directly:
- `base_brand_color` — derived from brand identity
- `accent_color_primary` — CTA/accent color
- `accent_color_secondary` — secondary UI color
- `neutral_color` — body text
- `heading_color` — heading text
- `background_color_1` through `background_color_10` — derived from brand palette
- State colors (success, danger, warning, info) can keep theme defaults

### 2. Update BrandTokenService
- Remove the COLOR_MAP indirection
- Accept tokens using Space DS key names directly
- Write to `space_ds.settings` config without translation
- Keep font_family and base_font_size mapping

### 3. Update onboarding color picker (if applicable)
- Ensure color picker output matches Space DS key names
- Or keep simple picker and auto-derive the full palette from a few base colors

## Acceptance Criteria

- [ ] Generated color palette uses Space DS setting key names
- [ ] All 24 settings written correctly to `space_ds.settings` config
- [ ] Background colors 1-10 derived from brand palette (harmonious)
- [ ] State colors (success/danger/warning/info) use sensible defaults
- [ ] BrandTokenService writes tokens without key translation
- [ ] Theme CSS variables (--sds-*) render correct colors on site

## Dependencies
- TASK-315 (BrandTokenService v2 — done)

## Files Affected
- `platform-app/src/lib/ai/prompts/` (color generation)
- `platform-app/src/lib/blueprint/generator.ts` (color palette assembly)
- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BrandTokenService.php`
