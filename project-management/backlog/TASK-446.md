# TASK-446: Refactor StepLayout Split Mode for Right-Column insightSlot

**Story:** US-090
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Modify StepLayout's existing `split` mode so that when `layoutMode="split"` is set and no `previewSlot` is provided, the `insightSlot` renders in the right column (wrapped in ArchiePanel) instead of inline in the left column. Change the grid ratio from `grid-cols-[45fr_55fr]` to `grid-cols-2` for this variant.

## Implementation Details
- In `StepLayout.tsx`, detect when `split` mode has `insightSlot` but no `previewSlot`
- Render `insightSlot` inside `<ArchiePanel>` in the right column
- Use `grid-cols-2` for the insight-split variant; keep `grid-cols-[45fr_55fr]` when `previewSlot` is present (future-proofing)
- Left column: StepIcon, title, subtitle, children, nav buttons, ProgressStepper
- Right column: `<ArchiePanel>{insightSlot}</ArchiePanel>`
- Mobile fallback (<1024px): single column, insightSlot below input (preserve current behavior)
- Remove `insightSlot` from left column in this variant

## Acceptance Criteria
- [ ] `layoutMode="split"` without `previewSlot` renders insightSlot in right column
- [ ] `layoutMode="split"` with `previewSlot` retains existing 45/55 behavior
- [ ] Grid is 50/50 for insight-split variant
- [ ] Mobile collapses to single column with insightSlot below input
- [ ] Left column alignment is left-aligned (not centered) in split mode

## Dependencies
- TASK-447 (ArchiePanel must exist to wrap the right column content)

## Files
- `platform-app/src/components/onboarding/StepLayout.tsx` (edit)
