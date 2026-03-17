# Drupal Technical Design
## AI-Powered Drupal Website Builder

**Version:** 1.0
**Date:** 2026-03-17
**Drupal Version:** 11.x
**Status:** Draft

---

## 1. Module Architecture

### 1.1 Custom Modules

```
web/modules/custom/
├── ai_site_builder/                    # Core module
│   ├── ai_site_builder.info.yml
│   ├── ai_site_builder.module
│   ├── ai_site_builder.routing.yml
│   ├── ai_site_builder.services.yml
│   ├── ai_site_builder.permissions.yml
│   ├── ai_site_builder.links.menu.yml
│   ├── ai_site_builder.links.task.yml
│   ├── config/
│   │   ├── install/                    # Default config shipped with module
│   │   │   ├── taxonomy.vocabulary.industry.yml
│   │   │   ├── field.storage.node.field_site_profile.yml
│   │   │   ├── system.action.publish_all_site_content.yml
│   │   │   └── ai_site_builder.settings.yml
│   │   └── optional/                   # Config installed if dependencies exist
│   ├── src/
│   │   ├── Entity/
│   │   │   ├── SiteProfile.php                    # Custom content entity
│   │   │   ├── SiteProfileInterface.php
│   │   │   ├── SiteProfileAccessControlHandler.php
│   │   │   ├── SiteProfileListBuilder.php
│   │   │   └── SiteProfileViewBuilder.php
│   │   ├── Form/
│   │   │   ├── OnboardingWizardForm.php           # Multi-step wizard
│   │   │   ├── SiteGenerateForm.php               # "Generate My Website" trigger
│   │   │   └── SiteProfileForm.php                # Admin entity form
│   │   ├── Controller/
│   │   │   ├── OnboardingController.php           # Wizard page controller
│   │   │   ├── GenerationStatusController.php     # Progress polling endpoint
│   │   │   └── SitePreviewController.php          # Post-generation preview
│   │   ├── Service/
│   │   │   ├── SiteGenerationService.php          # Orchestrates generation pipeline
│   │   │   ├── SiteGenerationServiceInterface.php
│   │   │   ├── BrandTokenService.php              # CSS custom property generation
│   │   │   ├── BrandTokenServiceInterface.php
│   │   │   ├── ComponentManifestService.php       # SDC component catalog for agents
│   │   │   ├── ComponentManifestServiceInterface.php
│   │   │   ├── ContentPopulationService.php       # Creates entity content
│   │   │   └── ContentPopulationServiceInterface.php
│   │   ├── Plugin/
│   │   │   ├── AiAgent/
│   │   │   │   ├── IndustryAnalyzerAgent.php      # Industry analysis agent
│   │   │   │   ├── PageBuilderAgent.php           # Page layout agent (uses Canvas skills)
│   │   │   │   ├── ContentGeneratorAgent.php      # Text content generation agent
│   │   │   │   └── FormGeneratorAgent.php         # Form creation agent
│   │   │   └── QueueWorker/
│   │   │       └── SiteGenerationWorker.php       # Queue worker for async generation
│   │   ├── EventSubscriber/
│   │   │   └── SiteGenerationSubscriber.php       # Reacts to generation lifecycle events
│   │   ├── Event/
│   │   │   ├── SiteGenerationEvent.php
│   │   │   └── SiteGenerationEvents.php           # Event constants
│   │   └── Access/
│   │       └── SiteProfileAccessCheck.php         # Route access checker
│   └── templates/
│       ├── onboarding-wizard.html.twig
│       └── generation-progress.html.twig
│
├── ai_site_builder_trial/              # Trial & subscription submodule
│   ├── ai_site_builder_trial.info.yml
│   ├── ai_site_builder_trial.module
│   ├── ai_site_builder_trial.services.yml
│   ├── src/
│   │   ├── Service/
│   │   │   ├── TrialManager.php
│   │   │   ├── TrialManagerInterface.php
│   │   │   ├── SubscriptionService.php
│   │   │   └── SubscriptionServiceInterface.php
│   │   ├── Plugin/
│   │   │   └── QueueWorker/
│   │   │       └── TrialExpiryWorker.php          # Cron-triggered trial checker
│   │   ├── EventSubscriber/
│   │   │   └── TrialLifecycleSubscriber.php
│   │   └── Controller/
│   │       └── SubscriptionController.php         # Stripe webhook handler
│   └── config/
│       └── install/
│           └── ai_site_builder_trial.settings.yml
│
└── ai_site_builder_publish/            # Publishing submodule
    ├── ai_site_builder_publish.info.yml
    ├── ai_site_builder_publish.services.yml
    ├── src/
    │   ├── Service/
    │   │   ├── PublishService.php
    │   │   ├── PublishServiceInterface.php
    │   │   ├── DomainService.php
    │   │   └── DomainServiceInterface.php
    │   └── Controller/
    │       └── PublishController.php               # One-click publish endpoint
    └── config/
        └── install/
            └── ai_site_builder_publish.settings.yml
```

