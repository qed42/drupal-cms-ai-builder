# TASK-274: Pre-Generation Review Step

**Story:** REV-1, REV-4
**Priority:** P0
**Effort:** M
**Sprint:** 15

## Description

Add a summary/review step between the last onboarding input step and generation. Users currently go from "Tone" directly to generation progress with no confirmation.

### Deliverables

1. **Review summary (REV-1):** A screen showing everything the user configured: site name, business idea, audience, selected pages, colors, fonts, tone — organized in clear sections
2. **Generate CTA (REV-4):** A prominent "Generate My Website" button that triggers generation. This is the moment of commitment — it should feel significant (larger button, clear messaging about what happens next)

### Implementation Notes

- New page at `/onboarding/review-settings` (distinct from the post-generation `/onboarding/review` content review page)
- Pull all data from the onboarding session (same as what gets passed to the pipeline)
- Each section could show an "Edit" link that returns to that specific step (P1, can defer)
- Include time expectation: "This will take approximately 2-3 minutes"
- Replaces the current auto-redirect from last step to generation

## Acceptance Criteria

- [ ] Review step appears after the last onboarding input, before generation
- [ ] All user selections are displayed: name, idea, audience, pages, colors, fonts, tone
- [ ] "Generate My Website" button is prominent and triggers generation
- [ ] Time expectation is communicated ("approximately 2-3 minutes")
- [ ] User can go back to previous steps from review

## Dependencies

- TASK-271 (brand identity for consistent styling)
