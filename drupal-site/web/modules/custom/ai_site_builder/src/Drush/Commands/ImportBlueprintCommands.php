<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Drush\Commands;

use Drupal\ai_site_builder\Service\BlueprintImportServiceInterface;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Drush command for importing blueprint JSON into Drupal entities.
 */
final class ImportBlueprintCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs an ImportBlueprintCommands object.
   */
  public function __construct(
    #[Autowire(service: 'ai_site_builder.blueprint_import')]
    protected BlueprintImportServiceInterface $blueprintImport,
  ) {
    parent::__construct();
  }

  /**
   * Import a blueprint JSON file into Drupal entities.
   *
   * Creates canvas_page entities with component trees, content nodes,
   * webforms, and main menu from the blueprint data.
   */
  #[CLI\Command(name: 'ai-site-builder:import-blueprint', aliases: ['aisb:ib'])]
  #[CLI\Option(name: 'json', description: 'Path to the blueprint JSON file.')]
  #[CLI\Usage(name: 'drush ai-site-builder:import-blueprint --json=/tmp/blueprint.json', description: 'Import blueprint from JSON file.')]
  public function importBlueprint(array $options = ['json' => self::REQ]): void {
    $jsonPath = $options['json'];

    if (!file_exists($jsonPath)) {
      throw new \RuntimeException(sprintf('Blueprint file not found: %s', $jsonPath));
    }

    $this->logger()->notice(dt('Parsing blueprint from @path...', ['@path' => $jsonPath]));

    $result = $this->blueprintImport->parseBlueprint($jsonPath);

    $this->logger()->notice(dt('Importing site metadata...'));
    $this->blueprintImport->importSite($result->site);

    $pageCount = count($result->pages);
    $this->logger()->notice(dt('Importing @count pages...', ['@count' => $pageCount]));
    $this->blueprintImport->importPages($result->pages);

    if (!empty($result->content)) {
      $contentTypes = array_keys($result->content);
      $this->logger()->notice(dt('Importing content: @types', ['@types' => implode(', ', $contentTypes)]));
      $this->blueprintImport->importContent($result->content);
    }

    if (!empty($result->forms)) {
      $formIds = array_keys($result->forms);
      $this->logger()->notice(dt('Importing forms: @forms', ['@forms' => implode(', ', $formIds)]));
      $this->blueprintImport->importForms($result->forms);
    }

    $this->logger()->success(dt('Blueprint import complete.'));
  }

}
