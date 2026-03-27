# TASK-455: Fix Mismatched Empty State Copy in ArchiePanel

**Story:** US-090
**Effort:** XS
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Major

## Bug Description
ArchiePanel empty state shows generic placeholder text that doesn't match the context of the current step. Each step should have contextual empty state copy.

## Implementation Details
1. Add an optional `emptyStateText` prop to ArchiePanel
2. Each split-layout step passes step-appropriate placeholder text
3. Default fallback text remains for any steps that don't specify custom copy

## Acceptance Criteria
- [ ] Each split-layout step shows contextual empty state text in ArchiePanel
- [ ] Default fallback text is sensible for unknown contexts

## Files
- `platform-app/src/components/onboarding/ArchiePanel.tsx`
- Split-layout step pages (idea, audience, pages, brand, fonts, tone, follow-up)
