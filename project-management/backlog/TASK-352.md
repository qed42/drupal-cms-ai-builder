# TASK-352: SocialProofBanner Start Page

**Story:** US-063
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M18 — UX Revamp

## Description
Add social proof elements to the onboarding start page to build trust with new users. Display metrics like "X sites built" and trust indicators.

## Technical Approach
1. Create `SocialProofBanner.tsx` component:
   - Display: "Join {N}+ sites built with AI" or similar
   - Optional: mini logo bar of trusted brands (placeholder/configurable)
   - Optional: testimonial snippet (rotate between 2-3)
2. Fetch site count from a lightweight API endpoint or hardcode an initial value:
   - Option A: `prisma.site.count()` in a server component
   - Option B: Static value updated periodically
3. Place below the CTA button on `start/page.tsx`
4. Styling: subtle, trust-building — muted text, small logos, not attention-competing

## Acceptance Criteria
- [ ] Start page shows a site count or trust metric
- [ ] Visual design is subtle and doesn't compete with the main CTA
- [ ] Responsive layout (works on mobile)

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/components/onboarding/SocialProofBanner.tsx` (new)
- `platform-app/src/app/onboarding/start/page.tsx`
