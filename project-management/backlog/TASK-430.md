# TASK-430: Rebrand existing InferenceCards from "AI understood" to "Archie understood"

**Story:** US-079
**Effort:** XS
**Status:** TODO

## Description
Update the `title` prop on the 3 existing InferenceCard instances from "AI understood" to "Archie understood".

## Changes

| File | Current title | New title |
|------|--------------|-----------|
| `platform-app/src/app/onboarding/idea/page.tsx` | "AI understood" | "Archie understood" |
| `platform-app/src/app/onboarding/audience/page.tsx` | "AI understood" | "Archie understood" |
| `platform-app/src/app/onboarding/tone/page.tsx` | "AI understood" | "Archie understood" |

Also check if "AI understood" is a default in `InferenceCard.tsx` — if so, update the default prop value too.

## Files
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
- `platform-app/src/components/onboarding/InferenceCard.tsx` (default prop, if applicable)

## Acceptance Criteria
- [ ] All 3 existing InferenceCards show "Archie understood" as title
- [ ] Default title prop updated if it exists
