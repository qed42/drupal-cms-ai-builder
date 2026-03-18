# Drupal Technical Design
## AI-Powered Drupal Website Builder — Site Runtime

**Version:** 2.0
**Date:** 2026-03-18
**Drupal Version:** 11.x
**Status:** Draft
**Previous:** v1.0 (2026-03-17) — Drupal owned everything. v2 scopes Drupal to site runtime + provisioning.

---

## Scope Change from v1

In v2, Drupal's role is **site runtime and content management**. It no longer handles:
- User registration or authentication (→ Next.js Platform)
- Onboarding wizard UI (→ Next.js Platform)
- Industry analysis during onboarding (→ Next.js AI)
- Trial/subscription management (→ Next.js + Stripe)
- Multi-tenant access control (→ Drupal multisite isolation)

Drupal now handles:
- **Blueprint import** — parsing markdown blueprints into Canvas pages + content entities
- **AI content generation** — using AI agents to build pages and generate content during provisioning
- **Brand token application** — CSS custom properties from brand configuration
- **Canvas editing** — post-provisioning visual editing for site owners
- **Content serving** — rendering published sites with Space theme

---

## 1. Module Architecture

### 1.1 Custom Modules

```
web/modules/custom/
├── ai_site_builder/                    # Core module
│   ├── ai_site_builder.info.yml
│   ├── ai_site_builder.module
│   ├── ai_site_builder.services.yml
│   ├── ai_site_builder.permissions.yml
│   ├── config/
│   │   ├── install/
│   │   │   └── ai_site_builder.settings.yml
│   │   └── optional/
│   ├── src/
│   │   ├── Service/
│   │   │   ├── BlueprintImportService.php
│   │   │   ├── BlueprintImportServiceInterface.php
│   │   │   ├── BrandTokenService.php
│   │   │   ├── BrandTokenServiceInterface.php
│   │   │   ├── ComponentManifestService.php
│   │   │   ├── ComponentManifestServiceInterface.php
│   │   │   ├── ContentPopulationService.php
│   │   │   ├── ContentPopulationServiceInterface.php
│   │   │   └── AutoLoginService.php
│   │   ├── Controller/
│   │   │   └── AutoLoginController.php
│   │   ├── Plugin/
│   │   │   └── AiAgent/
│   │   │       ├── PageBuilderAgent.php
│   │   │       └── ContentGeneratorAgent.php
│   │   └── Drush/
│   │       └── Commands/
│   │           ├── ImportBlueprintCommands.php
│   │           ├── ApplyBrandCommands.php
│   │           ├── ImportConfigCommands.php
│   │           └── ConfigureSiteCommands.php
│   └── templates/
│       └── (none — no custom UI in v2)
│
└── ai_site_builder_content/            # Content type definitions submodule
    ├── ai_site_builder_content.info.yml
    ├── ai_site_builder_content.install  # hook_install to create content types
    └── config/
        └── install/
            ├── node.type.service.yml
            ├── node.type.team_member.yml
            ├── node.type.testimonial.yml
            ├── node.type.location.yml
            ├── node.type.provider.yml
            ├── node.type.practice_area.yml
            ├── node.type.listing.yml
            ├── node.type.menu_item.yml
            ├── node.type.case_study.yml
            ├── field.storage.node.field_description.yml
            ├── field.storage.node.field_image.yml
            ├── field.storage.node.field_bio.yml
            ├── field.storage.node.field_photo.yml
            ├── field.storage.node.field_role.yml
            ├── field.storage.node.field_specialization.yml
            ├── field.storage.node.field_quote.yml
            ├── field.storage.node.field_author_name.yml
            ├── field.storage.node.field_author_role.yml
            ├── field.storage.node.field_rating.yml
            ├── field.storage.node.field_address.yml
            ├── field.storage.node.field_phone.yml
            ├── field.storage.node.field_hours.yml
            ├── field.storage.node.field_credentials.yml
            ├── field.storage.node.field_icon.yml
            ├── field.storage.node.field_price.yml
            ├── field.storage.node.field_bedrooms.yml
            ├── field.storage.node.field_bathrooms.yml
            ├── field.storage.node.field_sqft.yml
            ├── field.storage.node.field_listing_status.yml
            ├── field.storage.node.field_menu_category.yml
            ├── field.storage.node.field_dietary_flags.yml
            ├── field.storage.node.field_cta_text.yml
            ├── field.storage.node.field_cta_link.yml
            ├── field.storage.node.field_weight.yml
            ├── field.storage.node.field_summary.yml
            ├── field.storage.node.field_outcome.yml
            ├── field.storage.node.field_client_industry.yml
            ├── field.field.node.*.yml              # Per-bundle field instances
            ├── core.entity_view_display.node.*.yml
            ├── core.entity_form_display.node.*.yml
            ├── pathauto.pattern.*.yml
            └── metatag.metatag_defaults.*.yml
```

