# TASK-333: Update selection components (option cards, page chips, tone cards) with new brand colors

**Story:** REQ-onboarding-brand-refresh
**Priority:** P1
**Estimated Effort:** S
**Milestone:** Onboarding Brand Refresh

## Description

Update all selection-style components in the onboarding flow to use the new blue/purple/cyan brand colors instead of teal. This covers option cards, page selection chips, tone radio cards, and any multi-select toggle states.

## Technical Approach

1. **Update `platform-app/src/components/onboarding/DesignOptionCard.tsx`**:
   - Selected state: `bg-brand-500/20 border-brand-500` → same classes (now blue via palette swap)
   - Verify checkmark icon color uses `text-brand-400`
   - Verify disabled/"Coming soon" badge styling

2. **Update `platform-app/src/components/onboarding/PageChip.tsx`** (or equivalent in pages step):
   - Selected state: `bg-brand-500/30 border-brand-500/50`
   - Custom page state: `bg-brand-500/10 border-brand-500/30`
   - Verify add/remove button colors

3. **Update tone selection cards** in `platform-app/src/app/onboarding/tone/page.tsx`:
   - Selected radio card: `bg-brand-500/20 border-brand-500 ring-1 ring-brand-500/50`
   - Radio dot indicator: `bg-brand-500`

4. **Update `platform-app/src/components/onboarding/ColorSwatch.tsx`**:
   - Focus/active state borders
   - Default palette suggestion colors: update to `#4856FA`, `#9E2EF8`, `#01D1FF` as defaults when no logo is uploaded

5. **Update `platform-app/src/components/onboarding/FontPreviewTile.tsx`**:
   - Ensure preview tiles use new brand colors for their backgrounds

6. **Sweep for any remaining `teal-*` or hardcoded teal references** in onboarding components.

## Acceptance Criteria

- [ ] Design option cards show blue accent when selected
- [ ] Page chips show blue accent when selected/custom
- [ ] Tone radio cards show blue accent when selected
- [ ] Color swatch defaults to the new triad colors when no logo uploaded
- [ ] Font preview tiles render correctly with new brand colors
- [ ] No teal-colored accents remain in any onboarding selection component
- [ ] All hover/focus states use new brand colors

## Dependencies
- TASK-328 (color palette must be in place — most changes are automatic via CSS variable swap)

## Files/Modules Affected
- `platform-app/src/components/onboarding/DesignOptionCard.tsx`
- `platform-app/src/components/onboarding/PageChip.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
- `platform-app/src/components/onboarding/ColorSwatch.tsx`
- `platform-app/src/components/onboarding/FontPreviewTile.tsx`
- `platform-app/src/lib/brand.ts` (default palette colors)
