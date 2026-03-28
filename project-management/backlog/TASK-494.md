# TASK-494: Archie Name Highlighting Across UI

**Story:** US-094
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Highlight every occurrence of "Archie" in the UI with the brand color to give the AI assistant a distinct visual identity.

## Technical Approach
- Search all components for hardcoded "Archie" text
- Wrap in `<span className="text-brand-400">Archie</span>`
- Key locations: StepLayout emptyStateText, ArchiePanel heading, ActivityLog heading, InferenceCard title, onboarding-steps tips, progress page "Archie's Workshop"

## Acceptance Criteria
- [ ] All visible "Archie" text rendered in brand-400 color
- [ ] No functional regression in affected components

## Files
- Multiple component files (search for "Archie" string)
