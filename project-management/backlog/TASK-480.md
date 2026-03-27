# TASK-480: Composite Step — Brand Page (Merge brand + fonts)

**Status:** TODO
**Priority:** High
**Sprint:** 49
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-1, §3.2)
**Depends on:** TASK-474, TASK-475

## Description

Merge the `brand` (logo/colors) and `fonts` steps into a single `/onboarding/brand` page with a tab-based UI. Logo, colors, and fonts are all brand identity — users think of them as one decision.

## Tasks

1. **Create `src/app/onboarding/brand/page.tsx`** with two tabs:

   **Tab 1: Logo & Colors**
   - FileUploadZone for logo and brand kit (existing)
   - Color extraction with swatches (existing)
   - Add/remove color capability (existing)
   - Heading: "Your brand identity"

   **Tab 2: Typography**
   - Font preview tiles (4 pairings with user's colors)
   - Heading/body font selectors (existing)
   - Custom font upload zone (existing)

2. **Tab implementation:**
   - Use shadcn Tabs component (install if not present: `npx shadcn@latest add tabs`)
   - Tab labels: "Colors" and "Typography"
   - Tab content transitions: fade crossfade (150ms)
   - State persists across tabs (don't reset on switch)

3. **ArchiePanel (right column):**
   - Colors tab: inference card showing extracted palette
   - Typography tab: inference card showing font pair usage
   - Combined summary when both tabs have data

4. **Update routing:**
   - Replace `brand`, `fonts` with single `brand` step (slug reused)
   - Redirect `/onboarding/fonts` → `/onboarding/brand?tab=typography`
   - Update `onboarding-steps.ts`

5. **Remove old pages:**
   - `src/app/onboarding/fonts/page.tsx` (brand page slug reused)

6. **Update tests**

## Acceptance Criteria

- [ ] Single page with tabs for colors and typography
- [ ] Tab state persists (switching doesn't lose data)
- [ ] Color extraction works in Colors tab
- [ ] Font selection works in Typography tab
- [ ] Google Fonts stylesheet loads dynamically
- [ ] Continue enabled when at least one color exists
