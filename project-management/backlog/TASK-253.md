# TASK-253: Provisioning Failure Detail & Resume

**Story:** US-056
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M9 — Provisioning Hardening

## Description
When a provisioning step fails, return detailed error info via the status API and allow retry from the failed step (not from the beginning).

## Technical Approach
- Enhance failure callback to include: failed step name, user-friendly error message, internal error detail
- Store last completed step index in site record (new field: `provisioningLastStep Int?`)
- Create user-friendly error message map: common errors → actionable messages
- Create `POST /api/provision/retry` endpoint:
  - Read last completed step from site record
  - Re-spawn provisioning engine with `--resume-from-step={lastCompleted + 1}`
- Modify `provisioning/src/provision.ts` to accept `--resume-from-step` argument
  - Skip steps before the resume point
  - Execute from the specified step onward
- UI: "Retry" button on failed step in progress page

## Acceptance Criteria
- [ ] Failed step returns user-friendly error message + technical detail
- [ ] "Retry" button appears on failed step
- [ ] Retry re-runs from the failed step (not step 1)
- [ ] Last completed step tracked in site record
- [ ] Provisioning engine supports resume-from-step argument

## Dependencies
- TASK-250 (Provisioning Step Timing)
- TASK-251 (Step-Level Progress UI)

## Files/Modules Affected
- `provisioning/src/provision.ts` (modify — add resume support)
- `platform-app/src/app/api/provision/retry/route.ts` (new)
- `platform-app/prisma/schema.prisma` (add provisioningLastStep to Site)
- `platform-app/src/components/onboarding/ProvisioningSteps.tsx` (add retry button)
