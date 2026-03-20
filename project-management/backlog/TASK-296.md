# TASK-296: Fix sign-out not clearing session

**Type:** Bug
**Priority:** P0 — Critical
**Severity:** Critical
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Clicking "Sign out" on the dashboard fails to clear the user session. After the (broken) redirect, navigating back to the app shows the user still logged in. Even if the redirect issue (TASK-295) is fixed, the session itself is not being invalidated.

## Steps to Reproduce

1. Log in to the app
2. Click "Sign out" on dashboard header
3. Navigate back to `/login` or `/dashboard`
4. User is still authenticated — dashboard shows with email and site data

## Expected Behavior

Session/cookie should be cleared server-side before redirect. After sign out, visiting any authenticated route should redirect to `/login`.

## Acceptance Criteria

- [ ] Sign-out clears the session cookie/token server-side
- [ ] After sign-out, navigating to `/dashboard` redirects to `/login`
- [ ] After sign-out, navigating to `/login` shows the login form (not redirect to dashboard)

## Dependencies

- Related to TASK-295 (redirect fix), but session clearing is a separate concern

## Technical Notes

- Check sign-out API route for cookie clearing logic
- Verify `Set-Cookie` header with `Max-Age=0` or `expires` in the past
