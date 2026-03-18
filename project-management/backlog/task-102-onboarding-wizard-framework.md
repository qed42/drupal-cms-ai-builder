# TASK-102: Onboarding Wizard Framework

**Story:** US-005–009 (All wizard steps)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation

## Description
Build the multi-step onboarding wizard framework in Next.js. Conversational, one-question-per-screen UX as shown in Figma designs. Includes step navigation, progress indicator, data persistence, and layout.

## Technical Approach
- Create onboarding layout with dark gradient background (matching Figma Screen 0)
- Animated icon/logo component at top of each screen
- Build step management using URL-based routing (`/onboarding/start`, `/onboarding/name`, etc.)
- Step progress indicator (dot navigation at bottom)
- Shared layout component with consistent styling across steps
- Step data persistence: save to `onboarding_sessions.data` (JSONB) on each step transition via API route
- Resume support: load saved data on mount, redirect to last incomplete step
- Transitions/animations between steps (Framer Motion or CSS transitions)
- "Continue" / "Next" button component with arrow icon (per Figma)

## Acceptance Criteria
- [ ] Wizard renders with dark gradient background matching Figma
- [ ] Progress dots show at bottom, highlight current step
- [ ] Step transitions animate smoothly
- [ ] Data saves to DB on each step forward
- [ ] Refreshing page restores current step and data
- [ ] Back navigation works without data loss

## Dependencies
- TASK-101 (Auth — user must be logged in)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/layout.tsx`
- `platform-app/src/app/(onboarding)/start/page.tsx`
- `platform-app/src/app/api/onboarding/save/route.ts`
- `platform-app/src/app/api/onboarding/resume/route.ts`
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/components/onboarding/ProgressDots.tsx`
