# TASK-300: Add input validation and guidance to onboarding text fields

**Type:** Bug (UX)
**Priority:** P2 — Medium
**Severity:** Low
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Onboarding text fields (business idea, audience, differentiator) accept any input with no character count indicator, minimum length validation, or quality guidance. Since AI content generation quality depends heavily on input quality, users should get feedback on their inputs.

## Steps to Reproduce

1. Start onboarding
2. In step 3 (Big Idea), type a single word like "bakery"
3. The form accepts it and proceeds
4. Same for audience (step 4) and differentiator (step 10)

## Expected Behavior

- Show character count (e.g., "23/500 characters")
- Enforce minimum length for key fields (e.g., 20 chars for business idea)
- Show helper text when input is too short (e.g., "Add more detail for better results")

## Acceptance Criteria

- [ ] Business idea field shows character count and enforces minimum of 20 characters
- [ ] Audience field shows character count with minimum of 10 characters
- [ ] Differentiator field shows character count (no minimum — it's optional context)
- [ ] Short inputs show a helpful nudge, not a blocking error
- [ ] "Continue" button is disabled until minimum length is met

## Technical Notes

- This is a frontend-only change — validation in the onboarding step components
- Use the same disabled button pattern already used on other steps
