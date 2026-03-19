# TASK-205: Onboarding Session Schema Update

**Story:** US-033, US-034, US-035, US-036
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M6 — Onboarding Enrichment

## Description
Update the onboarding session data interface and API to accept the new v2 fields: follow-up answers, differentiators, tone selection, reference URLs, existing copy, and enhanced page descriptions.

## Technical Approach
- Update `OnboardingData` interface in `platform-app/src/lib/blueprint/generator.ts` (or extract to shared types)
- Add new fields: `followUpAnswers: Record<string, string>`, `differentiators: string`, `tone: string` (already exists but now user-selected), `referenceUrls: string[]`, `existingCopy: string`, update `pages` to include `description` field
- Update `POST /api/onboarding/new` to accept and validate new fields
- Ensure backward compatibility — new fields are optional so v1 onboarding still works

## Acceptance Criteria
- [ ] OnboardingData interface includes all v2 fields
- [ ] API accepts and stores new fields
- [ ] Existing onboarding sessions without v2 fields still work
- [ ] Type safety enforced across the codebase

## Dependencies
- None (foundation task)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/types.ts` (modify)
- `platform-app/src/app/api/onboarding/new/route.ts` (modify)
