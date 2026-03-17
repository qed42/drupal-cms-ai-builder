# TASK-027: Form Submission Storage & Email Notifications

**Story:** US-027
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M4 — Lead Capture & Forms

## Description
Configure Webform submission storage, email notifications on form submission, and a basic submissions dashboard for site owners.

## Technical Approach
- Webform module handles submission storage natively — configure retention settings
- Email notification handler: configure in TASK-026 via FormGeneratorAgent
- Ensure SMTP/mail system is configured (use Drupal's default mail or symfony_mailer)
- Create a submissions dashboard view:
  - Route: `/site/submissions`
  - Drupal View listing Webform submissions filtered by the user's site forms
  - Columns: date, submitter name, email, message preview, link to full submission
- Access control: site owners see only their own form submissions

## Acceptance Criteria
- [ ] Form submissions stored in database
- [ ] Site owner receives email on each submission
- [ ] Email includes: submitter name, email, message, link to submission
- [ ] Submissions dashboard shows all submissions for user's site
- [ ] Site owner cannot see other users' submissions

## Dependencies
- TASK-026 (Form Generator Agent — forms must exist)

## Files/Modules Affected
- `ai_site_builder/config/install/views.view.site_submissions.yml`
- `ai_site_builder/ai_site_builder.routing.yml` (submissions route)
- Mail configuration in settings.php or module config
