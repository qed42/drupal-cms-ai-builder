# TASK-103: Wizard Screens 1–3 (Name, Idea, Audience)

**Story:** US-005, US-008
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — Onboarding Journey

## Description
Implement the first three onboarding screens per Figma designs:
- Screen 1: "What are we calling this?" — Project name input
- Screen 2: "What's the big idea?" — Free-text description with "Your Audience" CTA
- Screen 3: "Who is this for?" — Target audience description

## Technical Approach
- **Screen 1 (`/onboarding/name`):** Single text input, centered. Placeholder: "Name of the Project". Button: "Continue →"
- **Screen 2 (`/onboarding/idea`):** Single text input (or textarea). Title: "What's the big idea?" Subtitle: "In a few lines, tell us what this is all about." Button: "Your Audience →"
- **Screen 3 (`/onboarding/audience`):** Single text input. Title: "Who is this for?" Placeholder: "Describe your ideal audience..." Button: "Plan the Structure →"
- Each screen saves data to `onboarding_sessions.data` via API on submit
- Validation: name required (min 2 chars), idea required, audience optional but encouraged
- Each screen follows the StepLayout component from TASK-102

## Acceptance Criteria
- [ ] Screen 1 captures and saves project name
- [ ] Screen 2 captures and saves project description ("big idea")
- [ ] Screen 3 captures and saves target audience
- [ ] All screens match Figma dark gradient style
- [ ] Button labels match Figma: "Continue", "Your Audience", "Plan the Structure"
- [ ] Input validation prevents empty required fields

## Dependencies
- TASK-102 (Wizard framework)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/name/page.tsx`
- `platform-app/src/app/(onboarding)/idea/page.tsx`
- `platform-app/src/app/(onboarding)/audience/page.tsx`
