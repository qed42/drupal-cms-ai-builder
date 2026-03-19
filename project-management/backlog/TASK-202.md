# TASK-202: Tone Selection & Differentiators Step

**Story:** US-034
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M6 — Onboarding Enrichment

## Description
Add a combined onboarding step for tone selection and business differentiators. Primary section: 4 tone samples (Professional, Warm, Bold, Casual) as selectable cards + a differentiators text input. Expandable "Advanced" section: optional reference URLs (1-3) and existing copy textarea (max 2,000 chars).

## Technical Approach
- Create new route: `platform-app/src/app/onboarding/tone/page.tsx`
- Define tone samples in a config: 4 options, each with a name, 2-3 sentence sample paragraph
- Render as selectable cards (radio-style) with sample text preview
- Differentiators: text input with industry-specific placeholder
- Advanced (collapsible): reference URLs array input + existing copy textarea
- Save to session: `tone`, `differentiators`, `referenceUrls`, `existingCopy`
- This is the final onboarding step before generation triggers

## Acceptance Criteria
- [ ] 4 tone samples render as selectable cards
- [ ] Differentiators text input has industry-aware placeholder
- [ ] Reference URLs input accepts 1-3 URLs (optional)
- [ ] Existing copy textarea enforces 2,000 char limit (optional)
- [ ] All data saves to onboarding session
- [ ] Navigation: follow-up → tone → generate

## Dependencies
- TASK-201 (Follow-up Questions Step)

## Files/Modules Affected
- `platform-app/src/app/onboarding/tone/page.tsx` (new)
- `platform-app/src/lib/onboarding/tone-samples.ts` (new — sample text config)
- `platform-app/src/app/onboarding/follow-up/page.tsx` (update navigation)
