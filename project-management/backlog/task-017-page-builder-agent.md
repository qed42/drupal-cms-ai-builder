# TASK-017: Page Builder AI Agent Plugin

**Story:** US-013
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M2 — AI Site Generation Engine

## Description
Create the `PageBuilderAgent` AI Agent plugin that builds page layouts using Canvas skills and SDC components.

## Technical Approach
- Create `PageBuilderAgent` class with `@AiAgent` annotation
- System prompt includes:
  - Site blueprint from Industry Analyzer (pages to create, their purpose)
  - SDC component manifest from ComponentManifestService
  - Layout best practices (hero first on homepage, CTAs between content sections, etc.)
- Agent tools (Canvas skills):
  - `canvas_create_page`: creates a node with Canvas layout
  - `canvas_add_section`: adds a section to a page
  - `canvas_place_component`: places an SDC component with props
  - `canvas_reorder_sections`: reorders sections
- Agent creates each page from the blueprint, selecting appropriate SDC components
- Text content props use `{{generate}}` markers for ContentGeneratorAgent to fill
- Content reference props use `{{ref:content_type:X}}` markers
- Validate all component IDs against manifest before placing
- Each page node gets `field_site_profile` reference set

## Acceptance Criteria
- [ ] Agent creates all pages specified in the blueprint
- [ ] Pages are composed only of valid Space SDC components
- [ ] Homepage has hero section, service cards, CTA, and footer-related content
- [ ] Each page has logical section ordering
- [ ] All pages linked to the user's SiteProfile via field_site_profile
- [ ] Generated markers ({{generate}}) are properly placed for content agent
- [ ] Invalid component references are caught and retried

## Dependencies
- TASK-015 (Component Manifest Service)
- TASK-016 (Generation Pipeline — calls this agent)
- TASK-014 (Content types — creates nodes of these types)
- Canvas skills/tools available via AI Agents module

## Files/Modules Affected
- `ai_site_builder/src/Plugin/AiAgent/PageBuilderAgent.php`
