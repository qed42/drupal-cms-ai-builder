# TASK-018: Content Generator AI Agent Plugin

**Story:** US-014, US-015, US-017
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M2 — AI Site Generation Engine

## Description
Create the `ContentGeneratorAgent` that generates SEO-optimized text content, fills page component markers, creates entity instances, and sets meta tags.

## Technical Approach
- Create `ContentGeneratorAgent` class with `@AiAgent` annotation
- System prompt includes:
  - SiteProfile data (business name, services, target audience, tone, keywords)
  - Pages created by PageBuilderAgent (with {{generate}} markers to fill)
  - Content types to populate with sample data
  - SEO guidelines: heading hierarchy, meta title <60 chars, meta description <160 chars
  - Industry tone guidelines
- Agent tools:
  - `create_entity`: creates Drupal entity instances (service nodes, team members, etc.)
  - `update_entity_field`: sets field values on existing entities
  - `set_metatag`: sets meta title/description on nodes via Metatag module
  - `canvas_set_component_props`: fills {{generate}} markers with actual content
- Content generation approach:
  1. Fill all {{generate}} markers on pages with contextual content
  2. Create entity instances for each content type in the blueprint
  3. Set SEO meta on all pages
  4. Generate CTA text and link destinations
- Include compliance disclaimers based on compliance_flags

## Acceptance Criteria
- [ ] All {{generate}} markers replaced with meaningful content
- [ ] Content tone matches the industry (professional for legal, warm for healthcare)
- [ ] Each page has meta title (<60 chars) and meta description (<160 chars)
- [ ] Entity instances created for relevant content types (services, team members, etc.)
- [ ] CTAs placed with correct link destinations
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Compliance disclaimers included when compliance flags are set
- [ ] All content created in "draft" status

## Dependencies
- TASK-017 (Page Builder Agent — creates pages with markers)
- TASK-014 (Content types — creates entities of these types)

## Files/Modules Affected
- `ai_site_builder/src/Plugin/AiAgent/ContentGeneratorAgent.php`
