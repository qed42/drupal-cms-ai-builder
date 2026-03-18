# TASK-114: Blueprint Parser Service (Drupal)

**Story:** US-013 (Page Generation)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M3 — Blueprint & Provisioning

## Description
Implement `BlueprintImportService` in Drupal that parses blueprint markdown files into structured data for entity creation and Canvas layout building.

## Technical Approach
- Install `symfony/yaml` for YAML frontmatter parsing (already available in Drupal core)
- Use a markdown parser library or custom regex for section parsing

### Blueprint parsing logic:

**`parseSite(string $path): array`**
- Reads `site.md`, extracts YAML frontmatter
- Returns: name, tagline, industry, audience, pages list, content_types, compliance flags

**`parsePage(string $filePath): array`**
- Reads page markdown (e.g., `pages/home.md`)
- Extracts YAML frontmatter: title, path, meta_title, meta_description
- Parses `## section: {name}` blocks
- For each section, extracts:
  - `component:` — Space SDC component ID
  - `props:` — YAML block of component properties
- Returns structured array of sections with component data

**`parseContent(string $filePath): array`**
- Reads content markdown (e.g., `content/services.md`)
- Extracts YAML frontmatter: content_type
- Parses `### {title}` blocks as individual content items
- Body text between headings becomes the description field
- Returns array of content items with title + field values

**`parseForm(string $filePath): array`**
- Reads form markdown (e.g., `forms/contact.md`)
- Extracts form fields from YAML frontmatter or structured markdown
- Returns field definitions for Webform creation

### Integration with Canvas:
- The import service calls Canvas PHP API to create layouts
- Must handle `source: content_type:*` references by resolving to entity IDs
- Must handle `placeholder:*` image references (use placeholder images initially)

## Acceptance Criteria
- [ ] `parseSite()` correctly extracts all site metadata from YAML frontmatter
- [ ] `parsePage()` correctly identifies sections, components, and props
- [ ] `parseContent()` correctly splits content items by heading
- [ ] `parseForm()` extracts form field definitions
- [ ] Parser handles missing optional fields gracefully
- [ ] Parser validates component IDs against ComponentManifestService
- [ ] Integration tests with sample blueprint files pass

## Dependencies
- TASK-113 (Content type configs — parser creates entities of these types)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
- `web/modules/custom/ai_site_builder/src/Service/BlueprintImportServiceInterface.php`
- `web/modules/custom/ai_site_builder/src/BlueprintImportResult.php`
