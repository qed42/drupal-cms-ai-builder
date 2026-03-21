# TASK-346: StepLayout Split-Pane Refactor

**Story:** US-063
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M18 — UX Revamp

## Description
Refactor `StepLayout` from a single-column centered layout to a **3-tier responsive layout system**. Different onboarding steps need different layouts — early text steps stay centered, design steps get a split-pane with preview, and the review step gets a full-width summary. A uniform split-pane would create empty space on early steps.

## Technical Approach
1. Update `StepLayout` props with a `layoutMode` discriminator and optional slots:
   ```ts
   interface StepLayoutProps {
     step: string;
     title: string;
     subtitle?: string;
     buttonLabel: string;
     onSubmit: () => Promise<boolean>;
     disabled?: boolean;
     children: React.ReactNode;
     layoutMode?: 'centered' | 'split' | 'summary';  // NEW — default 'centered'
     previewSlot?: React.ReactNode;  // NEW — right-side content (split mode)
     insightSlot?: React.ReactNode;  // NEW — AI insight chip/card
   }
   ```
2. Implement 3 layout tiers:

   **Tier 1 — `centered` (start, name, idea, audience):**
   - Keep current `max-w-xl mx-auto` centered layout
   - `insightSlot` renders inline BELOW the input as a subtle chip
   - No right pane — focused single-column, tight max-width (640px)
   - This is the default to maintain backward compatibility

   **Tier 2 — `split` (pages, design, brand, fonts, follow-up, tone):**
   - Desktop (≥1024px): CSS Grid `grid-cols-[45fr_55fr]` — preview earns more space
   - Left column: input form (left-aligned, not centered)
   - Right column: `previewSlot` content
   - `insightSlot` positioned in the left column below inputs
   - Mobile: stacked single-column, `previewSlot` hidden

   **Tier 3 — `summary` (review-settings):**
   - Full-width card layout, no split
   - `children` (RecipeCard) fills the width
   - No `previewSlot` — the RecipeCard IS the preview

3. Update `onboarding/layout.tsx` to provide the outer container
4. Layout mode auto-defaults based on `previewSlot` presence:
   - Has `previewSlot` → `split`
   - Has neither → `centered`
   - Explicit `layoutMode` overrides auto-detection
5. Maintain form submission behavior (left pane only in split mode)

## Acceptance Criteria
- [ ] `centered` mode: max-w-xl centered layout with inline insight chip (matches current look)
- [ ] `split` mode: 45/55 split-pane on desktop (≥1024px), input left, preview right
- [ ] `summary` mode: full-width card layout
- [ ] Mobile (<1024px): all modes collapse to single-column, `previewSlot` hidden
- [ ] Steps without `previewSlot` render as centered (no empty right side)
- [ ] `insightSlot` renders inline below inputs in centered mode, within left column in split mode
- [ ] Form submission still works correctly
- [ ] No visual regression on existing steps

## Dependencies
- TASK-342 (wireframes inform the layout ratios and breakpoints)

## Files/Modules Affected
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/app/onboarding/layout.tsx`
