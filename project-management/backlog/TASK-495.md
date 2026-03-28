# TASK-495: ActivityLog Streaming/Loading Indicator

**Story:** US-094
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Add a typing/streaming indicator to the ActivityLog when a pipeline phase is actively running, making the log feel alive between message arrivals.

## Technical Approach
- Add a "typing dots" animation component at the bottom of the ActivityLog
- Show when the latest phase has `status === "in_progress"` and the last message is >1s old
- Three bouncing dots with staggered animation (CSS-only)
- Respect `prefers-reduced-motion`: show static "..." instead of animation
- Hide when a new message arrives or phase completes

## Acceptance Criteria
- [ ] Typing indicator appears when a phase is active and no new message in ~1s
- [ ] Indicator disappears when new message arrives or phase completes
- [ ] Respects reduced-motion preferences
- [ ] Auto-scroll accounts for indicator position

## Files
- `platform-app/src/components/onboarding/ActivityLog.tsx`
- `platform-app/src/app/globals.css` (keyframes)
