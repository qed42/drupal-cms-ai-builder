# TASK-427: Update headings, subtitles, and buttons on "Your Business" section steps

**Story:** US-077, US-078
**Effort:** S
**Status:** TODO

## Description
Update StepLayout props (title, subtitle, buttonLabel) for the 5 steps in the "Your Business" section: start, theme, name, idea, audience.

## Changes per step

### start (`platform-app/src/app/onboarding/start/page.tsx`)
- Heading: "Let's build your website together"
- Subtitle: "Tell Archie about your business — the more detail you share, the better your site."
- Button: "Let's Go"

### theme (`platform-app/src/app/onboarding/theme/page.tsx`)
- Heading: "Pick a design foundation"
- Subtitle: "Each theme has a distinct visual style. Archie will customize it with your brand."
- Button: "Continue"

### name (`platform-app/src/app/onboarding/name/page.tsx`)
- Heading: "What's your business called?"
- Subtitle: "This becomes your site title and appears in search results."
- Button: "Continue"

### idea (`platform-app/src/app/onboarding/idea/page.tsx`)
- Heading: "Tell us about your business"
- Subtitle: "Describe what you do, who you serve, and what makes you different. The more detail, the better Archie can tailor your content."
- Button: "Next: Your Audience"

### audience (`platform-app/src/app/onboarding/audience/page.tsx`)
- Heading: "Who are your customers?"
- Subtitle: "Help Archie understand who'll visit your site — their needs drive your messaging."
- Button: "Next: Site Structure"

## Files
- `platform-app/src/app/onboarding/start/page.tsx`
- `platform-app/src/app/onboarding/theme/page.tsx`
- `platform-app/src/app/onboarding/name/page.tsx`
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`

## Acceptance Criteria
- [ ] All 5 steps show updated headings, subtitles, and button labels
- [ ] Start page CTA reads "Let's Go" with arrow
- [ ] Section boundary buttons preview the next section name
