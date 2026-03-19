# TASK-237: Version Comparison Diff View

**Story:** US-051
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Implement a diff view that shows changes between the current (edited) content and the original AI-generated version, with additions in green and removals in red.

## Technical Approach
- Install `diff` npm package
- Create `platform-app/src/app/onboarding/review/components/VersionDiff.tsx`
- "Compare with Original" button on the review page (visible only if edits exist)
- Render word-level diff using `diffWords()` from the diff package
- Per-section comparison: original text vs. current text
- Style: additions in green background, removals in red with strikethrough
- Can toggle between "Current" and "Comparison" views

## Acceptance Criteria
- [ ] "Compare with Original" button visible when edits exist
- [ ] Diff view shows additions (green) and removals (red)
- [ ] Comparison is per-section, not whole-page blob
- [ ] Toggle between current and comparison views
- [ ] Hidden when no edits have been made

## Dependencies
- TASK-236 (Original Version Preservation)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/components/VersionDiff.tsx` (new)
- `platform-app/package.json` (add diff package)
