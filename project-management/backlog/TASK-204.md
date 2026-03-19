# TASK-204: Custom Page Addition UI

**Story:** US-037
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M6 — Onboarding Enrichment

## Description
Allow users to add up to 3 custom pages beyond AI suggestions during the page selection onboarding step. Each custom page has a title and brief description.

## Technical Approach
- Add "Add Custom Page" button to the pages onboarding step
- Show inline form: title text input + description textarea
- Enforce max 3 custom pages limit
- Custom pages are visually distinguished from AI suggestions (e.g., different card style or badge)
- Custom pages are stored in session alongside AI-suggested pages
- The description serves as the generation prompt for that page

## Acceptance Criteria
- [ ] "Add Custom Page" button appears on the pages step
- [ ] Users can add up to 3 custom pages with title + description
- [ ] Attempting to add more than 3 shows a limit message
- [ ] Custom pages are visually distinguished from AI suggestions
- [ ] Custom pages are saved to onboarding session

## Dependencies
- TASK-203 (Enhanced Page Suggestions API)

## Files/Modules Affected
- `platform-app/src/app/onboarding/pages/page.tsx` (modify)