### 1.2 What Was Removed (from v1)

| v1 Component | Status | Reason |
|-------------|--------|--------|
| `SiteProfile` entity | **Removed** | Onboarding data owned by Next.js Platform DB |
| `SiteProfileAccessControlHandler` | **Removed** | Multisite DB isolation replaces ACL |
| `OnboardingWizardForm` | **Removed** | Onboarding moved to Next.js |
| `SiteGenerateForm` | **Removed** | Generation triggered by provisioning engine |
| `IndustryAnalyzerAgent` | **Removed from Drupal** | Industry analysis happens in Next.js during onboarding |
| `FormGeneratorAgent` | **Simplified** | Form definitions come from blueprint; Drupal just creates the webform |
| `SiteGenerationWorker` (Queue) | **Removed** | Provisioning engine orchestrates; no Drupal queue needed |
| `ai_site_builder_trial/` submodule | **Removed** | Trial/subscription managed by Next.js + Stripe |
| `ai_site_builder_publish/` submodule | **Removed** | Publishing is per-site (site IS published when provisioned) |
| `hook_node_access` for site isolation | **Removed** | Database isolation handles this |
| `field_site_profile` on all content types | **Removed** | No cross-site content in same DB |
| Industry taxonomy | **Removed** | Industry inferred in Next.js; passed to Drupal as config parameter |

### 1.3 Contrib Module Dependencies

| Module | Version | Purpose |
|--------|---------|---------|
| `ai` | ^1.0 | LLM provider abstraction (for content generation during provisioning) |
| `ai_agents` | ^1.0 | AI Agent plugin system (PageBuilderAgent, ContentGeneratorAgent) |
| `canvas` | ^1.0 | Visual page editor |
| `webform` | ^6.2 | Form building and submission management |
| `metatag` | ^2.0 | SEO meta title/description |
| `pathauto` | ^1.12 | Automatic URL aliases |
| `token` | ^1.13 | Token replacement |
| `key` | ^1.17 | Secure API key storage |

### 1.4 Theme

| Theme | Purpose |
|-------|---------|
| `space` | SDC component library, design tokens, frontend rendering |

---

## 2. Content Model

### 2.1 No SiteProfile Entity

In v2, there is no SiteProfile entity in Drupal. Each Drupal multisite IS a site — all content in that database belongs to the same site. The platform-level metadata (owner, subscription, industry) lives in the Next.js Platform DB.

### 2.2 Content Types

Same content type definitions as v1, but **without `field_site_profile`** on any of them. Content isolation is achieved by database separation, not entity references.

#### Node Type: `page` (Basic Page)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Body | `body` | text_long (formatted) | No |
| Meta description | via metatag module | - | No |

#### Node Type: `service`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | Yes |
| Image | `field_image` | image | No |
| CTA Text | `field_cta_text` | string | No |
| CTA Link | `field_cta_link` | link | No |
| Weight | `field_weight` | integer | No |

#### Node Type: `team_member`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Role / Title | `field_role` | string | Yes |
| Bio | `field_bio` | text_long | Yes |
| Photo | `field_photo` | image | No |
| Specialization | `field_specialization` | string | No |

#### Node Type: `testimonial`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Quote | `field_quote` | text_long | Yes |
| Author Name | `field_author_name` | string | Yes |
| Author Role | `field_author_role` | string | No |
| Rating | `field_rating` | integer | No |

