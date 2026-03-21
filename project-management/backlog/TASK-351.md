# TASK-351: PreviewPane Integration with Onboarding State

**Story:** US-063
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M18 — UX Revamp

## Description
Create the `PreviewPane` wrapper component and integrate `SiteSkeletonPreview` into the onboarding flow. Wire the preview to update from `useOnboarding` session state across all relevant steps.

## Technical Approach
1. Create `PreviewPane.tsx` as a container component:
   - Browser chrome frame (address bar mockup with site subdomain)
   - Renders `SiteSkeletonPreview` inside scaled frame
   - Shows contextual tooltip about what's changing at the current step
2. Define which steps show the preview pane vs. just insight cards:
   - **Vision steps** (start, name, idea, audience): insight cards only — not enough visual data yet
   - **Design steps** (pages, design, brand, fonts): full preview pane with skeleton
   - **Content steps** (follow-up, tone): preview + tone overlay
   - **Launch** (review-settings): RecipeCard instead of preview
3. Update each step page to pass `previewSlot={<PreviewPane ... />}` to `StepLayout`:
   ```tsx
   <StepLayout
     previewSlot={<PreviewPane session={session} currentStep="brand" />}
     insightSlot={<AiInsightCard ... />}
   >
   ```
4. Connect `useOnboarding` hook data → `PreviewPane` → `SiteSkeletonPreview`
5. Handle empty state gracefully (early steps where preview has minimal data)

## Acceptance Criteria
- [ ] PreviewPane renders on design steps (pages, design, brand, fonts)
- [ ] Preview updates reactively when onboarding state changes
- [ ] Vision steps show insight cards only (no preview pane)
- [ ] Browser chrome frame shows site subdomain if available
- [ ] Hidden on mobile (<1024px)
- [ ] No performance regressions (debounced updates)

## Dependencies
- TASK-350 (SiteSkeletonPreview component)

## Files/Modules Affected
- `platform-app/src/components/onboarding/PreviewPane.tsx` (new)
- `platform-app/src/app/onboarding/pages/page.tsx`
- `platform-app/src/app/onboarding/design/page.tsx`
- `platform-app/src/app/onboarding/brand/page.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
