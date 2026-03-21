# TASK-349: RecipeCard Pre-Generation Summary

**Story:** US-063
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Build a `RecipeCard` component that aggregates all onboarding choices into a visual summary shown on the review-settings step before generation begins. This gives users confidence about what the AI will generate.

## Technical Approach
1. Create `RecipeCard.tsx` with sections:
   - **Site Identity**: project name, idea summary, target audience
   - **Page Map**: list of pages to generate with page types
   - **Visual Design**: color palette swatches, font pairing preview, design style
   - **Content Settings**: tone, voice, industry
2. Read all data from `useOnboarding` session hook
3. Display as a visually rich card with:
   - Grouped sections with subtle dividers
   - Color swatches rendered inline
   - Font names shown in their actual fonts (if loaded)
   - Page list with icons per page type
4. Add an "Edit" link per section that navigates back to the relevant step
5. Integrate into `review-settings/page.tsx` as the main content, replacing or augmenting the existing review UI
6. On mobile, sections stack vertically with collapsible detail

## Acceptance Criteria
- [ ] RecipeCard displays all user choices grouped by category
- [ ] Color swatches rendered visually (not just hex codes)
- [ ] Each section links back to its relevant onboarding step for editing
- [ ] Renders correctly on desktop and mobile
- [ ] Data sourced entirely from onboarding session state

## Dependencies
- TASK-347 (shares AI insight display patterns)

## Files/Modules Affected
- `platform-app/src/components/onboarding/RecipeCard.tsx` (new)
- `platform-app/src/app/onboarding/review-settings/page.tsx`
