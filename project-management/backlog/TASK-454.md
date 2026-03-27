# TASK-454: Fix Centered Textarea in Left-Aligned Split Layout

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Major

## Bug Description
Text inputs/textareas in split-layout steps appear centered within the left column instead of left-aligned, creating a visual mismatch with the left-aligned headings and labels.

## Implementation Details
1. Identify which CSS class or Tailwind utility is centering the textarea
2. In split mode, ensure form inputs inherit left alignment from the column
3. Verify centered mode steps are unaffected

## Acceptance Criteria
- [ ] Textareas in split-layout steps are left-aligned
- [ ] Centered-mode steps retain their centered alignment
- [ ] Consistent alignment between headings, labels, and inputs in split mode

## Files
- `platform-app/src/components/onboarding/StepLayout.tsx`
