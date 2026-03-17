# TASK-030: Trial Expiry Cron & Notifications

**Story:** US-003
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M5 — Publishing & Subscription

## Description
Create cron-based trial expiry checker that sends notification emails and takes expired sites offline.

## Technical Approach
- Create `TrialExpiryWorker` QueueWorker plugin
- Cron hook: query SiteProfiles where trial_end is approaching or past
- Notification schedule:
  - 4 days before expiry: "Your trial expires in 4 days" email
  - 1 day before expiry: "Final reminder" email with subscribe link
  - On expiry: invoke `PublishService::unpublish()`, set subscription_status to "expired"
- Email templates via `hook_mail` with subscribe link
- Avoid duplicate emails: track notification state (add `trial_notification_sent` field or use state API)
- Run cron daily minimum

## Acceptance Criteria
- [ ] Email sent at 4-day and 1-day marks
- [ ] Expired sites taken offline (unpublished)
- [ ] Content preserved (not deleted) on expiry
- [ ] No duplicate notification emails
- [ ] Expired user sees "Subscribe" prompt on login

## Dependencies
- TASK-005 (Trial Manager)
- TASK-029 (Publish Service — for unpublish)

## Files/Modules Affected
- `ai_site_builder_trial/src/Plugin/QueueWorker/TrialExpiryWorker.php`
- `ai_site_builder_trial/ai_site_builder_trial.module` (hook_cron, hook_mail)
