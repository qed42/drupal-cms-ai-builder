# TASK-263: Content Evaluation Rubric

**Story:** US-059
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M10 — Quality Framework

## Description
Codify the content evaluation rubric as a JSON schema with 8 scoring dimensions (0-5 each, 40 max, 28 pass threshold). Implement automated checks for measurable dimensions.

## Technical Approach
- Create `platform-app/tests/fixtures/rubric.ts`
  - Define 8 dimensions: content relevance, content depth, industry accuracy, page structure, SEO quality, tone consistency, CTA relevance, component selection
  - Each dimension: name, description, automated (boolean), scoring guide (examples for 1/3/5)
- Create `platform-app/tests/helpers/auto-scorer.ts`
  - Automated scoring for measurable dimensions:
    - Content depth: word count thresholds → score
    - Industry accuracy: keyword presence count → score
    - SEO quality: meta title length, meta description length, keyword in title → score
    - Page structure: sections per page, presence of hero/CTA → score
  - Returns partial score (automated dimensions) + manual evaluation prompts (subjective dimensions)
- Pass threshold: 28/40 (70%)

## Acceptance Criteria
- [ ] Rubric JSON with 8 dimensions defined
- [ ] Each dimension has scoring guide with examples
- [ ] Automated scorer handles 4+ dimensions
- [ ] Manual evaluation guidelines for subjective dimensions
- [ ] Pass threshold of 28/40 enforced

## Dependencies
- TASK-260 (Synthetic Test Case Definitions)

## Files/Modules Affected
- `platform-app/tests/fixtures/rubric.ts` (new)
- `platform-app/tests/helpers/auto-scorer.ts` (new)
