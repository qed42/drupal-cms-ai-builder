# TASK-200: Industry Questions Configuration

**Story:** US-033
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M6 — Onboarding Enrichment

## Description
Create a JSON configuration file mapping industry codes to follow-up questions. Each question has an id, text, input type (text/select/multi-select), optional options array, and placeholder text.

## Technical Approach
- Create `platform-app/src/lib/onboarding/industry-questions.ts`
- Define `IndustryQuestion` interface and `INDUSTRY_QUESTIONS` config object
- Cover 10 industries: healthcare, legal, restaurant, SaaS, wellness, real_estate, food_service, mental_health, nonprofit, event_planning
- Include `_default` fallback questions for unrecognized industries
- Export a `getQuestionsForIndustry(industry: string)` function

## Acceptance Criteria
- [ ] Config file exists with questions for 10+ industries
- [ ] Each industry has 2-4 questions
- [ ] Fallback `_default` questions exist for unknown industries
- [ ] Questions have appropriate input types and placeholders

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/lib/onboarding/industry-questions.ts` (new)