### 1.2 Contrib Module Dependencies

| Module | Version | Purpose |
|--------|---------|---------|
| `ai` | ^1.0 | LLM provider abstraction |
| `ai_agents` | ^1.0 | AI Agent plugin system and orchestration |
| `canvas` | ^1.0 | Visual page editor |
| `webform` | ^6.2 | Form building and submission management |
| `metatag` | ^2.0 | SEO meta title/description management |
| `pathauto` | ^1.12 | Automatic URL alias generation |
| `token` | ^1.13 | Token replacement (used by pathauto) |
| `key` | ^1.17 | Secure API key storage for LLM providers |
| `admin_toolbar` | ^3.4 | Admin UX (platform admins only) |

### 1.3 Theme

| Theme | Purpose |
|-------|---------|
| `space` | SDC component library, design tokens, frontend rendering |

> Space theme is the **only** frontend theme. No admin theme customization needed for site owners — they interact via Canvas and the onboarding wizard only.

---

## 2. Content Model

### 2.1 Custom Entity: SiteProfile

**Entity type:** `site_profile` (content entity, revisionable, NOT fieldable via UI)
**Base table:** `site_profile`
**Revision table:** `site_profile_revision`

```php
/**
 * @ContentEntityType(
 *   id = "site_profile",
 *   label = @Translation("Site Profile"),
 *   handlers = {
 *     "access" = "Drupal\ai_site_builder\Entity\SiteProfileAccessControlHandler",
 *     "list_builder" = "Drupal\ai_site_builder\Entity\SiteProfileListBuilder",
 *     "view_builder" = "Drupal\ai_site_builder\Entity\SiteProfileViewBuilder",
 *     "form" = {
 *       "default" = "Drupal\ai_site_builder\Form\SiteProfileForm",
 *       "delete" = "Drupal\Core\Entity\ContentEntityDeleteForm",
 *     },
 *   },
 *   base_table = "site_profile",
 *   revision_table = "site_profile_revision",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "revision" = "revision_id",
 *     "label" = "site_name",
 *     "owner" = "user_id",
 *   },
 * )
 */
```

**Base fields defined in `SiteProfile::baseFieldDefinitions()`:**

