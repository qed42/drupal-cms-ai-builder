# TASK-026: Form Generator AI Agent Plugin

**Story:** US-026, US-028
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M4 — Lead Capture & Forms

## Description
Create the `FormGeneratorAgent` that creates Webforms with industry-appropriate fields and embeds them on relevant pages.

## Technical Approach
- Create `FormGeneratorAgent` class with `@AiAgent` annotation
- System prompt includes:
  - Industry context and compliance flags
  - Pages that need forms (Contact page at minimum)
  - Business services (for context-appropriate fields)
- Agent tools:
  - `create_webform`: creates a Webform entity with machine name and title
  - `add_webform_element`: adds form elements (textfield, email, tel, textarea, select, checkbox)
  - `configure_webform_handler`: sets up email notification handler with recipient = admin_email
  - `canvas_place_component`: embeds the webform on a page as an SDC component
- Default contact form fields: Name (required), Email (required), Phone, Message (required)
- Industry-specific fields via smart inference:
  - Healthcare: "Preferred appointment time", "Insurance provider"
  - Legal: "Case type", "Brief description of your situation"
  - Real Estate: "Property interest", "Budget range"
- Configure Webform submission storage (database)

## Acceptance Criteria
- [ ] Contact form created with appropriate fields for the industry
- [ ] Form embedded on Contact page via Canvas
- [ ] Email handler configured with admin_email as recipient
- [ ] Form submissions stored in Drupal
- [ ] Industry-specific fields are contextually relevant
- [ ] Form validates required fields on submission

## Dependencies
- TASK-017 (Page Builder Agent — Contact page must exist)
- TASK-016 (Generation Pipeline — calls this agent)

## Files/Modules Affected
- `ai_site_builder/src/Plugin/AiAgent/FormGeneratorAgent.php`
