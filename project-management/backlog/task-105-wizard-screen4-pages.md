# TASK-105: Wizard Screen 4 — Page Map

**Story:** US-009 (Dynamic Questions — reimagined as page suggestion)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — Onboarding Journey

## Description
Implement Screen 4: "Let's map your site" — shows AI-suggested pages as editable chips. User can add/remove pages before proceeding. This is a new screen not in the v1 wizard.

## Technical Approach
- **Screen (`/onboarding/pages`):**
  - Title: "Let's map your site."
  - Subtitle: "Based on what you've shared, here are the suggested pages. Keep it, tweak it, or make it your own."
  - Fetch suggested pages from `onboarding_sessions.data.suggested_pages` (set by TASK-104)
  - Render pages as pill/chip components (blue background, white text, × to remove)
  - Each chip has a remove button (×)
  - "Add page +" button that shows a text input to add custom page
  - Minimum 3 pages required, maximum 12
  - Button: "Shape the Experience →"
  - Save final page list to onboarding_sessions.data.pages

## Acceptance Criteria
- [ ] AI-suggested pages render as removable chips
- [ ] User can remove pages (minimum 3)
- [ ] User can add custom pages via "Add page +" input
- [ ] Maximum 12 pages enforced
- [ ] Final page list saved to onboarding_sessions.data
- [ ] Visual matches Figma Screen 4 (blue chips, centered layout)

## Dependencies
- TASK-104 (AI page suggestion)
- TASK-102 (Wizard framework)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/pages/page.tsx`
- `platform-app/src/components/onboarding/PageChip.tsx`
