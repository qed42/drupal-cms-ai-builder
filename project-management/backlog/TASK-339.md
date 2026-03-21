# TASK-339: Tailwind v4 Color System Spike

**Story:** US-063
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Research and prove a reliable approach to define custom brand color palettes in Tailwind v4 for the Next.js platform-app. Sprint 23 demonstrated that `@theme inline` in `globals.css` doesn't reliably emit custom CSS variables — `bg-brand-500` rendered teal instead of the new blue. This spike must produce a working, verified solution before any color migration can proceed.

## Technical Approach
1. Create a **mini style guide page** at `platform-app/src/app/color-spike/page.tsx` that tests the full color system — not just one `bg-brand-500` div. The page must render:
   - Primary brand scale (50–950) as background and text utilities
   - Accent color scale for CTAs and highlights
   - Semantic colors (success/warning/error/info) on dark backgrounds
   - Neutral `slate` scale (already working — baseline comparison)
   - Interactive states: button hover, focus rings, border utilities
   - Gradient usage (matching `StepIcon.tsx` patterns)
2. Test **Option A** — define colors in `:root` as plain CSS vars, then reference them in `@theme inline`:
   ```css
   :root { --brand-500: #4856FA; }
   @theme inline { --color-brand-500: var(--brand-500); }
   ```
3. Test **Option B** — use `@theme` (without `inline` keyword):
   ```css
   @theme { --color-brand-500: #4856FA; }
   ```
4. Test **Option C** — use CSS `@layer` with direct `:root` vars and Tailwind arbitrary values as fallback.
5. Define the proposed color system structure (from designer review):
   - **Primary brand**: 1 hue, 50-950 scale (e.g., indigo `#4F46E5`)
   - **Accent**: 1 complementary hue for CTAs and highlights (e.g., cyan `#06B6D4`)
   - **Semantic**: success/warning/error/info (use Tailwind built-ins)
   - **Neutral**: slate scale (already working)
6. Verify computed styles in Chrome, Firefox, and Safari using DevTools.
7. Document which approach works, with screenshots of the full style guide page.
8. Clean up the spike page (or keep behind a dev-only route).

## Acceptance Criteria
- [ ] At least one approach produces correct computed color values across the full brand + accent palette in Chrome, Firefox, and Safari
- [ ] The approach works with Turbopack dev server (not just production build)
- [ ] Style guide page renders: brand scale, accent scale, semantic colors, interactive states, gradients
- [ ] Spike documented with browser screenshots proving the full system renders correctly
- [ ] Clear recommendation on which approach to use for TASK-343
- [ ] Proposed 2-hue color system (primary + accent) with WCAG AA contrast verification on dark backgrounds

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/app/globals.css`
- `platform-app/src/app/color-spike/page.tsx` (new, temporary)
