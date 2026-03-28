# TASK-492: "Why This?" Section Tooltips in Review Editor

**Story:** US-068
**Priority:** P2
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description

Add info tooltips to individual sections in the review editor that explain why specific content was created. Shows which user inputs influenced the section, target SEO keywords, and a brief rationale.

## Acceptance Criteria

- [ ] Subtle "?" icon appears alongside each section's edit button in review editor
- [ ] Click/hover opens a popover (desktop) or bottom sheet (mobile)
- [ ] Tooltip shows: influencing user inputs (tone, audience, keywords), target SEO keywords, 1-2 sentence rationale
- [ ] For image sections, tooltip shows the search query used (e.g., "Searched: 'family dental office modern'")
- [ ] If user has edited a section, tooltip shows note: "You've customized this section — original AI reasoning may no longer apply"
- [ ] Tooltip data comes from pipeline metadata (ResearchBrief, ContentPlan, image intent) — no AI calls
- [ ] Tooltip closes on outside click without disrupting editing workflow

## Technical Notes

- Build a `<SectionInsight sectionId={id} planData={plan} reviewData={review} />` component
- Section-to-plan mapping: use section component IDs from ContentPlan briefs
- Image intent: store search queries during enhance phase in section metadata
- Requires TASK-491 (PageInsightsPanel) for shared data access patterns

## Files to Create/Modify

- `platform-app/src/components/review/SectionInsight.tsx` (new)
- `platform-app/src/app/onboarding/review/page.tsx` (add ? icon to section headers)
