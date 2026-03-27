# TASK-450: Add InferenceCard to Follow-Up Step with Split Layout

**Story:** US-090
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
The follow-up step is the only AI-heavy step that currently lacks an InferenceCard. Add one that shows contextual insights based on accumulated user answers (industry, audience, idea), then enable split layout mode.

## Implementation Details
- After the user answers at least 2 follow-up questions, trigger an analysis showing what Archie inferred from the combination of idea + audience + follow-up answers
- InferenceCard items could include:
  - "Business focus" — inferred from follow-up answers (e.g., "High-end cosmetic services")
  - "Content priorities" — what the answers suggest for site content (e.g., "Before/after gallery, pricing transparency")
  - "Competitive angle" — what differentiates this business based on answers
- Use existing `/api/ai/analyze` endpoint or create a lightweight variant that accepts accumulated context
- Add `layoutMode="split"` to StepLayout
- Manage confirmed→compact state like other split-mode steps

## Acceptance Criteria
- [ ] Follow-up step shows InferenceCard in right pane after 2+ questions answered
- [ ] Card items reflect accumulated context (not just the last answer)
- [ ] Split layout renders correctly on desktop
- [ ] Mobile falls back to single column with card below questions
- [ ] Card doesn't block progression — auto-dismisses or collapses on confirmation
- [ ] Loading state shows skeleton while analysis runs

## Dependencies
- TASK-446 (StepLayout split mode)
- TASK-447 (ArchiePanel)
- TASK-448 (InferenceCard compact variant)

## Files
- `platform-app/src/app/onboarding/follow-up/page.tsx` (edit)
- Possibly `platform-app/src/app/api/ai/analyze-followup/route.ts` (create — if a new endpoint is needed)
