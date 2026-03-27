# TASK-485: Dashboard Empty State Design

**Status:** TODO
**Priority:** Low
**Sprint:** 50
**Architecture:** architecture-onboarding-ux-modernization.md §Minor Issues
**Depends on:** None

## Description

When a user has zero sites, the dashboard needs a compelling empty state that motivates action, not an empty void.

## Tasks

1. **Create `EmptyDashboard` component** in `src/components/dashboard/EmptyDashboard.tsx`:
   - Centered layout with generous whitespace
   - Illustration: abstract website wireframe (CSS/SVG, not an image file)
   - Heading: "Build your first website" (text-2xl, bold, white)
   - Subtitle: "Archie will design and write your site in under 5 minutes" (text-white/50)
   - CTA: "Get Started" button (brand, xl size, rounded-full, shadow glow)
   - Trust line: "No credit card required" (text-white/30, text-sm)

2. **Integrate in dashboard page** — render `EmptyDashboard` when sites array is empty
3. **Optional: recent showcase** — show 1-2 example sites below CTA ("See what others have built")

## Acceptance Criteria

- [ ] Empty dashboard shows CTA and encouraging copy
- [ ] CTA navigates to `/onboarding/start`
- [ ] Looks polished on both mobile and desktop
- [ ] Matches dark theme and brand styling
