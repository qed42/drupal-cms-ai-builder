# TASK-121: Form Submission Storage & Email Notifications

**Story:** US-027 (Form Submission Storage & Notifications)
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M4 — Site Editing

## Description
Configure Webform module on provisioned sites to store form submissions and send email notifications to the site owner when a visitor submits a contact form.

## Technical Approach
- During blueprint import (TASK-112), when creating the contact webform:
  - Configure Webform email handler to send notification to site admin email
  - Configure submission storage (Webform default — stores in DB)
  - Configure confirmation message: "Thank you for contacting us!"
- Ensure site owner (`site_owner` role) can view form submissions
- Basic submission listing accessible from admin toolbar

- **Email configuration:**
  - Use Drupal's mail system
  - Email template: "New contact form submission from {name}" with field values
  - From: site's configured email
  - To: site admin email (from blueprint site.md or Drupal site config)

## Acceptance Criteria
- [ ] Contact form submissions stored in Webform
- [ ] Email notification sent to site owner on submission
- [ ] Site owner can view submission list from admin
- [ ] Confirmation message shown to visitor after submission
- [ ] Email includes all submitted field values

## Dependencies
- TASK-112 (Drush commands — form created during blueprint import)
- Webform module installed

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ImportBlueprintCommands.php` (form creation section)
- Webform module configuration (via code during import)
