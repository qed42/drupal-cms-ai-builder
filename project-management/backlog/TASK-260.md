# TASK-260: Synthetic Test Case Definitions

**Story:** US-057
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M10 — Quality Framework

## Description
Create 10-15 synthetic business scenarios as structured JSON files. Each test case includes full onboarding inputs and expected quality criteria.

## Technical Approach
- Create `platform-app/tests/fixtures/test-cases/` directory
- Create one JSON file per test case: `healthcare-dental.json`, `legal-family-law.json`, `restaurant-farm-to-table.json`, etc.
- Each file includes:
  - Persona name and business type
  - Full onboarding inputs: name, idea, audience, industry, follow-up answers, differentiators, tone
  - Expected pages (titles)
  - Content quality expectations: min word count per page, required industry keywords, expected CTAs
  - Evaluation criteria (mapped to rubric dimensions)
- Cover 10 industries: healthcare, legal, restaurant, SaaS, wellness, real estate, food service, mental health, nonprofit, event planning
- Define TypeScript interface for test case structure

## Acceptance Criteria
- [ ] 10+ test case JSON files created
- [ ] Each covers a distinct industry
- [ ] Each includes complete onboarding inputs
- [ ] Each includes expected quality criteria (word counts, keywords, CTA expectations)
- [ ] TypeScript interface defined for type safety

## Dependencies
- None

## Files/Modules Affected
- `platform-app/tests/fixtures/test-cases/*.json` (new, 10+ files)
- `platform-app/tests/fixtures/test-cases/types.ts` (new)
