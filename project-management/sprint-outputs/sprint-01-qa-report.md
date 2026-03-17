# Sprint 01 QA Report

**Date:** 2026-03-17
**Status:** Pass — 1 bug found and fixed during QA

## Test Results

| Task | Tests Written | Passed | Failed |
|------|--------------|--------|--------|
| TASK-001: Module Scaffold | 4 | 4 | 0 |
| TASK-002: SiteProfile Entity | 6 | 6 | 0 |
| TASK-003: Industry Taxonomy | 3 | 3 | 0 |
| TASK-004: User Registration | 8 | 8 | 0 |
| TASK-034: Access Control | 4 | 4 | 0 |
| **Total** | **25** | **25** | **0** |

## Bugs Found During QA

### BUG-001: OnboardingController missing cache context — FIXED

**Task:** TASK-004
**Severity:** Major
**Status:** Fixed

#### Description
The `/onboarding` page rendered empty content for authenticated users due to missing `#cache` metadata on the render array. Drupal's Dynamic Page Cache served a cached empty version to all users because the controller output lacked `'contexts' => ['user']`.

#### Steps to Reproduce
1. Register a new user via `/start`
2. User is redirected to `/onboarding`
3. Page shows only the title "Build Your Website" — the Onboarding Status details (email, step, status) are missing

#### Root Cause
`OnboardingController::page()` returned a render array without `#cache` metadata. The Dynamic Page Cache module cached the first render (which happened to be empty) and served it to subsequent users.

#### Fix Applied
Added `#cache` context and tags to the render array in `web/modules/custom/ai_site_builder/src/Controller/OnboardingController.php`:
```php
$build['#cache'] = [
  'contexts' => ['user'],
  'tags' => ['site_profile:' . $profile->id()],
];
```

## Test Files

```
tests/
├── playwright.config.ts
├── e2e/
│   ├── helpers.ts
│   ├── sprint-01-module-scaffold.spec.ts      (4 tests)
│   ├── sprint-01-site-profile-entity.spec.ts  (6 tests)
│   ├── sprint-01-industry-taxonomy.spec.ts    (3 tests)
│   ├── sprint-01-registration.spec.ts         (8 tests)
│   └── sprint-01-access-control.spec.ts       (4 tests)
```

## Test Coverage by Acceptance Criteria

### TASK-001: Module Scaffold
- [x] Drupal site accessible
- [x] Module enabled and listed
- [x] Custom permissions registered
- [x] Admin status report loads

### TASK-002: SiteProfile Entity
- [x] Admin listing page accessible with table headers
- [x] Add form accessible
- [x] Entity create via form works
- [x] Entity edit via form works
- [x] Entity delete via modal works
- [x] Anonymous users blocked from admin

### TASK-003: Industry Taxonomy
- [x] Vocabulary exists in admin
- [x] All 6 terms present
- [x] Terms in correct order (Healthcare → Other)

### TASK-004: User Registration
- [x] Registration page accessible to anonymous
- [x] Login link for existing users present
- [x] Registration creates user + redirects to /onboarding
- [x] Email visible on onboarding page
- [x] User automatically logged in
- [x] site_owner role assigned
- [x] SiteProfile entity created and linked
- [x] Duplicate email shows error
- [x] Logged-in users blocked from /start (403)

### TASK-034: Access Control
- [x] User sees own SiteProfile on /onboarding
- [x] Site owner cannot access admin listing (403)
- [x] Admin can list all profiles
- [x] Admin can view individual profile

## Notes
- Drupal's BigPipe lazy rendering requires increased timeouts (10-15s) for assertions checking dynamically-loaded content
- The admin entity listing uses an AJAX modal for delete confirmation — tests must handle this
- The Claro admin theme's operations column uses dropdown buttons — Edit is visible, Delete requires clicking the dropdown toggle
