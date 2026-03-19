# TASK-233: Per-Section AI Regeneration

**Story:** US-048
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M8 — Content Review & Editing

## Description
Add a "Regenerate" button to each section that re-runs AI generation for that specific section using the research brief and content plan as context. Supports optional user guidance text.

## Technical Approach
- Create `platform-app/src/app/onboarding/review/components/RegenerateButton.tsx`
- On click: show a small guidance input ("Any specific instructions?") + "Regenerate" confirm button
- Create `POST /api/blueprint/{id}/regenerate-section` API:
  - Accept: `{ pageIndex, sectionIndex, guidance? }`
  - Load research brief + content plan for context
  - Build regeneration prompt with: brief, plan, current page context, guidance
  - Call AI provider for single section regeneration
  - Return new section + previous section (for undo)
- Create `platform-app/src/lib/ai/prompts/section-regeneration.ts`
- Client stores previous version for "Undo" (client-side state only)
- Target: < 15 seconds (NFR-06)

## Acceptance Criteria
- [ ] "Regenerate" button appears on each section
- [ ] Optional guidance text input shown before regeneration
- [ ] Regeneration uses research brief + content plan as context
- [ ] Previous version preserved for undo (client-side)
- [ ] Regeneration completes within 15 seconds
- [ ] "Undo" button appears after regeneration and restores previous version

## Dependencies
- TASK-231 (Review Page Layout)
- TASK-210 (AI Provider Interface)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/components/RegenerateButton.tsx` (new)
- `platform-app/src/app/api/blueprint/[id]/regenerate-section/route.ts` (new)
- `platform-app/src/lib/ai/prompts/section-regeneration.ts` (new)
