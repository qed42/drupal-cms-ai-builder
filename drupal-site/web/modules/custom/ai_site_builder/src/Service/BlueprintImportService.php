<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\ai_site_builder\BlueprintImportResult;
use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
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

    $this->logger->info('Blueprint import complete.');
  }

  /**
   * Prepares a component tree array for canvas_page entity creation.
   *
   * Validates component versions against the Canvas component registry
   * and ensures the tree structure is in the expected format.
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

      $prepared[] = [
        'uuid' => $item['uuid'],
        'component_id' => $item['component_id'],
        'component_version' => $item['component_version'] ?? '',
        'parent_uuid' => $item['parent_uuid'] ?? NULL,
        'slot' => $item['slot'] ?? NULL,
        'inputs' => $item['inputs'] ?? [],
      ];
    }

    return $prepared;
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

}
