<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\ai_site_builder\BlueprintImportResult;
use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Menu\MenuLinkManagerInterface;
use Drupal\system\Entity\Menu;
use Psr\Log\LoggerInterface;

/**
 * Service for importing blueprint JSON into Drupal entities.
 *
 * Creates canvas_page entities with pre-built component trees,
 * content nodes, webforms, and main menu from blueprint data.
 */
class BlueprintImportService implements BlueprintImportServiceInterface {

  /**
   * The logger channel.
   */
  protected LoggerInterface $logger;

  /**
   * Mapping from blueprint content keys to Drupal node bundle names.
   */
  protected const CONTENT_TYPE_MAP = [
    'services' => 'service',
    'team_members' => 'team_member',
    'testimonials' => 'testimonial',
    'providers' => 'provider',
    'locations' => 'location',
    'practice_areas' => 'practice_area',
    'case_studies' => 'case_study',
    'listings' => 'listing',
    'menu_items' => 'menu_item',
  ];

  /**
   * Mapping from blueprint field names to Drupal field names.
   *
   * Keys not in this map are prefixed with 'field_' automatically.
   */
  protected const FIELD_MAP = [
    'title' => 'title',
    'body' => 'body',
    'description' => 'body',
  ];

  /**
   * Webform element type mapping from blueprint to Webform.
   */
  protected const WEBFORM_TYPE_MAP = [
    'text' => 'textfield',
    'email' => 'email',
    'tel' => 'tel',
    'textarea' => 'textarea',
    'select' => 'select',
    'checkbox' => 'checkbox',
  ];

  /**
   * Constructs a BlueprintImportService.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected ConfigFactoryInterface $configFactory,
    protected MenuLinkManagerInterface $menuLinkManager,
    protected ?PluginManagerInterface $webformHandlerManager,
    LoggerChannelFactoryInterface $loggerFactory,
    protected ?FileSystemInterface $fileSystem = NULL,
  ) {
    $this->logger = $loggerFactory->get('ai_site_builder');
  }

  /**
   * {@inheritdoc}
   */
  public function parseBlueprint(string $jsonPath): BlueprintImportResult {
    if (!file_exists($jsonPath) || !is_readable($jsonPath)) {
      throw new \RuntimeException(sprintf('Blueprint file not found or not readable: %s', $jsonPath));
    }

    $json = file_get_contents($jsonPath);
    if ($json === FALSE) {
      throw new \RuntimeException(sprintf('Failed to read blueprint file: %s', $jsonPath));
    }

    $data = json_decode($json, TRUE);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new \RuntimeException(sprintf('Invalid JSON in blueprint file: %s', json_last_error_msg()));
    }

    if (empty($data['site']) || empty($data['pages'])) {
      throw new \RuntimeException('Blueprint JSON must contain at least "site" and "pages" keys.');
    }

