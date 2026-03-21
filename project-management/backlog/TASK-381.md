# TASK-381: Add Theme Selection Step to Onboarding

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 7 — Cleanup & Onboarding

## Description
Add a new onboarding step early in the flow (before industry/content steps) where users choose their design system theme. The selected theme determines which adapter drives the entire AI generation pipeline.

## Technical Approach
1. Add new step to `platform-app/src/lib/onboarding-steps.ts`:
   - Position: Step 2 (after Welcome, before industry detection)
   - Title: "Choose Your Theme" or "Pick a Design"
   - Section: "Vision" (same section as welcome)
2. Create `platform-app/src/app/onboarding/theme-selection/page.tsx`:
   - Display 3 theme cards (Space DS, Mercury, CivicTheme)
   - Each card shows: theme name, description, preview screenshot/mockup, key features
   - Selected theme highlighted with visual indicator
   - "Learn more" link to theme documentation
3. Store `designSystemId` in onboarding session state
4. Update `platform-app/src/lib/onboarding-steps.ts` step count and navigation
5. Update ProgressStepper to include new step
6. Pipeline reads `designSystemId` from session, calls `getAdapter(id)` to get correct adapter
7. All downstream AI generation uses the selected adapter

## Acceptance Criteria
- [ ] Theme selection step appears as step 2 in onboarding
- [ ] All 3 themes displayed with name, description, and visual preview
- [ ] Selected theme persisted in onboarding session
- [ ] Pipeline uses correct adapter based on selection
- [ ] Default selection is Space DS (for backward compatibility)
- [ ] Step navigation (next/back) works correctly with new step
- [ ] ProgressStepper reflects the additional step
- [ ] Mobile responsive layout for theme cards

## Dependencies
- TASK-357 (adapter wired into platform-app)
- All adapter packages created (TASK-356, TASK-369, TASK-375)

## Files/Modules Affected
- `platform-app/src/lib/onboarding-steps.ts`
- `platform-app/src/app/onboarding/theme-selection/page.tsx` (new)
- `platform-app/src/components/onboarding/ThemeCard.tsx` (new)
- Onboarding session state type
- Pipeline context initialization
