# TASK-448: Add Compact Variant to InferenceCard

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Add a `compact` variant to InferenceCard that renders a collapsed single-line summary after the user confirms with "Looks right". This keeps the right pane populated in split mode instead of going empty.

## Implementation Details
- New prop: `variant?: "full" | "compact"` (default: `"full"`)
- Compact variant renders: `✓ {item1.label}: {item1.value} · {item2.value} · {itemN count} detected`
- Truncate to a single line with `text-ellipsis overflow-hidden whitespace-nowrap`
- Styling: same border/bg as full card but reduced padding (`p-3`)
- When `onConfirm` is called, the parent page should switch variant from `"full"` to `"compact"` instead of hiding the card entirely
- This requires each page to manage a `confirmed` state alongside `showInference`

## Acceptance Criteria
- [ ] `variant="compact"` renders single-line summary with checkmark
- [ ] Compact variant preserves key data points in abbreviated form
- [ ] Transition from full → compact is smooth (height collapse animation)
- [ ] Auto-dismiss timer still works (collapses to compact, doesn't disappear)
- [ ] `variant="full"` (default) is unchanged — backward compatible

## Dependencies
- None — extends existing component

## Files
- `platform-app/src/components/onboarding/InferenceCard.tsx` (edit)
