# TASK-468: Migrate Cards and Badges to shadcn Card/Badge

**Story:** US-092
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M24 — UI Component System

## Description

Replace ad-hoc card and badge/chip patterns with shadcn `Card` and `Badge` components to unify padding, borders, border-radius, and variant styling across dashboard and onboarding.

## Technical Approach

1. Install components: `npx shadcn@latest add card badge`
2. Customize Card for dark theme:
   - Default: `bg-white/5 border-white/10 rounded-2xl` (matching current pattern)
   - Add `glass` variant: backdrop-blur + white/5 bg (for onboarding cards)
3. Customize Badge variants:
   - `default` — brand color (active/selected states)
   - `secondary` — white/10 bg (neutral chips)
   - `destructive` — red (error states)
   - `outline` — border-only (status indicators)
4. Migrate Card usages:
   - `SiteCard.tsx` — wrap in Card with CardHeader/CardContent/CardFooter
   - `DesignOptionCard.tsx` — selectable card variant
   - `InferenceCard.tsx` — use Card internally (keep InferenceCard as domain wrapper)
5. Migrate Badge usages:
   - `PageChip.tsx` — replace with Badge + close button
   - `SubscriptionStatus.tsx` — status badges (trial, active, expired)
   - `SiteCard.tsx` — status indicators (live, generating, failed)
6. Install `Skeleton` component: `npx shadcn@latest add skeleton`
   - Replace animate-pulse divs in StrategyPreviewSkeleton and InferenceCard

## Acceptance Criteria

- [ ] SiteCard uses Card composition (Header/Content/Footer)
- [ ] PageChip replaced with Badge + dismiss variant
- [ ] Status badges use consistent Badge variants
- [ ] Skeleton component replaces custom animate-pulse patterns
- [ ] Border-radius consistent across all card instances
- [ ] No visual regression

## Dependencies

- TASK-465

## Files Affected

- `platform-app/src/components/ui/card.tsx` (new)
- `platform-app/src/components/ui/badge.tsx` (new)
- `platform-app/src/components/ui/skeleton.tsx` (new)
- `platform-app/src/components/dashboard/SiteCard.tsx`
- `platform-app/src/components/dashboard/SubscriptionStatus.tsx`
- `platform-app/src/components/onboarding/DesignOptionCard.tsx`
- `platform-app/src/components/onboarding/InferenceCard.tsx`
- `platform-app/src/components/onboarding/PageChip.tsx`
- `platform-app/src/components/onboarding/StrategyPreviewSkeleton.tsx`
