# TASK-250: Provisioning Step Timing & Interim Callbacks

**Story:** US-054
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M9 — Provisioning Hardening

## Description
Add per-step timing instrumentation to the provisioning engine and send interim progress callbacks to the platform after each step completes.

## Technical Approach
- Define `StepTiming` interface in `provisioning/src/types.ts`: name, label, status, startedAt, completedAt, durationMs, error
- Create user-friendly step labels map: `{ 'create-database': 'Setting up your database', 'install-drupal': 'Installing Drupal CMS', ... }`
- Wrap each step execution with timing instrumentation (start/end timestamps)
- After each step completes: POST interim progress to `/api/provision/callback` with `type: "progress"`
- Enhance callback endpoint to handle `type: "progress"` (store step timings in site record)
- Enhance `/api/provision/status` to return `provisioning.steps[]` with per-step status and timing

## Acceptance Criteria
- [ ] Each of 11 provisioning steps has timing data (start, end, duration)
- [ ] Interim callbacks sent after each step completion
- [ ] Callback endpoint stores step timings
- [ ] Status API returns per-step status and timing
- [ ] Step labels are user-friendly (not technical names)

## Dependencies
- None (enhances existing provisioning engine)

## Files/Modules Affected
- `provisioning/src/types.ts` (modify — add StepTiming)
- `provisioning/src/provision.ts` (modify — add timing + interim callbacks)
- `platform-app/src/app/api/provision/callback/route.ts` (modify — handle progress type)
- `platform-app/src/app/api/provision/status/route.ts` (modify — return step data)
