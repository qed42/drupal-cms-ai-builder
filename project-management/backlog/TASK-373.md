# TASK-373: Mercury Brand Token Application

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
Implement `prepareBrandPayload()` for Mercury. Mercury uses a `theme.css` file with CSS custom properties in OKLCH color space. Brand tokens from onboarding need to be converted to OKLCH values and written into the correct CSS custom property format.

## Technical Approach
1. Create `packages/ds-mercury/src/brand-tokens.ts`
2. Implement hex-to-OKLCH color conversion (or use a library like `culori`)
3. Map onboarding brand tokens to Mercury CSS variables:
   - `primary` → `--primary` + `--primary-foreground`
   - `secondary` → `--secondary` + `--secondary-foreground`
   - `accent` → `--accent` + `--accent-foreground`
   - `neutral` → `--muted` + `--muted-foreground`
   - `background` → `--background` + `--foreground`
   - Auto-derive `--card`, `--border`, `--input` from primary/neutral
4. Generate foreground colors automatically (light/dark contrast)
5. Map font tokens to `--font-sans` and `--font-serif`
6. Return `BrandPayload` of type `css-file`:
   ```typescript
   {
     type: 'css-file',
     path: 'theme.css',  // Relative to web root
     content: generatedCssContent
   }
   ```
7. Provisioning engine writes this file next to `index.php`

## Acceptance Criteria
- [ ] `prepareBrandPayload()` returns valid CSS custom properties
- [ ] Colors correctly converted to OKLCH
- [ ] Foreground colors have sufficient contrast against backgrounds
- [ ] Dark mode variables generated alongside light mode
- [ ] Font family correctly mapped
- [ ] Generated CSS is valid and parseable

## Dependencies
- TASK-369 (Mercury manifest)

## Files/Modules Affected
- `packages/ds-mercury/src/brand-tokens.ts` (new)
