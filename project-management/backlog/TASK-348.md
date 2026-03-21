# TASK-348: AI Insight Integration Per Step (Chip + Card)

**Story:** US-063
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M18 — UX Revamp

## Description
Integrate `AiInsightChip` and `AiInsightCard` into each onboarding step page, using the correct variant per step. Early text steps get the subtle chip; design steps get the richer card. Wired to existing onboarding session state via `getStepInsight()`.

## Technical Approach
1. For each step page, use `getStepInsight()` and pass the result to the `insightSlot` prop on `StepLayout`:

   **Chip variant (centered layout steps):**
   - **name** → `✦ Sounds like a {industry} website` (chip)
   - **idea** → `✦ AI detected a {industry} focus` (chip)
   - **audience** → `✦ Targeting {audience} — we'll adjust tone` (chip)
   - **tone** → `✦ Content will be {tone} and {adjective}` (chip)

   **Card variant (split layout steps):**
   - **pages** → title: "Page Recommendations", details: list of suggested pages with reasoning (card)
   - **design** → title: "Design Direction", description: style detected from source (card)
   - **brand** → title: "Brand Analysis", description: extracted colors with inline swatch strip (card)
   - **fonts** → title: "Typography", description: pairing rationale with font preview (card)

   **No insight:**
   - **start** → no insight (hero page)
   - **follow-up** → no insight (industry-specific form — context already clear)
   - **review-settings** → no insight (RecipeCard aggregates everything)

2. Use `getStepInsight()` from `ai-insights.ts` — returns `{ variant, ...data }` or null
3. Ensure insights update reactively when user changes input (debounced 300ms)
4. On mobile, both variants render inline below the input fields

## Acceptance Criteria
- [ ] 8 of 11 steps show a contextual insight (4 chips + 4 cards)
- [ ] Chip variant used for centered-layout steps; card variant for split-layout steps
- [ ] Insights reflect actual session data (not hardcoded text)
- [ ] Insights update reactively when user changes input (300ms debounce)
- [ ] No insight on start, follow-up, review-settings
- [ ] Mobile layout places insights inline below inputs

## Dependencies
- TASK-347 (AiInsightCard component must exist)

## Files/Modules Affected
- `platform-app/src/app/onboarding/name/page.tsx`
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/pages/page.tsx`
- `platform-app/src/app/onboarding/design/page.tsx`
- `platform-app/src/app/onboarding/brand/page.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
