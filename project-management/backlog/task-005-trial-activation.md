# TASK-005: Trial Activation Service

**Story:** US-002
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Create the `TrialManager` service that activates a 14-day trial on registration and provides methods to check trial status.

## Technical Approach
- Create `TrialManager` service implementing `TrialManagerInterface`
- `startTrial(User)`: sets `trial_start` (now) and `trial_end` (now + 14 days) on SiteProfile
- `isActive(User)`: checks if current time is between trial_start and trial_end, or subscription is active
- `getRemainingDays(User)`: returns integer days remaining
- Register service in `ai_site_builder_trial.services.yml`
- Call `startTrial()` from registration form submit handler (TASK-004)
- Create scaffold for `ai_site_builder_trial` submodule

## Acceptance Criteria
- [ ] Trial starts automatically on registration
- [ ] `isActive()` returns true for users within trial period
- [ ] `isActive()` returns false after trial_end
- [ ] `getRemainingDays()` returns correct count
- [ ] Trial dates stored on SiteProfile entity

## Dependencies
- TASK-002 (SiteProfile entity)
- TASK-004 (User registration — calls startTrial)

## Files/Modules Affected
- `ai_site_builder_trial/ai_site_builder_trial.info.yml`
- `ai_site_builder_trial/ai_site_builder_trial.services.yml`
- `ai_site_builder_trial/src/Service/TrialManager.php`
- `ai_site_builder_trial/src/Service/TrialManagerInterface.php`
