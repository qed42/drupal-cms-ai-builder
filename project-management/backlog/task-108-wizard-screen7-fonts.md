# TASK-108: Wizard Screen 7 — Font Selection

**Story:** US-007 (Brand Input)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — Onboarding Journey

## Description
Implement Screen 9 from Figma: "Select a font" — font preview tiles using the user's extracted colors as backgrounds, font dropdown, and custom font upload.

## Technical Approach
- **Screen (`/onboarding/fonts`):**
  - Top section: 4 preview tiles (2×2 grid) showing "Aa" in different color combinations using the user's extracted colors. Each tile uses a different font pairing as preview.
  - Title: "Select a font"
  - Subtitle: "Select a primary and a secondary font"
  - Dropdown selector for primary font (Google Fonts: Nunito Sans, Montserrat, Playfair Display, Inter, Roboto, Lato, Poppins, Raleway)
  - Dropdown selector for secondary font (same list)
  - Dashed-border upload zone: "Add font files locally" for custom font files (WOFF/WOFF2/TTF/OTF)
  - Button: "Visualize my site →" (final step)
  - Font preview tiles dynamically update when font selection changes
  - Load Google Fonts dynamically for preview using `@next/font` or direct link

- Save to onboarding_sessions.data: `fonts: { heading, body }`, `custom_fonts: [{ name, file_url }]`

## Acceptance Criteria
- [ ] 4 color+font preview tiles render with user's brand colors
- [ ] Font dropdown shows available Google Fonts
- [ ] Selecting a font updates preview tiles in real-time
- [ ] Custom font upload works (WOFF/WOFF2/TTF/OTF)
- [ ] "Visualize my site" button triggers blueprint generation
- [ ] Font selections saved to onboarding_sessions.data

## Dependencies
- TASK-107 (Brand screen — provides color data for preview tiles)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/fonts/page.tsx`
- `platform-app/src/components/onboarding/FontPreviewTile.tsx`
- `platform-app/src/components/onboarding/FontSelector.tsx`
- `platform-app/src/lib/fonts.ts`
