# TASK-379: CivicTheme Brand Tokens with SCSS Build Step

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
Implement `prepareBrandPayload()` for CivicTheme. CivicTheme uses SCSS variables compiled to CSS custom properties. Brand customization requires generating `_variables.base.scss` and running `npm install && npm run build` in the sub-theme directory.

## Technical Approach
1. Create `packages/ds-civictheme/src/brand-tokens.ts`
2. Map onboarding brand tokens to CivicTheme SCSS variables:
   ```scss
   $ct-colors-brands: (
     'light': (
       'brand1': #{primary},
       'brand2': #{secondary},
       'brand3': #{accent}
     ),
     'dark': (
       'brand1': #{primaryLight},
       'brand2': #{secondaryDark},
       'brand3': #{accentDark}
     )
   );
   ```
3. Auto-derive light/dark variants from primary colors (±15% lightness)
4. Map font tokens to CivicTheme font SCSS maps
5. Generate the full `_variables.base.scss` content
6. Return `BrandPayload` of type `scss-file`:
   ```typescript
   {
     type: 'scss-file',
     path: 'web/themes/custom/civictheme_starter/components/_variables.base.scss',
     content: generatedScssContent,
     requiresBuild: true
   }
   ```
7. Provisioning engine must:
   - Write the SCSS file
   - Run `npm install` in the sub-theme directory (first time)
   - Run `npm run build` to compile SCSS → CSS
   - Clear Drupal cache

## Acceptance Criteria
- [ ] `prepareBrandPayload()` generates valid SCSS with brand color maps
- [ ] Light and dark variants auto-derived from brand colors
- [ ] Font family correctly mapped to CivicTheme's font system
- [ ] SCSS compiles without errors when placed in CivicTheme starter kit
- [ ] Provisioning engine correctly handles `scss-file` payload type
- [ ] Brand colors visible on rendered CivicTheme site after build

## Dependencies
- TASK-375 (CivicTheme manifest)
- TASK-368 (provisioning supports scss-file payload type)

## Files/Modules Affected
- `packages/ds-civictheme/src/brand-tokens.ts` (new)
- `provisioning/src/steps/09-apply-brand.ts` (already updated in TASK-368)