#### Node Type: `location`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Address | `field_address` | address | Yes |
| Phone | `field_phone` | telephone | No |
| Hours | `field_hours` | text_long | No |

#### Node Type: `provider` (Healthcare)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Specialization | `field_specialization` | string | Yes |
| Bio | `field_bio` | text_long | Yes |
| Photo | `field_photo` | image | No |
| Credentials | `field_credentials` | string | No |

#### Node Type: `practice_area` (Legal)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | Yes |
| Icon | `field_icon` | string | No |

#### Node Type: `listing` (Real Estate)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | Yes |
| Price | `field_price` | string | No |
| Bedrooms | `field_bedrooms` | integer | No |
| Bathrooms | `field_bathrooms` | integer | No |
| Square Footage | `field_sqft` | integer | No |
| Image | `field_image` | image | No |
| Status | `field_listing_status` | list_string | No |

#### Node Type: `menu_item` (Restaurant)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | No |
| Price | `field_price` | string | No |
| Category | `field_menu_category` | entity_reference (taxonomy) | No |
| Dietary Flags | `field_dietary_flags` | list_string | No |
| Image | `field_image` | image | No |

#### Node Type: `case_study` (Legal/Professional Services)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Summary | `field_summary` | text_long | Yes |
| Outcome | `field_outcome` | text_long | No |
| Client Industry | `field_client_industry` | string | No |

### 2.3 Content Type → Industry Matrix

| Content Type | Healthcare | Legal | Real Estate | Restaurant | Prof. Services | Other |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|
| `page` | x | x | x | x | x | x |
| `service` | x | | | | x | x |
| `team_member` | x | | | | x | x |
| `testimonial` | x | x | x | x | x | x |
| `location` | x | | | x | | |
| `provider` | x | | | | | |
| `practice_area` | | x | | | | |
| `listing` | | | x | | | |
| `menu_item` | | | | x | | |
| `case_study` | | x | | | x | |

During provisioning, only content types relevant to the site's industry are installed via `drush ai-site-builder:import-config --industry={industry}`.

---

## 3. Service Layer

### 3.1 Service Definitions (`ai_site_builder.services.yml`)

```yaml
services:
  ai_site_builder.blueprint_import:
    class: Drupal\ai_site_builder\Service\BlueprintImportService
    arguments:
      - '@entity_type.manager'
      - '@ai_site_builder.component_manifest'
      - '@ai_site_builder.content_population'
      - '@logger.factory'

  ai_site_builder.brand_tokens:
    class: Drupal\ai_site_builder\Service\BrandTokenService
    arguments:
      - '@file_system'
      - '@config.factory'

  ai_site_builder.component_manifest:
    class: Drupal\ai_site_builder\Service\ComponentManifestService
    arguments:
      - '@plugin.manager.sdc'
      - '@cache.default'

  ai_site_builder.content_population:
    class: Drupal\ai_site_builder\Service\ContentPopulationService
    arguments:
      - '@entity_type.manager'

  ai_site_builder.auto_login:
    class: Drupal\ai_site_builder\Service\AutoLoginService
    arguments:
      - '@entity_type.manager'
      - '@config.factory'
```

### 3.2 Key Service Interfaces

#### BlueprintImportServiceInterface

```php
interface BlueprintImportServiceInterface {
  /**
   * Imports a complete blueprint directory into the Drupal site.
   *
   * Parses markdown files, creates content entities, builds Canvas layouts,
   * and configures menus.
   *
   * @param string $blueprintPath
   *   Absolute path to the blueprint directory.
   *
   * @return \Drupal\ai_site_builder\BlueprintImportResult
   *   Result object with created entities, errors, and warnings.
   */
  public function import(string $blueprintPath): BlueprintImportResult;

  /**
   * Parses a single page markdown file into structured data.
   *
   * @param string $filePath
   *   Path to the page markdown file.
   *
   * @return array
   *   Parsed page data: title, path, meta, sections with components.
   */
  public function parsePage(string $filePath): array;

  /**
   * Parses a content markdown file into entity data.
   *
   * @param string $filePath
   *   Path to the content markdown file.
   *
   * @return array
   *   Array of content items with content_type and field values.
   */
  public function parseContent(string $filePath): array;
}
```

