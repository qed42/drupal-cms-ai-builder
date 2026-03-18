# TASK-112: Drupal Drush Commands for Provisioning

**Story:** US-012, US-013, US-016
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M3 — Blueprint & Provisioning

## Description
Implement the Drupal Drush commands that the provisioning engine calls. These are the primary interface between the provisioning engine and Drupal.

## Technical Approach

### Command 1: `ai-site-builder:import-config`
- Input: `--industry=healthcare`
- Looks up industry → content type matrix
- Enables only the content types relevant to this industry
- Installs field storage, field instances, view displays, form displays
- Installs pathauto patterns for enabled content types
- Installs metatag defaults

### Command 2: `ai-site-builder:import-blueprint`
- Input: `--path=/path/to/blueprint/`
- Parses `site.md` for metadata
- For each `pages/*.md`:
  - Creates a node of type `page`
  - Parses sections (marked by `## section: {name}`)
  - For each section, calls Canvas PHP API:
    - `canvas_add_section(node, position)`
    - `canvas_place_component(section, component_id, props)`
  - Sets component props from markdown frontmatter
  - Resolves `source: content_type:*` references to actual entity IDs
  - Sets meta title and description via metatag
- For each `content/*.md`:
  - Parses content items (marked by `### {title}`)
  - Creates entity instances with field values
- For `forms/contact.md`:
  - Creates Webform entity with specified fields
  - Configures email notification handler
- Builds main menu from page list
- Sets front page path

### Command 3: `ai-site-builder:apply-brand`
- Input: `--tokens=/path/to/tokens.json [--logo=/path/to/logo.png]`
- Parses tokens.json
- Generates CSS with :root custom properties + Google Fonts import
- Writes to `public://css/brand-tokens.css`
- Implements `hook_page_attachments` to load the CSS on every page
- If logo provided, copies to `public://logo.png` and sets as site logo via theme settings
- If custom fonts, copies font files and generates @font-face CSS

### Command 4: `ai-site-builder:configure-site`
- Rebuilds main menu from existing page nodes
- Runs pathauto bulk update for all content
- Clears all caches
- Sets site name from config

## Acceptance Criteria
- [ ] `import-config --industry=healthcare` installs healthcare content types only
- [ ] `import-config --industry=legal` installs legal content types only
- [ ] `import-blueprint` creates nodes with Canvas layouts from page markdowns
- [ ] `import-blueprint` creates content entities from content markdowns
- [ ] `import-blueprint` creates webform from form markdown
- [ ] `import-blueprint` builds main menu with correct page ordering
- [ ] `apply-brand` generates valid CSS custom properties
- [ ] `apply-brand` CSS loaded on every page via hook_page_attachments
- [ ] `apply-brand` sets logo in theme settings
- [ ] `configure-site` rebuilds menus and clears caches
- [ ] All commands are idempotent (can re-run safely)

## Dependencies
- TASK-113 (Content type configs — import-config installs these)
- TASK-114 (Blueprint parser service)
- TASK-115 (Brand token service)
- Canvas module must be installed

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ImportConfigCommands.php`
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ImportBlueprintCommands.php`
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ApplyBrandCommands.php`
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ConfigureSiteCommands.php`
- `web/modules/custom/ai_site_builder/ai_site_builder.module` (hook_page_attachments)
