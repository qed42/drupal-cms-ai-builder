# TASK-003: Create Industry Taxonomy Vocabulary

**Story:** US-006
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Create the `industry` taxonomy vocabulary with predefined terms shipped as module config.

## Technical Approach
- Create `config/install/taxonomy.vocabulary.industry.yml`
- Create term config for each industry: Healthcare, Legal, Real Estate, Restaurant, Professional Services, Other
- Each term should have a `description` field explaining what industries it covers
- Set term weights to control display order

## Acceptance Criteria
- [ ] Vocabulary and all 6 terms created on module install
- [ ] Terms are ordered as specified (Healthcare first, Other last)
- [ ] Terms are referenced correctly from SiteProfile entity's `industry` field

## Dependencies
- TASK-001 (Module scaffold)

## Files/Modules Affected
- `ai_site_builder/config/install/taxonomy.vocabulary.industry.yml`
- `ai_site_builder/config/install/taxonomy.term.industry.*.yml` (6 files)