#### ComponentManifestServiceInterface

```php
interface ComponentManifestServiceInterface {
  /**
   * Returns the SDC component catalog as structured data.
   *
   * @return array
   *   Array of component definitions with id, label, props, slots, usage hints.
   */
  public function getManifest(): array;

  /**
   * Returns manifest as formatted text for AI agent system prompts.
   */
  public function getManifestForPrompt(): string;

  /**
   * Validates that a component ID exists in the manifest.
   */
  public function isValidComponent(string $componentId): bool;
}
```

#### BrandTokenServiceInterface

```php
interface BrandTokenServiceInterface {
  /**
   * Generates CSS custom properties from a tokens.json file.
   *
   * @param string $tokensPath
   *   Path to the brand/tokens.json file.
   *
   * @return string
   *   CSS content with :root custom properties.
   */
  public function generateTokenCss(string $tokensPath): string;

  /**
   * Writes the brand token CSS file and configures the theme to load it.
   *
   * @param string $tokensPath
   *   Path to the brand/tokens.json file.
   */
  public function applyTokens(string $tokensPath): void;
}
```

#### AutoLoginService

```php
class AutoLoginService {
  /**
   * Validates a JWT login token from the Next.js platform.
   *
   * @param string $token
   *   JWT token.
   *
   * @return array|null
   *   Decoded payload with 'email' and 'site_domain', or NULL if invalid.
   */
  public function validateToken(string $token): ?array;

  /**
   * Finds or creates a Drupal user from platform user data.
   *
   * @param string $email
   *   User email from JWT payload.
   * @param string $name
   *   Display name.
   *
   * @return \Drupal\user\UserInterface
   *   The Drupal user account.
   */
  public function findOrCreateUser(string $email, string $name = ''): UserInterface;
}
```

---

## 4. Drush Commands (Provisioning Interface)

The provisioning engine interacts with Drupal exclusively via Drush commands. These are the primary interface.

### 4.1 Command Definitions

#### `ai-site-builder:import-config`

```php
/**
 * Installs content types relevant to the given industry.
 *
 * @command ai-site-builder:import-config
 * @param string $industry
 *   Industry identifier: healthcare, legal, real_estate, restaurant,
 *   professional_services, other.
 * @usage drush ai-site-builder:import-config --industry=healthcare
 */
public function importConfig(string $industry): void {
  // 1. Look up industry → content type matrix
  // 2. Enable field storage configs
  // 3. Create node types and field instances for this industry
  // 4. Import pathauto patterns
  // 5. Import metatag defaults
}
```

#### `ai-site-builder:import-blueprint`

```php
/**
 * Imports a blueprint directory, creating pages and content.
 *
 * @command ai-site-builder:import-blueprint
 * @param string $path
 *   Absolute path to the blueprint directory.
 * @usage drush ai-site-builder:import-blueprint --path=/blueprints/site-123/
 */
public function importBlueprint(string $path): void {
  // 1. Parse site.md for metadata
  // 2. Parse each pages/*.md — create nodes with Canvas layouts
  //    - For each section, use Canvas API to add section + place component
  //    - Set component props from markdown frontmatter
  // 3. Parse each content/*.md — create content entities
  // 4. Parse forms/*.md — create webforms
  // 5. Build main menu from page list
  // 6. Set front page to /home
}
```

#### `ai-site-builder:apply-brand`

```php
/**
 * Applies brand tokens from a tokens.json file.
 *
 * @command ai-site-builder:apply-brand
 * @param string $tokens
 *   Path to brand/tokens.json file.
 * @param string $logo
 *   Path to logo file (optional).
 * @usage drush ai-site-builder:apply-brand --tokens=/blueprints/site-123/brand/tokens.json
 */
public function applyBrand(string $tokens, ?string $logo = NULL): void {
  // 1. Parse tokens.json
  // 2. Generate CSS custom properties
  // 3. Write to public://css/brand-tokens.css
  // 4. Configure theme to load the CSS file (hook_page_attachments or theme setting)
  // 5. If logo provided, copy to public://logo.png and set as site logo
  // 6. If custom fonts, copy font files and generate @font-face CSS
}
```

