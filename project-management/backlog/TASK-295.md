# TASK-295: Fix auth redirects using localhost instead of dynamic origin

**Type:** Bug
**Priority:** P0 — Critical
**Severity:** Critical
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Registration form submission and sign-out redirect to `localhost` URLs, which fail when accessed from non-localhost origins (e.g., Docker containers, mobile preview, or any deployment). The auth flow works (user is created, session is set), but the redirect target is hardcoded.

## Steps to Reproduce

1. Open the app at any non-localhost origin
2. Fill in registration form and click "Get Started Free"
3. Browser redirects to `localhost` → ERR_CONNECTION_REFUSED
4. Same issue with "Sign out" button on dashboard

## Expected Behavior

Redirects should use the request origin or a configured base URL, not hardcoded `localhost`.

## Acceptance Criteria

- [ ] Registration redirect uses dynamic origin (e.g., `req.headers.origin` or env-based `NEXT_PUBLIC_APP_URL`)
- [ ] Sign-out redirect uses dynamic origin
- [ ] Login redirect uses dynamic origin
- [ ] All auth redirects work when accessed via Docker network, custom domain, or localhost

## Technical Notes

- Likely in Next.js API routes under `src/app/api/auth/`
- Check for hardcoded `localhost:3000` in redirect URLs
- Consider using `NEXT_PUBLIC_APP_URL` env var with fallback to request origin
