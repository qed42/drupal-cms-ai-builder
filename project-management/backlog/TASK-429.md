# TASK-429: Update headings, subtitles, and buttons on "Brand & Style" and "Review & Build" section steps

**Story:** US-077, US-078
**Effort:** S
**Status:** TODO

## Description
Update StepLayout props (title, subtitle, buttonLabel) for the 3 remaining steps: follow-up, tone, review-settings.

## Changes per step

### follow-up (`platform-app/src/app/onboarding/follow-up/page.tsx`)
- Heading: "Help Archie write better content"
- Subtitle: "These details go directly into your page copy — specific answers make specific content."
- Button: "Continue"

### tone (`platform-app/src/app/onboarding/tone/page.tsx`)
- Heading: "Set your brand voice"
- Subtitle: "Choose how your site talks to visitors. Archie uses this across every page."
- Button: "Next: Review & Build"

### review-settings (`platform-app/src/app/onboarding/review-settings/page.tsx`)
- Heading: "Review and launch"
- Subtitle: "Here's everything Archie will use to build your site. Make any final changes."
- Button: "Generate My Website" (unchanged)

## Files
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
- `platform-app/src/app/onboarding/review-settings/page.tsx`

## Acceptance Criteria
- [ ] All 3 steps show updated headings, subtitles, and button labels
- [ ] Tone step button previews "Next: Review & Build" section transition
- [ ] Review-settings heading and subtitle reference Archie, generate button unchanged