| Field | Type | Cardinality | Notes |
|-------|------|-------------|-------|
| `id` | integer | 1 | Auto-increment |
| `uuid` | uuid | 1 | |
| `revision_id` | integer | 1 | |
| `user_id` | entity_reference (user) | 1 | Owner |
| `status` | list_string | 1 | Values: onboarding, generating, generated, published, expired |
| `onboarding_step` | integer | 1 | Current step (1-5), for save/resume |
| `site_name` | string | 1 | Max 100 chars |
| `tagline` | string | 1 | Max 255 chars |
| `logo` | file | 1 | PNG, JPG, SVG, max 5MB |
| `admin_email` | email | 1 | |
| `industry` | entity_reference (taxonomy_term) | 1 | Reference to industry vocab |
| `industry_other` | text_long | 1 | Free-text for "Other" |
| `color_primary` | string | 1 | Hex color (#RRGGBB) |
| `color_secondary` | string | 1 | Hex color |
| `color_accent` | string | 1 | Hex color |
| `font_heading` | string | 1 | Google Font name |
| `font_body` | string | 1 | Google Font name |
| `reference_urls` | string | 3 | Multi-value |
| `brand_guidelines` | file | 1 | PDF/PNG/JPG, max 10MB |
| `services` | text_long | 1 | Structured text (one per line) |
| `target_audience` | text_long | 1 | Max 500 chars |
| `competitors` | string | 3 | Multi-value |
| `ctas` | string | 5 | Multi-value |
| `industry_answers` | map | 1 | Serialized Q&A pairs |
| `compliance_flags` | list_string | unlimited | hipaa, ada, gdpr, etc. |
| `generation_status` | string | 1 | Current generation step ID |
| `generation_started` | timestamp | 1 | |
| `generation_completed` | timestamp | 1 | |
| `generated_pages` | entity_reference (node) | unlimited | Links to generated nodes |
| `generated_content_types` | string | unlimited | Machine names of content types used |
| `trial_start` | timestamp | 1 | |
| `trial_end` | timestamp | 1 | |
| `subscription_id` | string | 1 | Stripe subscription ID |
| `subscription_status` | list_string | 1 | trial, active, expired, cancelled |
| `created` | created | 1 | |
| `changed` | changed | 1 | |

### 2.2 Shared Content Types (Config Entities)

These are predefined content types shipped as config with the module. The AI agents select which ones to use based on industry.

#### Node Type: `page` (Basic Page)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Body | `body` | text_long (formatted) | No |
| Meta description | via metatag module | - | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

> All node types include `field_site_profile` to associate content with its owner. This is the data isolation key.

#### Node Type: `service`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | Yes |
| Image | `field_image` | image | No |
| CTA Text | `field_cta_text` | string | No |
| CTA Link | `field_cta_link` | link | No |
| Weight | `field_weight` | integer | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `team_member`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Role / Title | `field_role` | string | Yes |
| Bio | `field_bio` | text_long | Yes |
| Photo | `field_photo` | image | No |
| Specialization | `field_specialization` | string | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `testimonial`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Quote | `field_quote` | text_long | Yes |
| Author Name | `field_author_name` | string | Yes |
| Author Role | `field_author_role` | string | No |
| Rating | `field_rating` | integer | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `location`

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Address | `field_address` | address | Yes |
| Phone | `field_phone` | telephone | No |
| Hours | `field_hours` | text_long | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `provider` (Healthcare)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Name | `title` | string | Yes |
| Specialization | `field_specialization` | string | Yes |
| Bio | `field_bio` | text_long | Yes |
| Photo | `field_photo` | image | No |
| Credentials | `field_credentials` | string | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `practice_area` (Legal)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | Yes |
| Icon | `field_icon` | string | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

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
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `menu_item` (Restaurant)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Description | `field_description` | text_long | No |
| Price | `field_price` | string | No |
| Category | `field_menu_category` | entity_reference (taxonomy) | No |
| Dietary Flags | `field_dietary_flags` | list_string | No |
| Image | `field_image` | image | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

#### Node Type: `case_study` (Legal/Professional Services)

| Field | Machine Name | Type | Required |
|-------|-------------|------|----------|
| Title | `title` | string | Yes |
| Summary | `field_summary` | text_long | Yes |
| Outcome | `field_outcome` | text_long | No |
| Client Industry | `field_client_industry` | string | No |
| Site Profile | `field_site_profile` | entity_reference | Yes |

### 2.3 Taxonomy Vocabularies

#### `industry` (Predefined)

| Term | Machine Name | Weight |
|------|-------------|--------|
| Healthcare | healthcare | 0 |
| Legal | legal | 1 |
| Real Estate | real_estate | 2 |
| Restaurant | restaurant | 3 |
| Professional Services | professional_services | 4 |
| Other | other | 5 |

#### `menu_category` (Generated per site, for restaurants)

Dynamic — created by AI agent per restaurant site. Examples: Appetizers, Entrees, Desserts, Beverages.

### 2.4 Content Type → Industry Matrix

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

---

## 3. Plugin Definitions

### 3.1 AI Agent Plugins

All agent plugins implement the AI Agents module's plugin interface. Each is annotated with `@AiAgent`.

#### IndustryAnalyzerAgent

```php
/**
 * @AiAgent(
 *   id = "industry_analyzer",
 *   label = @Translation("Industry Analyzer"),
 *   description = @Translation("Analyzes industry and business context to determine site structure"),
 * )
 */
```

**System prompt context:**
- SiteProfile entity data (industry, services, target audience, industry answers, compliance flags)
- Industry → content type mapping matrix
- Industry → page template mapping

**Tools available:**
- `get_site_profile` — reads the SiteProfile entity data
- `get_industry_templates` — returns predefined page/content-type recommendations per industry

**Output:** Site blueprint stored as serialized data on SiteProfile entity (or as a generation state entity).

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

**System prompt context:**
- Site blueprint (output from IndustryAnalyzerAgent)
- SDC component manifest (generated by ComponentManifestService)

**Tools available (Canvas skills):**
- `canvas_create_page` — creates a node with Canvas layout
- `canvas_add_section` — adds a layout section to a page
- `canvas_place_component` — places an SDC component in a section
- `canvas_set_component_props` — updates props on a placed component
- `canvas_reorder_sections` — reorders sections on a page

#### ContentGeneratorAgent

```php
/**
 * @AiAgent(
 *   id = "content_generator",
 *   label = @Translation("Content Generator"),
 *   description = @Translation("Generates SEO-optimized text content for pages and entities"),
 * )
 */
```

**System prompt context:**
- SiteProfile data (business name, services, target audience, tone, keywords)
- Pages created by PageBuilderAgent (with `{{generate}}` markers)
- Content types to populate

**Tools available:**
- `create_entity` — creates Drupal entity instances (nodes, terms)
- `update_entity_field` — sets field values on entities
- `set_metatag` — sets meta title/description on nodes
- `canvas_set_component_props` — fills `{{generate}}` markers with actual content

#### FormGeneratorAgent

```php
/**
 * @AiAgent(
 *   id = "form_generator",
 *   label = @Translation("Form Generator"),
 *   description = @Translation("Creates webforms with industry-appropriate fields"),
 * )
 */
```

**Tools available:**
- `create_webform` — creates a Webform entity with fields
- `add_webform_element` — adds a form element (textfield, email, select, etc.)
- `configure_webform_handler` — sets up email notification handler
- `canvas_place_component` — embeds the form on a page via Canvas

### 3.2 Queue Worker Plugin

```php
/**
 * @QueueWorker(
 *   id = "site_generation",
 *   title = @Translation("Site Generation Worker"),
 *   cron = {"time" = 300}
 * )
 */
```

Processes generation pipeline steps sequentially. Each queue item contains:
- `site_profile_id` — which site to generate
- `step` — which pipeline step to execute (industry_analysis, page_building, content_generation, form_generation, brand_application)

### 3.3 Access Control Handler

```php
class SiteProfileAccessControlHandler extends EntityAccessControlHandler {
  // Enforces: users can only view/edit/delete their own SiteProfile
  // Platform admins can access all
}
```

Node access is enforced via `hook_node_access` — users can only access nodes where `field_site_profile` references their profile.

---

## 4. Service Layer

### 4.1 Service Definitions (`ai_site_builder.services.yml`)

```yaml
services:
  ai_site_builder.site_generation:
    class: Drupal\ai_site_builder\Service\SiteGenerationService
    arguments:
      - '@entity_type.manager'
      - '@queue'
      - '@event_dispatcher'
      - '@ai_site_builder.component_manifest'
      - '@logger.factory'

  ai_site_builder.brand_tokens:
    class: Drupal\ai_site_builder\Service\BrandTokenService
    arguments:
      - '@file_system'
      - '@entity_type.manager'

  ai_site_builder.component_manifest:
    class: Drupal\ai_site_builder\Service\ComponentManifestService
    arguments:
      - '@plugin.manager.sdc'
      - '@cache.default'

  ai_site_builder.content_population:
    class: Drupal\ai_site_builder\Service\ContentPopulationService
    arguments:
      - '@entity_type.manager'
      - '@ai.provider'

  ai_site_builder_trial.trial_manager:
    class: Drupal\ai_site_builder_trial\Service\TrialManager
    arguments:
      - '@entity_type.manager'
      - '@datetime.time'
      - '@event_dispatcher'

  ai_site_builder_trial.subscription:
    class: Drupal\ai_site_builder_trial\Service\SubscriptionService
    arguments:
      - '@ai_site_builder_trial.trial_manager'
      - '@config.factory'
      - '@logger.factory'

  ai_site_builder_publish.publish:
    class: Drupal\ai_site_builder_publish\Service\PublishService
    arguments:
      - '@entity_type.manager'
      - '@cache_tags.invalidator'
      - '@event_dispatcher'
```

### 4.2 Key Service Interfaces

#### SiteGenerationServiceInterface

```php
interface SiteGenerationServiceInterface {
  /**
   * Dispatches site generation to the queue.
   */
  public function generate(SiteProfileInterface $profile): void;

  /**
   * Returns current generation status.
   */
  public function getStatus(SiteProfileInterface $profile): array;

  /**
   * Retries generation from a specific step.
   */
  public function retry(SiteProfileInterface $profile, ?string $fromStep = NULL): void;
}
```

#### ComponentManifestServiceInterface

```php
interface ComponentManifestServiceInterface {
  /**
   * Returns the SDC component catalog as structured data for AI agents.
   *
   * @return array
   *   Array of component definitions with id, label, props, slots, usage hints.
   */
  public function getManifest(): array;

  /**
   * Returns manifest as formatted text for inclusion in agent system prompts.
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
   * Generates CSS custom properties from SiteProfile brand data.
   *
   * @return string
   *   CSS content with :root custom properties.
   */
  public function generateTokenCss(SiteProfileInterface $profile): string;

  /**
   * Writes the brand token CSS file and attaches it to the site.
   */
  public function applyTokens(SiteProfileInterface $profile): void;
}
```

---

## 5. Drupal Canvas Integration

### 5.1 Canvas Skills as AI Agent Tools

Canvas exposes its operations as AI Agent tools. These are registered as tool plugins within the AI Agents framework:

| Tool ID | Canvas Operation | Parameters |
|---------|-----------------|------------|
| `canvas_create_page` | Create a node with Canvas layout enabled | `title`, `type`, `path` |
| `canvas_add_section` | Add a layout section to a page | `node_id`, `position`, `layout` |
| `canvas_place_component` | Place an SDC component in a section | `node_id`, `section_id`, `component_id`, `props` |
| `canvas_set_component_props` | Update props on a placed component | `node_id`, `component_instance_id`, `props` |
| `canvas_reorder_sections` | Reorder sections within a page | `node_id`, `section_order[]` |
| `canvas_remove_section` | Remove a section from a page | `node_id`, `section_id` |

> These tools are either provided by the Canvas/AI Agents integration or implemented as custom tool plugins in `ai_site_builder` that wrap Canvas's PHP API.

### 5.2 Component Manifest Generation

The `ComponentManifestService` scans the Space theme's SDC directory and builds a machine-readable catalog:

```php
// Scans: themes/contrib/space/components/
// Reads: *.component.yml files
// Builds: structured manifest with props, slots, categories

$manifest = [
  [
    'id' => 'space:hero',
    'label' => 'Hero Banner',
    'category' => 'hero',
    'props' => [
      'headline' => ['type' => 'string', 'required' => TRUE],
      'subheadline' => ['type' => 'string', 'required' => FALSE],
      // ...
    ],
    'usage_hint' => 'Full-width hero section. Use as first section on homepage.',
  ],
  // ...
];
```

This manifest is:
1. Cached (invalidated on theme cache clear)
2. Included in Page Builder Agent's system prompt
3. Used to validate agent tool calls (reject unknown component IDs)

### 5.3 Section-Level Regeneration

For US-021 (Section-Level AI Regeneration), a custom Canvas integration adds a "Regenerate with AI" button to the component toolbar:

1. **Frontend:** JavaScript behavior attached to Canvas editor that adds a button to the component action toolbar
2. **AJAX callback:** Sends component instance ID + optional user guidance to a controller
3. **Backend:** Controller invokes ContentGeneratorAgent with the specific component's context
4. **Response:** Updated component props returned and applied via Canvas API

---

## 6. AI Agent Integration

### 6.1 Generation Pipeline Flow

```php
// SiteGenerationService::generate()
public function generate(SiteProfileInterface $profile): void {
  $profile->set('status', 'generating');
  $profile->set('generation_started', \Drupal::time()->getRequestTime());
  $profile->save();

  // Dispatch pipeline steps as sequential queue items
  $steps = [
    'industry_analysis',
    'page_building',
    'content_generation',
    'form_generation',
    'brand_application',
  ];

  foreach ($steps as $weight => $step) {
    $this->queue->get('site_generation')->createItem([
      'site_profile_id' => $profile->id(),
      'step' => $step,
      'weight' => $weight,
    ]);
  }
}
```

### 6.2 Queue Worker Processing

```php
// SiteGenerationWorker::processItem()
public function processItem($data): void {
  $profile = SiteProfile::load($data['site_profile_id']);
  $profile->set('generation_status', $data['step']);
  $profile->save();

  switch ($data['step']) {
    case 'industry_analysis':
      $this->runAgent('industry_analyzer', $profile);
      break;
    case 'page_building':
      $this->runAgent('page_builder', $profile);
      break;
    case 'content_generation':
      $this->runAgent('content_generator', $profile);
      break;
    case 'form_generation':
      $this->runAgent('form_generator', $profile);
      break;
    case 'brand_application':
      $this->brandTokenService->applyTokens($profile);
      $profile->set('status', 'generated');
      $profile->set('generation_completed', \Drupal::time()->getRequestTime());
      $profile->save();
      break;
  }
}
```

### 6.3 Agent System Prompt Construction

Each agent receives a structured system prompt built from:

1. **Agent-specific instructions** — defined in the plugin annotation or a config file
2. **SiteProfile context** — serialized onboarding data relevant to the agent's task
3. **Previous step output** — results from prior pipeline steps (stored on the entity or in state)
4. **Component manifest** — (Page Builder Agent only) available SDC components
5. **Constraints** — component whitelist, content type definitions, compliance rules

Example system prompt skeleton for ContentGeneratorAgent:

```
You are a content writer for a {industry} business called "{site_name}".

Business context:
- Services: {services}
- Target audience: {target_audience}
- Tone: {tone}
- Keywords: {keywords}

Your task: Generate content for the following pages. For each {{generate}} marker,
write compelling, SEO-optimized content that matches the business context.

Pages to populate:
{page_list_with_generate_markers}

Rules:
- Write in {tone} tone
- Include keywords naturally
- Each page must have a unique meta title (<60 chars) and meta description (<160 chars)
- Use proper heading hierarchy (H1, H2, H3)
- Include compliance disclaimers where compliance_flags indicate: {compliance_flags}
```

---

## 7. Configuration Management

### 7.1 Config Shipped with Module

All content type definitions, field storage, taxonomy vocabularies, and default settings are shipped as YAML config in `config/install/`:

```
config/install/
├── node.type.service.yml
├── node.type.team_member.yml
├── node.type.testimonial.yml
├── node.type.location.yml
├── node.type.provider.yml
├── node.type.practice_area.yml
├── node.type.listing.yml
├── node.type.menu_item.yml
├── node.type.case_study.yml
├── field.storage.node.field_site_profile.yml
├── field.storage.node.field_description.yml
├── field.storage.node.field_image.yml
├── field.storage.node.field_bio.yml
├── ... (all field storage and field instance configs)
├── taxonomy.vocabulary.industry.yml
├── taxonomy.term.industry.*.yml
├── pathauto.pattern.*.yml
├── metatag.metatag_defaults.*.yml
└── ai_site_builder.settings.yml
```

### 7.2 Module Settings Config

```yaml
# ai_site_builder.settings.yml
default_llm_provider: openai
fallback_llm_provider: anthropic
generation_timeout: 300  # seconds
max_generation_retries: 3
supported_industries:
  - healthcare
  - legal
  - real_estate
  - restaurant
  - professional_services
  - other
trial_duration_days: 14
max_reference_urls: 3
max_logo_size_mb: 5
max_brand_guidelines_size_mb: 10
```

### 7.3 Environment-Specific Config

Use config split or environment-specific settings.php overrides:

| Config | Dev | Staging | Production |
|--------|-----|---------|------------|
| LLM provider | OpenAI (gpt-4o-mini for cost) | OpenAI (gpt-4o) | OpenAI (gpt-4o) + Claude fallback |
| Queue backend | Database | Database | Redis |
| Cache backend | Database | Redis | Redis |
| Email | Mailhog (local) | SMTP (test) | SMTP (production) |
| Stripe | Test keys | Test keys | Live keys |

---

## 8. Permissions & Roles

### 8.1 Roles

| Role | Purpose |
|------|---------|
| `site_owner` | End users who build sites. Access to wizard, Canvas editing, publishing. |
| `platform_admin` | Internal team. Full Drupal admin access, user management, monitoring. |
| `anonymous` | Public visitors viewing published sites. |

### 8.2 Custom Permissions

```yaml
# ai_site_builder.permissions.yml
access onboarding wizard:
  title: 'Access the onboarding wizard'
  description: 'Allows users to start the site building onboarding flow.'

generate site:
  title: 'Generate a site'
  description: 'Allows users to trigger AI site generation.'

edit own site content:
  title: 'Edit own site content'
  description: 'Allows users to edit content belonging to their site profile.'

publish own site:
  title: 'Publish own site'
  description: 'Allows users to publish/unpublish their generated site.'

regenerate site section:
  title: 'Regenerate site section'
  description: 'Allows users to trigger AI regeneration of a page section.'

administer site profiles:
  title: 'Administer all site profiles'
  description: 'Full access to all site profiles (platform admin).'
  restrict access: true
```

### 8.3 Permission Matrix

| Permission | Anonymous | Site Owner | Platform Admin |
|-----------|:---------:|:----------:|:--------------:|
| View published site content | x | x | x |
| Access onboarding wizard | | x | x |
| Generate site | | x | x |
| Edit own site content | | x | x |
| Publish own site | | x | x |
| Regenerate site section | | x | x |
| Use Canvas editor | | x | x |
| Access Drupal admin (/admin) | | | x |
| Administer site profiles | | | x |
| Administer content types | | | x |
| View all form submissions | | | x |
| View own form submissions | | x | x |

### 8.4 Node Access

Content isolation enforced via `hook_node_access`:

```php
function ai_site_builder_node_access(NodeInterface $node, $op, AccountInterface $account) {
  if ($node->hasField('field_site_profile') && !$node->get('field_site_profile')->isEmpty()) {
    $site_profile = $node->get('field_site_profile')->entity;
    if ($site_profile && $site_profile->getOwnerId() === $account->id()) {
      return AccessResult::allowed()->cachePerUser()->addCacheableDependency($node);
    }
    if ($account->hasPermission('administer site profiles')) {
      return AccessResult::allowed()->cachePerPermissions();
    }
    return AccessResult::forbidden()->cachePerUser();
  }
  return AccessResult::neutral();
}
```

---

## 9. API Layer

### 9.1 Internal Routes (Not Public API)

No public API for MVP. All routes are internal Drupal routes:

| Route | Method | Controller | Purpose |
|-------|--------|-----------|---------|
| `/onboarding` | GET | OnboardingController | Render wizard |
| `/onboarding/step/{step}` | GET/POST | OnboardingController | Individual wizard steps |
| `/generate` | POST | SiteGenerateForm | Trigger generation |
| `/api/generation/{site_profile}/status` | GET | GenerationStatusController | Poll generation progress |
| `/site/preview` | GET | SitePreviewController | Preview generated site |
| `/site/publish` | POST | PublishController | One-click publish |
| `/site/regenerate/{component_id}` | POST | RegenerateController | Section-level regeneration |
| `/subscription/webhook` | POST | SubscriptionController | Stripe webhook handler |

### 9.2 Generation Status Response

```php
// GenerationStatusController::status()
return new JsonResponse([
  'status' => $profile->get('status')->value,
  'current_step' => $profile->get('generation_status')->value,
  'steps' => [
    ['id' => 'industry_analysis', 'label' => 'Analyzing your industry...', 'status' => 'completed'],
    ['id' => 'page_building', 'label' => 'Designing page layouts...', 'status' => 'in_progress'],
    ['id' => 'content_generation', 'label' => 'Writing content...', 'status' => 'pending'],
    ['id' => 'form_generation', 'label' => 'Creating forms...', 'status' => 'pending'],
    ['id' => 'brand_application', 'label' => 'Applying your brand...', 'status' => 'pending'],
  ],
  'progress_percent' => $this->calculateProgress($profile),
]);
```

---

*Next step: See backlog tasks in `project-management/backlog/` for implementation breakdown. Invoke `/tpm sprint` to plan sprints, or `/dev TASK-NNN` to begin implementation.*
