# TASK-453: Fix Pages Step InferenceCard Ghosting/Overlapping

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Critical

## Bug Description
The Pages step InferenceCard in the right pane shows visual ghosting or overlapping content. The card appears to render behind or on top of other elements, creating a broken visual state.

## Root Cause Hypothesis
Z-index stacking context issue between ArchiePanel's glass-morphism backdrop and the InferenceCard content. The `sticky top-12` positioning may conflict with the parent's overflow or transform properties.

## Implementation Details
1. Inspect the stacking context chain: ArchiePanel → sticky container → InferenceCard
2. Check for `transform`, `will-change`, or `filter` on parent elements that create new stacking contexts
3. Verify `overflow` settings on the split-pane grid don't clip positioned children
4. Test with multiple page selections to reproduce overlapping states

## Acceptance Criteria
- [ ] Pages step InferenceCard renders cleanly without ghosting
- [ ] Card content is fully readable with no overlapping elements
- [ ] Sticky behavior works correctly on scroll
- [ ] No visual regression on other split-pane steps

## Files
- `platform-app/src/components/onboarding/ArchiePanel.tsx`
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/app/onboarding/pages/page.tsx`
