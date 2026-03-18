# TASK-122: Provisioning Status UI

**Story:** US-019 (Generation Progress UI)
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M3 — Blueprint & Provisioning

## Description
After the user clicks "Visualize my site", show a progress screen in the Next.js app that tracks blueprint generation and site provisioning status.

## Technical Approach
- **Progress page (`/onboarding/progress`):**
  - Animated loading UI with step-by-step progress
  - Steps displayed:
    1. "Analyzing your vision..." (blueprint generation)
    2. "Designing page layouts..." (blueprint generation)
    3. "Writing content..." (blueprint generation)
    4. "Setting up your site..." (provisioning)
    5. "Applying your brand..." (provisioning)
    6. "Almost there..." (final configuration)
  - Poll `/api/provision/status/{site_id}` every 3 seconds
  - On completion: show success screen with "View Your Site" and "Edit in Canvas" buttons

- **API Route: `/api/provision/status/{site_id}`**
  - Returns current step and overall progress percentage
  - Status read from `sites` table (provisioning engine updates status via callback)

- **Provisioning engine updates:**
  - Engine POSTs status updates during provisioning: `{ step, progress_percent }`
  - Platform API route receives and stores these

## Acceptance Criteria
- [ ] Progress screen shows animated step-by-step progress
- [ ] Steps update as provisioning progresses
- [ ] Completion shows success screen with site URL
- [ ] "View Your Site" opens the provisioned site
- [ ] "Edit in Canvas" triggers auto-login flow
- [ ] Error state handled (provisioning failed → show retry option)

## Dependencies
- TASK-109 (Blueprint generation — triggers progress)
- TASK-111 (Provisioning engine — provides status updates)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/progress/page.tsx`
- `platform-app/src/app/api/provision/status/[siteId]/route.ts`
- `platform-app/src/components/onboarding/ProgressSteps.tsx`
