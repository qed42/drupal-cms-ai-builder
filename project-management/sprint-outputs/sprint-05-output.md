# Sprint 05 Output: Site Editing, Auto-Login & Dashboard UX

**Date:** 2026-03-18
**Status:** Implementation Complete — Ready for QA

## Summary

All 5 tasks implemented. TypeScript compiles clean (both platform-app and provisioning). PHP lint passes on all files.

## Task Deliverables

### S04-BUGS: Sprint 04 Deferred Minor Bugs

| Bug | Fix | File |
|-----|-----|------|
| BUG-007 | Fixed dead ternary: heading → `sans-serif`, body → `serif` | `BrandTokenService.php:283` |
| BUG-008 | Extracted `generateTokenCssFromData()` — `applyTokens()` now passes parsed tokens instead of re-reading file | `BrandTokenService.php:107-126` |
| BUG-009 | Added `esc()` helper to escape single quotes and backslashes in PHP template values | `02-generate-settings.ts:18-45` |
| BUG-010 | Replaced dynamic `import("node:fs/promises")` with static `readFile` import | `09-apply-brand.ts:1,18` |

### TASK-124: Dashboard-First UX Flow

**Files changed:**
- `platform-app/src/middleware.ts` — Logged-in users on auth pages redirect to `/dashboard`
- `platform-app/src/app/page.tsx` — Root redirect for logged-in users → `/dashboard`
- `platform-app/src/app/(auth)/login/page.tsx` — Default callbackUrl → `/dashboard`
- `platform-app/src/app/dashboard/page.tsx` — Shows all sites (not just first), "Add new website" button
- `platform-app/src/components/dashboard/AddNewSiteButton.tsx` — New client component
- `platform-app/src/app/api/onboarding/new/route.ts` — New API: creates Site + Subscription + OnboardingSession

**Key decisions:**
- Registration flow unchanged — new users still auto-redirect to `/onboarding/start`
- Dashboard now shows ALL user sites (multi-site ready)
- "Add new website" creates full stack: Site + trial Subscription + OnboardingSession

### TASK-116: Auto-Login System (JWT Auth Handoff)

**New Drupal files:**
- `src/Service/AutoLoginService.php` — JWT validation (HS256) + user find/create
- `src/Controller/AutoLoginController.php` — `/auto-login?token=&redirect=` endpoint
- `ai_site_builder.routing.yml` — Route definition
- `ai_site_builder.services.yml` — Service registration

**New Next.js files:**
- `platform-app/src/lib/jwt.ts` — HS256 JWT creation with 60s TTL
- `platform-app/src/app/api/auth/create-login-token/route.ts` — API for generating auto-login tokens

**Updated:**
- `platform-app/src/components/dashboard/SiteCard.tsx` — "Edit Site" button now calls auto-login API and opens Drupal Canvas in new tab

**Security:**
- JWT shared secret via `$settings['ai_site_builder_jwt_secret']` (Drupal) and `JWT_SHARED_SECRET` env var (Next.js)
- 60-second TTL prevents token replay
- JTI (UUID) for uniqueness
- Redirect path sanitized (must start with `/`)
- Invalid/expired tokens return 403 with user-friendly error page

### TASK-118: Canvas Editor Config

**New files:**
- `config/install/user.role.site_owner.yml` — Role with Canvas editing, content CRUD, toolbar, webform, media permissions
- `ai_site_builder.permissions.yml` — Custom permissions: `edit site content`, `regenerate section`

**Updated:**
- `ai_site_builder.module` — Added `hook_toolbar_alter()` to hide admin toolbar items (administration, shortcuts, contextual, tour) for site_owner role

### TASK-121: Form Submission & Notifications

**Updated:**
- `BlueprintImportService.php` — Email handler now added to ALL webforms (not just contact). Added confirmation message setting. Email includes `from_mail`, `reply_to` for proper threading.

## Verification

- [x] TypeScript compiles: `platform-app` — clean
- [x] TypeScript compiles: `provisioning` — clean
- [x] PHP lint: all 5 PHP files — no syntax errors
- [ ] Playwright tests — pending QA

## Environment Variables Required

For JWT auto-login to work, both systems need the same shared secret:

**Next.js** (`.env`):
```
JWT_SHARED_SECRET=your-shared-secret-here
```

**Drupal** (`settings.php`):
```php
$settings['ai_site_builder_jwt_secret'] = 'your-shared-secret-here';
```