#### `ai-site-builder:configure-site`

```php
/**
 * Configures site-level settings: menus, pathauto, cron, etc.
 *
 * @command ai-site-builder:configure-site
 * @usage drush ai-site-builder:configure-site
 */
public function configureSite(): void {
  // 1. Rebuild menu from existing page nodes
  // 2. Run pathauto bulk update
  // 3. Clear all caches
  // 4. Set site name from blueprint metadata (if not already set by site:install)
}
```

---

## 5. Canvas Integration

### 5.1 Canvas Skills as AI Agent Tools

Unchanged from v1. Canvas exposes its operations as AI Agent tools:

| Tool ID | Canvas Operation | Parameters |
|---------|-----------------|------------|
| `canvas_create_page` | Create a node with Canvas layout enabled | `title`, `type`, `path` |
| `canvas_add_section` | Add a layout section to a page | `node_id`, `position`, `layout` |
| `canvas_place_component` | Place an SDC component in a section | `node_id`, `section_id`, `component_id`, `props` |
| `canvas_set_component_props` | Update props on a placed component | `node_id`, `component_instance_id`, `props` |
| `canvas_reorder_sections` | Reorder sections within a page | `node_id`, `section_order[]` |
| `canvas_remove_section` | Remove a section from a page | `node_id`, `section_id` |

### 5.2 Blueprint → Canvas Translation

The `BlueprintImportService` translates blueprint page markdown into Canvas tool calls:

```
Blueprint page markdown:

  ## section: hero
  component: space:hero
  props:
    heading: "Your Family Deserves the Brightest Smiles"
    cta_text: "Book an Appointment"

Translates to Canvas tool calls:

  1. canvas_create_page(title="Home", type="page", path="/")
  2. canvas_add_section(node_id=1, position=0)
  3. canvas_place_component(
       node_id=1,
       section_id=0,
       component_id="space:hero",
       props={
         "heading": "Your Family Deserves the Brightest Smiles",
         "cta_text": "Book an Appointment"
       }
     )
```

If a page section uses `source: content_type:service`, the service resolves this to actual entity references from the content that was imported in a prior step.

### 5.3 Component Manifest Generation

Same as v1. `ComponentManifestService` scans Space theme's SDC directory:

```php
$manifest = [
  [
    'id' => 'space:hero',
    'label' => 'Hero Banner',
    'category' => 'hero',
    'props' => [
      'heading' => ['type' => 'string', 'required' => TRUE],
      'subheading' => ['type' => 'string', 'required' => FALSE],
      'cta_text' => ['type' => 'string', 'required' => FALSE],
      'cta_url' => ['type' => 'string', 'required' => FALSE],
      'background_image' => ['type' => 'image', 'required' => FALSE],
    ],
    'usage_hint' => 'Full-width hero section. Use as first section on homepage.',
  ],
  // ...
];
```

### 5.4 Post-Provisioning Editing

After the site is provisioned, the site owner accesses Canvas directly on their Drupal site (via auto-login from the platform dashboard). Canvas editing works natively — no special integration needed beyond the standard Canvas editor.

Section-level AI regeneration (US-021) works within Canvas: user selects a section, clicks "Regenerate with AI", optionally provides guidance, and the ContentGeneratorAgent regenerates that section's content.

---

## 6. AI Agent Integration (During Provisioning)

### 6.1 Agent Plugins

Only two AI agents remain in Drupal (down from four in v1):

#### PageBuilderAgent

```php
/**
 * @AiAgent(
 *   id = "page_builder",
 *   label = @Translation("Page Builder"),
 *   description = @Translation("Builds page layouts using Canvas and SDC components"),
 * )
 */
```

**Used during:** Blueprint import (when blueprint pages need AI enhancement or when `source: content_type:*` references need resolution).

**System prompt context:**
- SDC component manifest (available components + props)
- Blueprint page structure

**Tools:** Canvas skills (create_page, add_section, place_component, set_props)

#### ContentGeneratorAgent

```php
/**
 * @AiAgent(
 *   id = "content_generator",
 *   label = @Translation("Content Generator"),
 *   description = @Translation("Generates SEO-optimized text content"),
 * )
 */
```

