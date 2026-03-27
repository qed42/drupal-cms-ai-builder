# TASK-457: Fix Minor UI Polish — Compact Variant Spacing, Font Tile Overflow, Layout Transitions, Tone Data

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Minor

## Bug Description
Collection of 4 minor UI issues from the design review:

1. **BUG-006: Compact variant spacing** — InferenceCard compact variant has inconsistent padding/margin
2. **BUG-007: Font tile overflow** — Long font names overflow their tile container on the fonts step
3. **BUG-008: Missing layout transitions** — No animation when transitioning between centered and split layout modes
4. **BUG-009: Tone data mismatch** — Tone step right pane shows stale or mismatched analysis data

## Implementation Details
1. Adjust compact variant padding in InferenceCard
2. Add `truncate` or `text-ellipsis` to font tile labels
3. Add subtle fade/slide transition between layout modes (respect `prefers-reduced-motion`)
4. Verify tone step API call sends correct accumulated context

## Acceptance Criteria
- [ ] Compact variant has consistent spacing
- [ ] Long font names truncate with ellipsis
- [ ] Layout mode transitions are smooth (or instant with reduced-motion)
- [ ] Tone step shows current analysis data

## Files
- `platform-app/src/components/onboarding/InferenceCard.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