    return new BlueprintImportResult(
      site: $data['site'] ?? [],
      brand: $data['brand'] ?? [],
      pages: $data['pages'] ?? [],
      content: $data['content'] ?? [],
      forms: $data['forms'] ?? [],
      header: $data['header'] ?? [],
      footer: $data['footer'] ?? [],
    );
  }

  /**
   * {@inheritdoc}
   */
  public function importSite(array $siteData): void {
    $config = $this->configFactory->getEditable('system.site');

    if (!empty($siteData['name'])) {
      $config->set('name', $siteData['name']);
      $this->logger->info('Site name set to "@name".', ['@name' => $siteData['name']]);
    }

    if (!empty($siteData['tagline'])) {
      $config->set('slogan', $siteData['tagline']);
      $this->logger->info('Site slogan set to "@slogan".', ['@slogan' => $siteData['tagline']]);
    }

    $config->save();
  }

  /**
   * {@inheritdoc}
   */
  public function importPages(array $pages): void {
    if (empty($pages)) {
      return;
    }

    $pageStorage = $this->entityTypeManager->getStorage('canvas_page');
    $createdPages = [];

    foreach ($pages as $weight => $pageData) {
      $title = $pageData['title'] ?? 'Untitled';
      $slug = $pageData['slug'] ?? '';

      $values = [
        'title' => $title,
        'status' => TRUE,
      ];

      // Set meta description if provided.
      if (!empty($pageData['seo']['meta_description'])) {
        $values['description'] = $pageData['seo']['meta_description'];
      }

      // Set path alias from slug.
      if (!empty($slug)) {
        $values['path'] = ['alias' => '/' . ltrim($slug, '/')];
      }

      // Set component tree if provided.
      if (!empty($pageData['component_tree'])) {
        $values['components'] = $this->prepareComponentTree($pageData['component_tree']);
      }

      $page = $pageStorage->create($values);
      $page->save();

      $createdPages[] = [
        'entity' => $page,
        'title' => $title,
        'slug' => $slug,
        'weight' => $weight,
      ];

      $this->logger->info('Created canvas_page "@title" (id: @id).', [
        '@title' => $title,
        '@id' => $page->id(),
      ]);
    }

    // Set front page to first page (home).
    if (!empty($createdPages)) {
      $firstPage = $createdPages[0]['entity'];
      $frontPagePath = '/page/' . $firstPage->id();
      if (!empty($createdPages[0]['slug'])) {
        $frontPagePath = '/' . ltrim($createdPages[0]['slug'], '/');
      }
      $this->configFactory->getEditable('system.site')
        ->set('page.front', $frontPagePath)
        ->save();
      $this->logger->info('Front page set to "@path".', ['@path' => $frontPagePath]);
    }

    // Build main menu from page list.
    $this->buildMainMenu($createdPages);
  }

  /**
   * {@inheritdoc}
   */
  public function importContent(array $content): void {
    if (empty($content)) {
      return;
    }

    $nodeStorage = $this->entityTypeManager->getStorage('node');

    foreach ($content as $contentKey => $items) {
      if (empty($items) || !is_array($items)) {
        continue;
      }

      $bundle = self::CONTENT_TYPE_MAP[$contentKey] ?? NULL;
      if ($bundle === NULL) {
        $this->logger->warning('Unknown content type key "@key", skipping.', ['@key' => $contentKey]);
        continue;
      }

      // Check if the node type exists.
      $nodeType = $this->entityTypeManager->getStorage('node_type')->load($bundle);
      if (!$nodeType) {
        $this->logger->warning('Node type "@bundle" not installed, skipping @key content.', [
          '@bundle' => $bundle,
          '@key' => $contentKey,
        ]);
        continue;
      }

      foreach ($items as $item) {
        if (empty($item['title'])) {
          continue;
        }

        $values = [
          'type' => $bundle,
          'title' => $item['title'],
          'status' => TRUE,
        ];

        // Map remaining fields.
        foreach ($item as $fieldName => $fieldValue) {
          if ($fieldName === 'title') {
            continue;
          }

          $drupalField = self::FIELD_MAP[$fieldName] ?? 'field_' . $fieldName;

          // Handle body/description as formatted text.
          if ($drupalField === 'body') {
            $values[$drupalField] = [
              'value' => $fieldValue,
              'format' => 'basic_html',
            ];
          }
          else {
            $values[$drupalField] = $fieldValue;
          }
        }

        $node = $nodeStorage->create($values);
        $node->save();

        $this->logger->info('Created @bundle "@title" (nid: @nid).', [
          '@bundle' => $bundle,
          '@title' => $item['title'],
          '@nid' => $node->id(),
        ]);
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function importForms(array $forms): void {
    if (empty($forms)) {
      return;
    }

    // Check if webform module is available.
    if (!$this->entityTypeManager->hasDefinition('webform')) {
      $this->logger->warning('Webform module not enabled, skipping form import.');
      return;
    }

    $webformStorage = $this->entityTypeManager->getStorage('webform');

    foreach ($forms as $formId => $formData) {
      if (empty($formData['fields'])) {
        continue;
      }

      $machineName = 'ai_' . preg_replace('/[^a-z0-9_]/', '_', strtolower($formId));

      // Build webform elements array.
      $elements = [];
      foreach ($formData['fields'] as $field) {
        $name = $field['name'] ?? '';
        if (empty($name)) {
          continue;
        }

        $type = self::WEBFORM_TYPE_MAP[$field['type'] ?? 'text'] ?? 'textfield';
        $element = [
          '#type' => $type,
          '#title' => $field['label'] ?? ucfirst($name),
          '#required' => $field['required'] ?? FALSE,
        ];

        // Add options for select elements.
        if ($type === 'select' && !empty($field['options'])) {
          $options = [];
          foreach ($field['options'] as $option) {
            $options[$option] = $option;
          }
          $element['#options'] = $options;
        }

        $elements[$name] = $element;
      }

      // Add submit button.
      $elements['actions'] = [
        '#type' => 'webform_actions',
        '#title' => 'Submit button(s)',
      ];

      // Check if webform already exists.
      $existing = $webformStorage->load($machineName);
      if ($existing) {
        $existing->setElements($elements);
        $existing->save();
        $this->logger->info('Updated webform "@id".', ['@id' => $machineName]);
        continue;
      }

      $confirmationMessage = $formData['confirmation_message']
        ?? 'Thank you for your submission. We will get back to you soon.';

      $webform = $webformStorage->create([
        'id' => $machineName,
        'title' => ucfirst($formId) . ' Form',
        'status' => 'open',
        'elements' => $elements,
        'settings' => [
          'confirmation_type' => 'message',
          'confirmation_message' => $confirmationMessage,
        ],
      ]);

      // Add email handler for submission notifications.
      if ($this->webformHandlerManager) {
        $formTitle = ucfirst($formId);
        $webform->addWebformHandler($this->webformHandlerManager->createInstance('email', [
          'id' => 'email_notification',
          'label' => 'Email notification',
          'handler_id' => 'email_notification',
          'status' => TRUE,
          'weight' => 0,
          'settings' => [
            'to_mail' => '[site:mail]',
            'from_mail' => '[site:mail]',
            'subject' => "New {$formTitle} form submission from [webform_submission:values:name:raw]",
            'body' => "[webform_submission:values]",
            'reply_to' => '[webform_submission:values:email:raw]',
          ],
        ]));
      }

      $webform->save();
      $this->logger->info('Created webform "@id".', ['@id' => $machineName]);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function importAll(string $jsonPath): void {
    $result = $this->parseBlueprint($jsonPath);

    $this->importSite($result->site);
    $this->importPages($result->pages);
    $this->importContent($result->content);
    $this->importForms($result->forms);
    $this->importHeaderFooter($result->header, $result->footer);

    $this->logger->info('Blueprint import complete.');
  }

  /**
   * Imports header and footer as canvas_page entities.
   *
   * Header and footer are created as special canvas_page entities with
   * component trees. They are stored with reserved slugs '__header' and
   * '__footer' so the theme can identify and render them in the appropriate
   * regions.
   *
   * @param array $headerData
   *   The header configuration with 'component_tree' key.
   * @param array $footerData
   *   The footer configuration with 'component_tree' key.
   */
  public function importHeaderFooter(array $headerData, array $footerData): void {
    $pageStorage = $this->entityTypeManager->getStorage('canvas_page');

    // Import header.
    if (!empty($headerData['component_tree'])) {
      $headerValues = [
        'title' => 'Header',
        'status' => TRUE,
        'path' => ['alias' => '/__header'],
        'components' => $this->prepareComponentTree($headerData['component_tree']),
      ];
      $headerPage = $pageStorage->create($headerValues);
      $headerPage->save();

      // Store header page ID in site config for theme consumption.
      $this->configFactory->getEditable('ai_site_builder.layout')
        ->set('header_page_id', (int) $headerPage->id())
        ->save();

      $this->logger->info('Created header canvas_page (id: @id).', [
        '@id' => $headerPage->id(),
      ]);
    }

    // Import footer.
    if (!empty($footerData['component_tree'])) {
      $footerValues = [
        'title' => 'Footer',
        'status' => TRUE,
        'path' => ['alias' => '/__footer'],
        'components' => $this->prepareComponentTree($footerData['component_tree']),
      ];
      $footerPage = $pageStorage->create($footerValues);
      $footerPage->save();

      // Store footer page ID in site config for theme consumption.
      $this->configFactory->getEditable('ai_site_builder.layout')
        ->set('footer_page_id', (int) $footerPage->id())
        ->save();

      $this->logger->info('Created footer canvas_page (id: @id).', [
        '@id' => $footerPage->id(),
      ]);
    }
  }

  /**
   * Prepares a component tree array for canvas_page entity creation.
   *
   * The v2 component tree uses slot-based composition with nested structures:
   * - container -> content slot -> section-heading, flexi
   * - flexi -> column_one/two/three/four slots -> atoms (heading, text, image)
   * - slider -> slide_item slot -> testimony-card, imagecard, etc.
   * - accordion -> content slot -> accordion-item children
   *
   * The tree is stored as a flat array with parent_uuid/slot references,
   * supporting arbitrary nesting depth. Each item is processed independently:
   * - N-level nesting works because the loop is flat (no recursion needed).
   * - Multiple children in the same slot are supported (same parent_uuid+slot).
   * - Image resolution works per-component via resolveImageInputs().
   * - HTML content in text props (contentMediaType: text/html) is preserved
   *   as-is since inputs are passed through to Canvas without sanitization.
   *
   * Component versions are resolved from the Drupal Canvas registry at import
   * time via getActiveVersion(), so placeholder hashes from the blueprint are
   * replaced with the actual installed version.
   *
   * @param array $tree
   *   The component tree array from the blueprint JSON.
   *
   * @return array
   *   The prepared component tree for entity creation.
   */
  protected function prepareComponentTree(array $tree): array {
    $componentStorage = $this->entityTypeManager->getStorage('component');
    $prepared = [];

    foreach ($tree as $item) {
      if (empty($item['component_id']) || empty($item['uuid'])) {
        $this->logger->warning('Skipping component tree item with missing component_id or uuid.');
        continue;
      }

      // Resolve component version from the registry if not provided or stale.
      $componentEntity = $componentStorage->load($item['component_id']);
      if ($componentEntity) {
        $item['component_version'] = $componentEntity->getActiveVersion();
      }
      else {
        $this->logger->warning('Component "@id" not found in registry, using provided version.', [
          '@id' => $item['component_id'],
        ]);
      }

      // Resolve image inputs: convert { src, alt } to { target_id, alt }.
      $inputs = $item['inputs'] ?? [];
      if ($componentEntity) {
        $inputs = $this->resolveImageInputs($inputs, $componentEntity);
      }

      // Strip NULL and empty-object inputs so Canvas uses component defaults.
      $inputs = $this->stripNullInputs($inputs, $item['component_id']);

      $prepared[] = [
        'uuid' => $item['uuid'],
        'component_id' => $item['component_id'],
        'component_version' => $item['component_version'] ?? '',
        'parent_uuid' => $item['parent_uuid'] ?? NULL,
        'slot' => $item['slot'] ?? NULL,
        'inputs' => $inputs,
      ];
    }

    return $prepared;
  }

  /**
   * Strips NULL and empty-object inputs from component props.
   *
   * NULL values in Canvas override the component's default, preventing it
   * from rendering correctly. Removing them lets Canvas fall back to the
   * defaults defined in the .component.yml file.
   *
   * @param array $inputs
   *   The component inputs.
   * @param string $componentId
   *   The component ID for logging.
   *
   * @return array
   *   The filtered inputs with NULL/empty values removed.
   */
  protected function stripNullInputs(array $inputs, string $componentId): array {
    $filtered = [];
    foreach ($inputs as $key => $value) {
      if ($value === NULL) {
        $this->logger->info('Stripped NULL prop "@prop" from @component.', [
          '@prop' => $key,
          '@component' => $componentId,
        ]);
        continue;
      }
      if (is_array($value) && empty($value)) {
        $this->logger->info('Stripped empty prop "@prop" from @component.', [
          '@prop' => $key,
          '@component' => $componentId,
        ]);
        continue;
      }
      $filtered[$key] = $value;
    }
    return $filtered;
  }

  /**
   * Resolves image-type inputs from raw { src, alt } to { target_id, alt }.
   *
   * Canvas stores image props using Drupal's image field type, which expects
   * a file entity reference (target_id). This method detects image props via
   * the component's prop_field_definitions, creates file entities for the
   * physical files, and returns the corrected inputs.
   *
   * @param array $inputs
   *   The raw component inputs from the blueprint.
   * @param \Drupal\Core\Entity\EntityInterface $componentEntity
   *   The Canvas Component config entity.
   *
   * @return array
   *   The inputs with image props resolved to file entity references.
   */
  protected function resolveImageInputs(array $inputs, $componentEntity): array {
    $settings = $componentEntity->getSettings();
    $propFieldDefs = $settings['prop_field_definitions'] ?? [];

    foreach ($propFieldDefs as $propName => $def) {
      // Canvas maps image schema refs to entity_reference targeting media.
      if (($def['field_type'] ?? '') !== 'entity_reference'
          || ($def['field_storage_settings']['target_type'] ?? '') !== 'media') {
        continue;
      }

      if (!isset($inputs[$propName]) || !is_array($inputs[$propName])) {
        continue;
      }

      $imageData = $inputs[$propName];

      // Skip if already in Canvas format (has sourceType or is a scalar ID).
      if (isset($imageData['sourceType']) || isset($imageData['target_id'])) {
        continue;
      }

      // Must have a src to create a media entity.
      if (empty($imageData['src'])) {
        continue;
      }

      $mediaId = $this->createMediaEntityFromImage($imageData['src'], $imageData['alt'] ?? '');
      if ($mediaId === NULL) {
        $this->logger->warning('Could not create media entity for image "@src" in prop "@prop".', [
          '@src' => $imageData['src'],
          '@prop' => $propName,
        ]);
        continue;
      }

      // Replace with collapsed entity_reference value (just the media ID).
      $inputs[$propName] = $mediaId;

      $this->logger->info('Resolved image prop "@prop": created media entity @mid for "@src".', [
        '@prop' => $propName,
        '@mid' => $mediaId,
        '@src' => $imageData['src'],
      ]);
    }

    return $inputs;
  }

  /**
   * Creates a Drupal media entity (type: image) for a web-accessible file.
   *
   * Canvas image props use entity_reference to media entities. This method
   * creates both the file entity and media entity wrapper.
   *
   * @param string $webPath
   *   The web-relative path (e.g., /sites/example.com/files/stock/img.jpg).
   * @param string $alt
   *   The alt text for the image.
   *
   * @return int|null
   *   The media entity ID, or NULL if creation failed.
   */
  protected function createMediaEntityFromImage(string $webPath, string $alt): ?int {
    // Convert web path to stream wrapper URI.
    // Pattern: /sites/{domain}/files/{path} → public://{path}
    if (preg_match('#/sites/[^/]+/files/(.+)$#', $webPath, $matches)) {
      $uri = 'public://' . $matches[1];
    }
    else {
      $uri = $webPath;
    }

    $filename = basename($webPath);
    $mime = $this->guessMimeType($filename);

    try {
      // Create file entity.
      $fileStorage = $this->entityTypeManager->getStorage('file');
      $file = $fileStorage->create([
        'uri' => $uri,
        'filename' => $filename,
        'filemime' => $mime,
        'status' => 1,
      ]);
      $file->save();

      // Create media entity wrapping the file.
      $mediaStorage = $this->entityTypeManager->getStorage('media');
      $media = $mediaStorage->create([
        'bundle' => 'image',
        'name' => $alt ?: $filename,
        'field_media_image' => [
          'target_id' => $file->id(),
          'alt' => $alt,
        ],
        'status' => 1,
      ]);
      $media->save();

      return (int) $media->id();
    }
    catch (\Exception $e) {
      $this->logger->error('Failed to create media entity for "@path": @error', [
        '@path' => $webPath,
        '@error' => $e->getMessage(),
      ]);
      return NULL;
    }
  }

  /**
   * Guesses MIME type from filename extension.
   *
   * @param string $filename
   *   The filename.
   *
   * @return string
   *   The guessed MIME type.
   */
  protected function guessMimeType(string $filename): string {
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return match ($extension) {
      'jpg', 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'gif' => 'image/gif',
      'webp' => 'image/webp',
      'svg' => 'image/svg+xml',
      'avif' => 'image/avif',
      default => 'application/octet-stream',
    };
  }

  /**
   * Builds the main navigation menu from created pages.
   *
   * @param array $createdPages
   *   Array of created page data with 'entity', 'title', 'slug', 'weight'.
   */
  protected function buildMainMenu(array $createdPages): void {
    // Ensure main menu exists.
    $menu = Menu::load('main');
    if (!$menu) {
      $this->logger->warning('Main menu not found, skipping menu creation.');
      return;
    }

    $menuLinkStorage = $this->entityTypeManager->getStorage('menu_link_content');

    // Remove all existing menu links in the main menu to prevent duplicates.
    // Drupal CMS (via the standard profile) ships with a default "Home" link
    // (standard.front_page) that duplicates the Home link from the blueprint.
    $this->clearMainMenuLinks($menuLinkStorage);

    foreach ($createdPages as $pageInfo) {
      $entity = $pageInfo['entity'];
      $uri = 'internal:/page/' . $entity->id();

      $menuLink = $menuLinkStorage->create([
        'title' => $pageInfo['title'],
        'link' => ['uri' => $uri],
        'menu_name' => 'main',
        'weight' => $pageInfo['weight'],
        'expanded' => FALSE,
      ]);
      $menuLink->save();
    }

    $this->logger->info('Main menu built with @count links.', [
      '@count' => count($createdPages),
    ]);
  }

  /**
   * Removes all existing links from the main menu.
   *
   * Handles both content menu links (menu_link_content entities) and
   * system-defined static menu links from any install profile (standard,
   * drupal_cms_installer, etc.). This prevents duplicate Home entries when
   * the blueprint import creates its own menu links.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $menuLinkStorage
   *   The menu_link_content entity storage.
   */
  protected function clearMainMenuLinks(EntityStorageInterface $menuLinkStorage): void {
    // Remove content-based menu links (menu_link_content entities).
    $existingLinks = $menuLinkStorage->loadByProperties(['menu_name' => 'main']);
    if (!empty($existingLinks)) {
      $menuLinkStorage->delete($existingLinks);
      $this->logger->info('Removed @count existing content menu links from main menu.', [
        '@count' => count($existingLinks),
      ]);
    }

    // Remove system-defined (static) menu links in the main menu.
    // The standard profile defines 'standard.front_page'; other profiles may
    // define their own. The drupal_cms_installer profile uses content-based
    // menu links (handled above) rather than static links, but we check for
    // the standard profile's link as a safety net for all install profiles.
    if ($this->menuLinkManager->hasDefinition('standard.front_page')) {
      $this->menuLinkManager->removeDefinition('standard.front_page');
      $this->logger->info('Removed static menu link "standard.front_page" from main menu.');
    }
  }

}