**Used during:**
1. Blueprint import — if blueprint content has placeholder markers
2. Section-level regeneration — when user requests AI regeneration in Canvas

**System prompt context:**
- Site name, industry, audience, tone (from blueprint site.md)
- Component props to fill
- SEO constraints (meta title <60 chars, meta description <160 chars)

**Tools:** Entity CRUD, metatag fields, canvas_set_component_props

### 6.2 Agent Invocation During Provisioning

```
Provisioning Engine (Node.js)
    │
    ├── drush ai-site-builder:import-blueprint --path=...
    │       │
    │       ├── Parse site.md, pages/*.md, content/*.md
    │       ├── Create content entities (services, team members, etc.)
    │       ├── For each page:
    │       │   ├── Create node
    │       │   ├── For each section:
    │       │   │   ├── If content is fully specified in blueprint:
    │       │   │   │   └── Call Canvas API directly (no AI needed)
    │       │   │   └── If content has placeholders or needs generation:
    │       │   │       └── Invoke ContentGeneratorAgent
    │       │   └── Link section to content entities (source: content_type:*)
    │       └── Build main menu
    │
    └── drush ai-site-builder:apply-brand --tokens=...
            └── Generate + apply CSS custom properties
```

**Note:** If the Next.js blueprint generation AI produces fully-specified content (no placeholders), the Drupal provisioning step may not need AI agents at all — it becomes a pure data import. The agents are there as a safety net for content that needs Drupal-aware generation or enhancement.

---

## 7. Auto-Login System

### 7.1 Flow

```
Platform Dashboard                     Drupal Site
      │                                     │
      │  GET /auto-login?token=eyJ...       │
      │─────────────────────────────────────►│
      │                                      │
      │                   AutoLoginController │
      │                   1. Decode JWT       │
      │                   2. Verify signature │
      │                      (shared secret)  │
      │                   3. Check exp < now   │
      │                   4. Find/create user  │
      │                   5. Login user        │
      │                   6. Redirect to       │
      │                      /canvas or /      │
      │                                      │
      │  ◄── 302 Redirect to Canvas ─────────│
```

### 7.2 JWT Structure

```json
{
  "sub": "user@example.com",
  "name": "Site Owner Name",
  "site": "bright-smile-dental.example.com",
  "iat": 1711234567,
  "exp": 1711234627,
  "jti": "unique-token-id"
}
```

Signed with RS256 using a shared secret configured in both Next.js and Drupal's `settings.php`.

### 7.3 Drupal Configuration

```php
// sites/{domain}/settings.php
$settings['ai_site_builder_jwt_secret'] = getenv('JWT_SECRET');
```

---

## 8. Multisite Configuration

### 8.1 Directory Structure

```
web/
├── sites/
│   ├── default/                              # Not used for serving sites
│   │   └── settings.php                      # Base Drupal config
│   ├── bright-smile-dental.example.com/      # Site A
│   │   ├── settings.php                      # DB credentials, JWT secret
│   │   └── files/                            # Uploaded media
│   │       ├── css/
│   │       │   └── brand-tokens.css          # Generated brand CSS
│   │       ├── logo.png
│   │       └── ...
│   ├── acme-law.example.com/                 # Site B
│   │   ├── settings.php
│   │   └── files/
│   └── sites.php                             # Domain → directory mapping
```

### 8.2 sites.php

```php
<?php
// Managed by the provisioning engine. Do not edit manually.
$sites['bright-smile-dental.example.com'] = 'bright-smile-dental.example.com';
$sites['acme-law.example.com'] = 'acme-law.example.com';
// New entries appended by provisioning engine
```

### 8.3 Per-Site settings.php Template

