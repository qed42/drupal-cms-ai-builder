# Sprint 01 QA Report (v2)

**Date:** 2026-03-18
**Status:** Pass — 28/28 tests passed, 2 bugs found and fixed during QA

## Test Results

| Task | Tests Written | Passed | Failed |
|------|--------------|--------|--------|
| TASK-100: App Scaffold + DB | 2 | 2 | 0 |
| TASK-101: Authentication | 7 | 7 | 0 |
| TASK-102: Wizard Framework | 6 | 6 | 0 |
| TASK-103: Wizard Screens 1–3 | 13 | 13 | 0 |
| **Total** | **28** | **28** | **0** |

## Test Coverage

### TASK-100
- App boots and serves at localhost:3000
- Health check API returns `{"status":"ok","db":"connected"}`

### TASK-101
- User can register with email + password via UI (auto-login to onboarding)
- Duplicate email shows error message
- Registration creates user + site + subscription records via API
- User can log in with credentials
- Invalid credentials show error
- Onboarding route redirects unauthenticated users to login
- Dashboard route redirects to login
- Session persists across page navigation

### TASK-102
- Start page shows welcome message and Start Building button
- Progress dots are visible (4 dots for 4 steps)
- Clicking Start Building navigates to name step
- Back navigation works without data loss
- Data saves to DB on each step forward (verified via resume API)
- Refreshing page restores saved data

### TASK-103
- Screen 1: correct title, subtitle, placeholder, button label ("Continue")
- Screen 1: Continue button disabled when name < 2 chars
- Screen 1: captures and saves project name
- Screen 2: correct title, subtitle, placeholder, button label ("Your Audience")
- Screen 2: Your Audience button disabled when idea empty
- Screen 2: captures and saves project description
- Screen 2: Back button navigates to name step
- Screen 3: correct title, subtitle, placeholder, button label ("Plan the Structure")
- Screen 3: audience field optional — button enabled when empty
- Screen 3: captures and saves target audience
- Screen 3: Back button navigates to idea step
- Full flow: user completes all 3 screens end-to-end

## Bugs Found & Fixed During QA

### BUG-101: Onboarding routes returned 404

**Task:** TASK-102
**Severity:** Critical
**Status:** Fixed

**Root Cause:** Pages were placed in `src/app/(onboarding)/` using Next.js route groups (parenthesized path), which does NOT add a URL segment. Routes were served at `/start`, `/name`, etc. instead of `/onboarding/start`, `/onboarding/name`.

**Fix:** Renamed `src/app/(onboarding)/` to `src/app/onboarding/` to use an actual path segment.

### BUG-102: Middleware used Node.js crypto in edge runtime

**Task:** TASK-101
**Severity:** Critical
**Status:** Fixed

**Root Cause:** The middleware imported `auth` from `@/lib/auth` which pulled in `bcryptjs` and `@prisma/client` — both require Node.js `crypto` module. Next.js middleware runs in edge runtime which doesn't support `crypto`.

**Fix:** Created `auth.config.ts` (edge-compatible config without bcryptjs/Prisma) and updated middleware to import from that instead.

## Test Files

```
platform-app/tests/
├── helpers.ts
├── task-100-scaffold.spec.ts     (2 tests)
├── task-101-auth.spec.ts         (7 tests)
├── task-102-wizard-framework.spec.ts (6 tests)
└── task-103-wizard-screens.spec.ts   (13 tests)
```

## Notes

- The `CredentialsSignin` error logged in server console during "invalid credentials" test is expected NextAuth behavior
- The middleware deprecation warning ("middleware" → "proxy") is a Next.js 16 change — functional but should be migrated in a future sprint
- All 28 tests run in ~1 minute on a single Chromium worker
