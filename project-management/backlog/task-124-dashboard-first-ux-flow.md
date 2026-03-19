# TASK-124: Dashboard-First UX Flow

**Story:** US-020 (Site Management UX)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M4 — Site Editing

## Description
Fix the post-login UX so returning users land on the site listing dashboard instead of the onboarding wizard. Currently, login redirects all users to `/onboarding/name`, where the "Continue" button silently fails for returning users because no onboarding session exists (sessions are only created during registration).

## Problem
1. After login → user lands on `/onboarding/name`
2. No OnboardingSession exists (only created during `/api/auth/register`)
3. Clicking "Continue" calls `/api/onboarding/save` which returns 404
4. No error feedback — user hits a dead-end

## Technical Approach

### 1. Update Auth Redirect Logic
- `platform-app/src/middleware.ts` or post-login redirect:
  - If user has existing sites → redirect to `/dashboard`
  - If user is freshly registered (no sites) → redirect to `/onboarding/name` (existing flow)

### 2. Dashboard "Add New Website" Button
- Add "Add new website" action to the dashboard page
- On click: `POST /api/onboarding/new` → creates new `OnboardingSession` + `Site` record → redirects to `/onboarding/name`

### 3. API Route: `/api/onboarding/new`
- Creates a fresh `OnboardingSession` for the authenticated user
- Creates a new `Site` record linked to it
- Returns `{ sessionId, redirectUrl: "/onboarding/name" }`

### 4. Keep Registration Flow Intact
- Registration still auto-creates session and redirects to onboarding (no change)

## Acceptance Criteria
- [ ] Returning users land on `/dashboard` after login
- [ ] Dashboard shows list of existing sites with status
- [ ] "Add new website" button creates new onboarding session
- [ ] "Add new website" redirects to `/onboarding/name`
- [ ] Freshly registered users still go directly to onboarding
- [ ] No silent failures — all error states show user-friendly messages

## Dependencies
- TASK-117 (Dashboard page — already exists from Sprint 03)

## Files/Modules Affected
- `platform-app/src/middleware.ts` (or auth redirect logic)
- `platform-app/src/app/dashboard/page.tsx` (add "Add new website" button)
- `platform-app/src/app/api/onboarding/new/route.ts` (new API route)
- `platform-app/src/lib/auth.ts` (redirect logic update)