```php
<?php
// Generated by provisioning engine for: {domain}
$databases['default']['default'] = [
  'database' => '{db_name}',
  'username' => '{db_user}',
  'password' => '{db_pass}',
  'host' => '{db_host}',
  'port' => '{db_port}',
  'driver' => 'mysql',
  'prefix' => '',
];

// JWT secret for auto-login from platform dashboard
$settings['ai_site_builder_jwt_secret'] = getenv('JWT_SECRET');

// Hash salt (unique per site)
$settings['hash_salt'] = '{generated_hash_salt}';

// File paths
$settings['file_public_path'] = 'sites/{domain}/files';
$settings['file_private_path'] = 'sites/{domain}/private';

// Trusted host pattern
$settings['trusted_host_patterns'] = [
  '^{escaped_domain}$',
];

// Config sync directory
$settings['config_sync_directory'] = 'sites/{domain}/config/sync';
```

---

## 9. Permissions & Roles

### 9.1 Simplified Role Model

With multisite, each Drupal site has only two meaningful roles:

| Role | Purpose |
|------|---------|
| `site_owner` | The person who built the site. Full Canvas editing access. Auto-created via auto-login. |
| `anonymous` | Public visitors viewing the published site. |

No `platform_admin` role in Drupal — platform administration happens in Next.js.

### 9.2 Permissions

```yaml
# ai_site_builder.permissions.yml
edit site content:
  title: 'Edit site content'
  description: 'Edit pages and content using Canvas.'

regenerate section:
  title: 'Regenerate section with AI'
  description: 'Trigger AI regeneration of a page section.'
```

### 9.3 Permission Matrix

| Permission | Anonymous | Site Owner |
|-----------|:---------:|:----------:|
| View published content | x | x |
| Edit site content | | x |
| Use Canvas editor | | x |
| Regenerate section with AI | | x |
| View form submissions | | x |
| Access Drupal admin (/admin) | | x (limited) |

---

## 10. Configuration Management

### 10.1 Config Shipped with Module

Content type definitions, field configs, and defaults are shipped as YAML in `ai_site_builder_content/config/install/`. During provisioning, only industry-relevant configs are imported.

### 10.2 Per-Site Config Sync

Each Drupal multisite has its own config sync directory:

```
sites/{domain}/config/sync/
```

After provisioning, `drush config:export` captures the site's full configuration. This enables:
- Reproducible site rebuilds
- Configuration auditing
- Potential future "clone site" feature

### 10.3 Module Settings

```yaml
# ai_site_builder.settings.yml
default_llm_provider: openai
fallback_llm_provider: anthropic
component_manifest_cache_ttl: 86400  # 24 hours
```

### 10.4 Environment-Specific Config

| Config | Dev | Staging | Production |
|--------|-----|---------|------------|
| LLM provider | OpenAI (gpt-4o-mini) | OpenAI (gpt-4o) | OpenAI (gpt-4o) + Claude fallback |
| Cache backend | Database | Redis | Redis |
| Email | Mailhog | SMTP (test) | SMTP (production) |
| JWT secret | Local dev secret | Staging secret | Production secret (env var) |

---

## Appendix: Drupal Responsibility Matrix (v1 → v2)

| Responsibility | v1 (Drupal Monolith) | v2 (Drupal Multisite Runtime) |
|---------------|---------------------|-------------------------------|
| User registration | Drupal | ~~Removed~~ (Next.js) |
| Onboarding wizard | Drupal Form API | ~~Removed~~ (Next.js) |
| Industry analysis | Drupal AI Agent | ~~Removed~~ (Next.js AI) |
| Trial management | Drupal service | ~~Removed~~ (Next.js + Stripe) |
| Subscription | Drupal service | ~~Removed~~ (Next.js + Stripe) |
| Content type definitions | Drupal config | Drupal config (unchanged) |
| Page building (Canvas) | Drupal AI Agent | Drupal AI Agent (unchanged) |
| Content generation | Drupal AI Agent | Drupal AI Agent (unchanged) |
| Brand tokens | Drupal service | Drupal service (unchanged) |
| Component manifest | Drupal service | Drupal service (unchanged) |
| Data isolation | hook_node_access ACL | Database isolation (multisite) |
| Publishing | Drupal service | N/A (site is live when provisioned) |
| Canvas editing | Drupal | Drupal (unchanged) |
| Site rendering | Drupal + Space theme | Drupal + Space theme (unchanged) |

---

*Next step: Invoke `/drupal-architect` to break the v2 architecture into technical backlog tasks, then `/tpm` to re-plan sprints.*
