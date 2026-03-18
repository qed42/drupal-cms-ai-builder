# TASK-101: Authentication System (NextAuth)

**Story:** US-001 (Registration)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation

## Description
Implement user authentication using NextAuth.js with email/password credentials provider. Includes registration, login, and session management.

## Technical Approach
- Install and configure NextAuth.js v5 with Prisma adapter
- Implement credentials provider (email + password with bcrypt)
- Create registration API route (`/api/auth/register`) that:
  - Validates email uniqueness
  - Hashes password with bcrypt
  - Creates user record
  - Creates initial site record (status: "onboarding")
  - Creates subscription record (plan: "trial", trial_ends_at: +14 days)
  - Auto-logs in user after registration
- Create login/register pages with Tailwind-styled forms
- Configure session strategy (JWT)
- Add middleware to protect `/onboarding/*` and `/dashboard/*` routes

## Acceptance Criteria
- [ ] User can register with email + password
- [ ] Duplicate email shows error
- [ ] User can log in with credentials
- [ ] Protected routes redirect to login
- [ ] Session persists across page navigation
- [ ] Registration creates user + site + subscription records

## Dependencies
- TASK-100 (Next.js scaffold + DB schema)

## Files/Modules Affected
- `platform-app/src/app/(auth)/login/page.tsx`
- `platform-app/src/app/(auth)/register/page.tsx`
- `platform-app/src/app/api/auth/[...nextauth]/route.ts`
- `platform-app/src/app/api/auth/register/route.ts`
- `platform-app/src/lib/auth.ts`
