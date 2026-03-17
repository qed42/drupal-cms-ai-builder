# TASK-011: Industry Analyzer AI Agent Plugin

**Story:** US-009, US-010
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Create the `IndustryAnalyzerAgent` AI Agent plugin that analyzes industry and business context to generate dynamic questions and produce a site blueprint.

## Technical Approach
- Create `IndustryAnalyzerAgent` class implementing AI Agents plugin interface (`@AiAgent` annotation)
- Agent has two modes:
  1. **Question generation** (called during onboarding Step 5): generates 3-5 industry-specific questions
  2. **Blueprint generation** (called during site generation): produces site structure blueprint
- System prompt includes: industry, services, target audience, competitors
- Define agent tools:
  - `get_site_profile`: reads SiteProfile data
  - `get_industry_templates`: returns predefined page/content-type recommendations
- Question generation output schema: structured JSON with question text, input type (text, select, boolean), options
- Blueprint output schema: JSON with pages, content_types, compliance flags, tone, keywords
- Include compliance inference logic: based on industry + answers, flag relevant compliance requirements
- Configure LLM provider via Drupal AI module

## Acceptance Criteria
- [ ] Agent generates 3-5 relevant questions for Healthcare industry
- [ ] Agent generates 3-5 relevant questions for Legal industry
- [ ] Agent generates questions for "Other" industry using free-text description
- [ ] Questions are returned as structured data (not free text)
- [ ] Blueprint output includes correct content types per the industry matrix
- [ ] Compliance flags are set appropriately (e.g., HIPAA for healthcare)
- [ ] Agent works with OpenAI provider
- [ ] Response time < 5 seconds for question generation

## Dependencies
- TASK-001 (Module scaffold with AI Agents dependency)
- TASK-002 (SiteProfile entity — data source for agent)
- TASK-003 (Industry taxonomy)

## Files/Modules Affected
- `ai_site_builder/src/Plugin/AiAgent/IndustryAnalyzerAgent.php`
