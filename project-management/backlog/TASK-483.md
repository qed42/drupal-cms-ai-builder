# TASK-483: Auth Page — Generated Site Showcase Carousel

**Status:** TODO
**Priority:** Medium
**Sprint:** 50
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-6)
**Depends on:** None

## Description

Replace the static three-step text description on the auth left panel with a rotating showcase of pre-generated site screenshots. Show value visually — "this is what you'll get."

## Tasks

1. **Curate 3-4 showcase screenshots:**
   - Generate 3-4 diverse sites through the platform (restaurant, consultant, ecommerce, portfolio)
   - Take full-page screenshots at 1280x800
   - Optimize with Next.js Image (WebP, quality 80)
   - Store in `public/showcase/` (e.g., `showcase-restaurant.webp`, `showcase-consultant.webp`)

2. **Create `ShowcaseCarousel` component** in `src/components/auth/ShowcaseCarousel.tsx`:
   - CSS-only crossfade animation (no JS carousel library)
   - `@keyframes crossfade` with 4s visible, 1s transition per image
   - Total cycle: (4+1) × 4 = 20s loop
   - Each image: `absolute inset-0` with opacity keyframes
   - Rounded corners (rounded-xl) with subtle shadow

3. **Update auth layout** (`src/app/(auth)/layout.tsx`):
   - Keep h2 headline above carousel
   - Replace the three numbered steps with `<ShowcaseCarousel />`
   - Keep "Trusted by..." line below
   - Add small caption below carousel: "Sites built by Space AI" (text-white/30, text-xs)

4. **Reduced motion:** Show first image only (no animation)
5. **Mobile:** Carousel hidden (same as current left panel — `hidden lg:flex`)

## Acceptance Criteria

- [ ] Auth left panel shows rotating site screenshots
- [ ] Pure CSS animation, no JS dependencies
- [ ] Images optimized (< 100KB each via Next.js Image)
- [ ] Smooth crossfade transition between images
- [ ] `prefers-reduced-motion`: static first image
- [ ] No layout shift during transitions
