# Sprint 03 Output: AI Agent Foundation & Onboarding Completion

**Completed:** 2026-03-17

## Tasks Delivered

### TASK-011: Industry Analyzer Service — DONE
- Created `IndustryAnalyzerServiceInterface` with three methods: `generateQuestions()`, `generateBlueprint()`, `inferComplianceFlags()`
- `IndustryAnalyzerService` with predefined industry-specific question templates for all 6 industries:
  - Healthcare: 5 questions (appointment booking, specialties, patient portal, insurance, telehealth)
  - Legal: 5 questions (practice type, consultation type, case results, blog, client type)
  - Real Estate: 4 questions (property types, listing display, virtual tours, market area)
  - Restaurant: 5 questions (cuisine type, dining options, reservations, dietary options, ambiance)
  - Professional Services: 5 questions (service model, pricing model, case studies, payments, EU clients)
  - Other: 4-5 questions (website goal, contact preference, payments, EU, unique features)
- Each question returns structured data: id, text, type (boolean/select/multiselect/text), options, required
- Compliance inference: HIPAA for healthcare, ADA for all, PCI for payment processors, GDPR for EU-serving, FERPA for minors
- Blueprint generation with industry→content type matrix and recommended pages
- Registered as `ai_site_builder.industry_analyzer` service

### TASK-012: Wizard Step 5 — Dynamic Industry Questions — DONE
- Replaced Step 5 placeholder with fully functional dynamic question rendering
- Questions loaded from IndustryAnalyzerService based on selected industry
- Input types rendered per question schema:
  - `boolean` → checkbox
  - `select` → dropdown with options
  - `multiselect` → checkboxes
  - `text` → textfield
- Answers saved to SiteProfile `industry_answers` map field
- "Generate My Website" button replaces "Next" on Step 5
- Compliance flags auto-inferred and saved on generation trigger
- Profile status set to "generating" on submission
- Validation: required questions enforced
- Pre-population: returning users see saved answers
- CSS styling for question cards and generate button

### TASK-014: Shared Content Type Definitions — DONE
- Created `ai_site_builder_content` submodule under `modules/`
- 10 content types created programmatically via install hook:
  - `ai_page`, `service`, `team_member`, `testimonial`, `location`, `provider`, `practice_area`, `listing`, `menu_item`, `case_study`
- 29 shared field storages (field_site_profile, field_description, field_image, field_bio, field_photo, field_cta_text, field_cta_link, field_weight, field_role, field_specialization, field_quote, field_author_name, field_author_role, field_rating, field_address, field_phone, field_hours, field_credentials, field_icon, field_price, field_bedrooms, field_bathrooms, field_sqft, field_listing_status, field_menu_category, field_dietary_flags, field_summary, field_outcome, field_client_industry)
- Every content type has `field_site_profile` entity reference for data isolation
- `menu_category` taxonomy vocabulary for restaurant menu categorization
- Clean uninstall hook removes all types, fields, and vocabulary
- Dependencies: drupal:node, drupal:taxonomy, drupal:text, drupal:file, drupal:link, drupal:image, drupal:telephone

### TASK-015: SDC Component Manifest Service — DONE
- Created `ComponentManifestServiceInterface` with 3 methods: `getManifest()`, `getManifestForPrompt()`, `isValidComponent()`
- `ComponentManifestService` scans Space DS theme's `components/` directory
- Parses all 84 `*.component.yml` files recursively
- Extracts: id, label, description, group, props (with types), slots, usage hints
- Usage hints auto-derived from component group keywords (hero, cta, team, accordion, etc.)
- Manifest cached with `theme_registry` tag (invalidated on cache clear)
- `getManifestForPrompt()` returns formatted text grouped by category for LLM context
- `isValidComponent()` validates component IDs
- Registered as `ai_site_builder.component_manifest` service

## Verification Checklist

| Check | Result |
|-------|--------|
| IndustryAnalyzerService generates 5 questions for Healthcare | PASS |
| IndustryAnalyzerService generates 5 questions for Legal | PASS |
| IndustryAnalyzerService generates questions for "Other" with free text | PASS |
| Questions returned as structured data (id, text, type, options) | PASS |
| Compliance flags inferred (HIPAA for healthcare, ADA default) | PASS |
| Step 5 renders dynamic questions based on industry | PASS |
| Question types render correctly (boolean→checkbox, select→dropdown, etc.) | PASS |
| "Generate My Website" button visible on Step 5 | PASS |
| Answers saved to SiteProfile `industry_answers` field | PASS |
| Content types module installs cleanly | PASS |
| All 10 content types have `field_site_profile` | PASS |
| ComponentManifestService scans 84 Space DS components | PASS |
| Manifest cached and invalidated correctly | PASS |
| `getManifestForPrompt()` returns human-readable text | PASS |
| `isValidComponent()` validates component IDs | PASS |

## Architecture Decisions

1. **Service-based IndustryAnalyzer over AI Agent plugin**: Created as a service rather than an `@AiAgent` plugin because the `ai_agents` module is not yet a dependency. The service can be wrapped in a plugin later when AI Agents integration is added. Predefined question templates provide reliable, instant responses.

2. **Programmatic content type creation over config YAML**: Used install hook with programmatic entity creation instead of 100+ config YAML files. This approach is used by Drupal Commerce and other major distributions. Easier to maintain and understand than dozens of config files.

3. **Content type prefix (`ai_page`)**: Named the basic page type `ai_page` instead of `page` to avoid conflict with Drupal's standard `page` content type. All other types use descriptive names matching the architecture spec.

4. **ComponentManifestService file-system scanning**: Directly scans YAML files from the theme directory rather than using the SDC plugin manager. This avoids requiring the theme to be active/installed and works during development. The manifest is cached for production performance.

## Files Created/Modified

```
web/modules/custom/ai_site_builder/
├── ai_site_builder.services.yml (MODIFIED — added industry_analyzer, component_manifest)
├── css/
│   └── onboarding-wizard.css (MODIFIED — added Step 5 question styles, generate button)
├── modules/
│   └── ai_site_builder_content/
│       ├── ai_site_builder_content.info.yml (NEW)
│       └── ai_site_builder_content.install (NEW — 10 content types, 29 fields)
└── src/
    ├── Form/
    │   └── OnboardingWizardForm.php (MODIFIED — Step 5 + generate button)
    └── Service/
        ├── IndustryAnalyzerService.php (NEW)
        ├── IndustryAnalyzerServiceInterface.php (NEW)
        ├── ComponentManifestService.php (NEW)
        └── ComponentManifestServiceInterface.php (NEW)

project-management/sprint-outputs/
└── sprint-03-output.md (NEW)
```

## Next Steps

- Invoke `/qa sprint-03` for Playwright test automation
- Sprint 04: Generation pipeline (SiteGenerationService, PageBuilderAgent, ContentGeneratorAgent)
