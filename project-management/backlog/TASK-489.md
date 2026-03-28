# TASK-489: Progress Page Split Layout with ActivityLog Integration

**Story:** US-093
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Upgrade the progress page to a two-column split layout on desktop. Left column: existing pipeline progress + actions. Right column: ActivityLog showing Archie's reasoning feed. Mobile: single column with collapsed activity log.

## Technical Approach

### Layout Structure
```
Desktop (≥1024px):
  grid grid-cols-[55fr_45fr] gap-8 max-w-5xl mx-auto
    Left:  spinner + heading + subheading + PipelineProgress + provisioning + actions
    Right: ActivityLog (sticky top-12)

Mobile (<1024px):
  Existing single-column layout
  + ActivityLog with maxVisible={3} below phase cards
```

### Changes to progress/page.tsx
1. Parse `messages` and `artifacts` from polled status response
2. Build phase array for ActivityLog from pipeline data
3. Wrap in responsive grid (reuse same `hidden lg:grid` / `lg:hidden` pattern from StepLayout)
4. Right column: `<ActivityLog phases={phases} />`
5. Mobile: `<ActivityLog phases={phases} maxVisible={3} />`

### State Changes
- Add `messages` tracking to pipeline state (diff new messages for animation)
- Pass `artifacts` through to PipelineProgress for expanded cards

## Acceptance Criteria
- [ ] Desktop: two-column layout with pipeline left, activity log right
- [ ] Mobile: single column with collapsed 3-message activity summary
- [ ] ActivityLog auto-scrolls as new messages arrive from polling
- [ ] No layout shift when transitioning from generating → complete
- [ ] Existing retry, download, and navigation buttons unaffected
- [ ] Page still works correctly if backend returns no messages (backward compat)

## Dependencies
- TASK-486 (backend messages)
- TASK-487 (ActivityLog component)
- TASK-488 (expanded phase cards)

## Files
- `platform-app/src/app/onboarding/progress/page.tsx` (edit)
