# TASK-114: Blueprint Import Service (Drupal)

**Story:** US-013 (Page Generation)
**Priority:** P0
**Estimated Effort:** M (reduced from L — component tree comes pre-built)
**Milestone:** M3 — Blueprint & Provisioning

## Description
Implement `BlueprintImportService` in Drupal that receives blueprint JSON (with pre-built Canvas component trees) and creates all site entities — pages, content, forms, menus.

## Key Design Decision: Pre-built Component Trees
The blueprint JSON from the Next.js onboarding journey includes Canvas-ready `component_tree` arrays for each page. The import service does **not** need to understand Canvas component placement logic — it saves the pre-built trees directly to `canvas_page` entities.

This means:
- No dependency on `CanvasAiPageBuilderHelper` or Canvas internal APIs
- Deterministic: what the Next.js generator produces is exactly what renders
- Faster provisioning: no tree construction overhead

## Technical Approach
- Blueprint is a JSON object matching `BlueprintBundle` TypeScript interface from `platform-app/src/lib/blueprint/types.ts`
- JSON is exported from the platform DB by the provisioning engine and passed to Drush as a file path

### Blueprint JSON Schema (updated — includes component_tree):
```json
{
  "site": { "name", "tagline", "industry", "audience", "compliance_flags[]", "tone" },
  "brand": { "colors": { "primary": "#hex", ... }, "fonts": { "heading", "body" }, "logo_url?" },
  "pages": [{
    "slug": "home",
    "title": "Home",
    "seo": { "meta_title", "meta_description" },
    "component_tree": { ... },
    "sections": [{ "component_id", "props": {} }]
  }],
  "content": { "services?": [{ "title", ... }], "team_members?": [], "testimonials?": [] },
  "forms": { "contact": { "fields": [{ "name", "type", "label", "required", "options?" }] } }
}
```

Note: `pages[].component_tree` is the Canvas-ready structure (documented in TASK-123 spike). `pages[].sections` is retained as a human-readable reference but is NOT used for Canvas page creation.

### Import logic:

**`parseBlueprint(string $jsonPath): BlueprintImportResult`**
- Reads JSON file, decodes, validates required keys
- Returns typed result object with all sections

**`importSite(array $siteData): void`**
- Sets site name from `site.name`
- Sets site slogan from `site.tagline`

**`importPages(array $pages): void`**
- For each page object:
  - Creates a `canvas_page` entity with title and the pre-built `component_tree`
  - Sets path alias from `slug`
  - Sets meta title and description via metatag
- Builds main menu from page list
- Sets front page to first page (home)

**`importContent(array $content): void`**
- For each content type key (services, team_members, testimonials):
  - Creates entity instances with field values from the JSON items
  - These entities may be referenced by component tree props

**`importForms(array $forms): void`**
- Creates Webform entity from contact form field definitions
- Configures email notification handler

## Acceptance Criteria
- [ ] `parseBlueprint()` correctly reads and validates JSON
- [ ] `importPages()` creates `canvas_page` entities with pre-built component trees that render correctly
- [ ] `importContent()` creates entities matching content type configs from TASK-113
- [ ] `importForms()` creates Webform entity with correct field types
- [ ] Parser handles missing optional fields gracefully (content types may be absent)
- [ ] Main menu built from page list
- [ ] Front page set correctly
- [ ] Integration tests with sample blueprint JSON pass

## Dependencies
- TASK-113 (Content type configs — parser creates entities of these types)
- TASK-123 (Spike — provides Canvas component tree format for the JSON schema)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
- `web/modules/custom/ai_site_builder/src/Service/BlueprintImportServiceInterface.php`
- `web/modules/custom/ai_site_builder/src/BlueprintImportResult.php`
