# TASK-452: Fix Audience Step InferenceCard Never Populating

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Critical

## Bug Description
The Audience step's InferenceCard in the right-pane ArchiePanel never populates with AI analysis data. The right pane shows the empty state permanently, defeating the split-pane transparency goal.

## Root Cause Hypothesis
The `suggest-audiences` API call likely fires before previous step data is saved to the session, or the response shape doesn't match what the InferenceCard expects. Trace the data flow from API call → response → state → InferenceCard items.

## Implementation Details
1. Verify the `suggest-audiences` API endpoint is called on mount with correct payload
2. Check that the response maps correctly to InferenceCard `items` format
3. Ensure loading/populated state transitions work in ArchiePanel
4. Add error boundary or timeout fallback if API fails silently

## Acceptance Criteria
- [ ] Audience step right pane shows loading state while API runs
- [ ] InferenceCard populates with audience analysis after API completes
- [ ] Empty state only shows if no previous step data exists
- [ ] No console errors during the transition

## Files
- `platform-app/src/app/onboarding/audience/page.tsx`
- Potentially: the API endpoint that serves audience suggestions
