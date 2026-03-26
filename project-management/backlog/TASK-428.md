# TASK-428: Update headings, subtitles, and buttons on "Site Structure" section steps

**Story:** US-077, US-078
**Effort:** S
**Status:** TODO

## Description
Update StepLayout props (title, subtitle, buttonLabel) for the 4 steps in the "Site Structure" section: pages, design, brand, fonts.

## Changes per step

### pages (`platform-app/src/app/onboarding/pages/page.tsx`)
- Heading: "Here's your site plan"
- Subtitle: "Archie mapped these pages based on your business. Add, remove, or rename as you like."
- Button: "Continue"

### design (`platform-app/src/app/onboarding/design/page.tsx`)
- Heading: "How should it feel?"
- Subtitle: "Upload a design reference or let Archie style it based on your brand."
- Button: "Continue"

### brand (`platform-app/src/app/onboarding/brand/page.tsx`)
- Heading: "Show us your brand"
- Subtitle: "Drop your logo or brand kit — Archie will extract your colors automatically."
- Button: "Next: Brand & Style"

### fonts (`platform-app/src/app/onboarding/fonts/page.tsx`)
- Heading: "Choose your typography"
- Subtitle: "Your font pairing sets the tone. Archie applies it to all headings and body text."
- Button: "Continue"

## Files
- `platform-app/src/app/onboarding/pages/page.tsx`
- `platform-app/src/app/onboarding/design/page.tsx`
- `platform-app/src/app/onboarding/brand/page.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`

## Acceptance Criteria
- [ ] All 4 steps show updated headings, subtitles, and button labels
- [ ] Brand step button previews "Next: Brand & Style" section transition
