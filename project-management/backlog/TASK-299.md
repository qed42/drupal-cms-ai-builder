# TASK-299: Industry field shows "Other" — no industry detection or selection in onboarding

**Type:** Bug
**Priority:** P2 — Medium
**Severity:** Low
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

The review summary (step 11) shows Industry as "Other" even for a clearly identifiable bakery business. There is no step in the onboarding wizard where the user selects an industry, and the AI doesn't auto-detect it from the business description.

## Steps to Reproduce

1. Complete onboarding with a clear business description (e.g., "artisan bakery")
2. Reach step 11 (Review & Generate)
3. Industry shows "Other"

## Expected Behavior

Industry should either be:
- Auto-detected from the business description by AI (preferred)
- Collected as an explicit step in the wizard

## Acceptance Criteria

- [ ] Industry is populated with a meaningful value on the review page (e.g., "Food & Beverage" or "Bakery")
- [ ] Industry value is used to inform content generation quality

## Technical Notes

- The plan phase already has industry context — check if the site record's industry field gets updated
- May need to add industry detection to the page map AI call (step 5) since it already processes the business description
