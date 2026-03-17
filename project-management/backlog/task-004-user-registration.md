# TASK-004: Simplified User Registration Form

**Story:** US-001
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Create a simplified registration form (not the default Drupal registration) that collects email and password, creates a user account with the `site_owner` role, and redirects to the onboarding wizard.

## Technical Approach
- Create custom registration form extending `FormBase`
- Fields: email, password, confirm password
- On submit: create Drupal user with `site_owner` role, log them in, create SiteProfile entity, redirect to `/onboarding`
- Create a landing page route at `/start` or `/build` with the registration form
- Send welcome email via Drupal Mail API (non-blocking verification)
- Handle duplicate email (show error with login link)
- Create `site_owner` role in config

## Acceptance Criteria
- [ ] User can register with email and password
- [ ] Account is created with `site_owner` role
- [ ] User is automatically logged in after registration
- [ ] SiteProfile entity is created and linked to the user
- [ ] User is redirected to `/onboarding`
- [ ] Duplicate email shows appropriate error
- [ ] Welcome email is sent

## Dependencies
- TASK-001 (Module scaffold)
- TASK-002 (SiteProfile entity)

## Files/Modules Affected
- `ai_site_builder/src/Form/RegistrationForm.php`
- `ai_site_builder/ai_site_builder.routing.yml`
- `ai_site_builder/config/install/user.role.site_owner.yml`
- `ai_site_builder/ai_site_builder.module` (hook_mail for welcome email)
