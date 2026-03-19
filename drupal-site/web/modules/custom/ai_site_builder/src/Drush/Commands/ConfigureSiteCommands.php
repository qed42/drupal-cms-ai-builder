<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Drush\Commands;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Routing\RouteBuilderInterface;
use Drupal\pathauto\AliasTypeBatchUpdateInterface;
use Drupal\pathauto\AliasTypeManager;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Drush command for final site configuration after import.
 */
final class ConfigureSiteCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs a ConfigureSiteCommands object.
   */
  public function __construct(
    protected ModuleHandlerInterface $moduleHandler,
    protected RouteBuilderInterface $routeBuilder,
    #[Autowire(service: 'plugin.manager.alias_type')]
    protected ?AliasTypeManager $aliasTypeManager,
  ) {
    parent::__construct();
  }

  /**
   * Run final site configuration after blueprint and brand import.
   *
   * Rebuilds router, triggers pathauto bulk generation, and clears caches.
   */
  #[CLI\Command(name: 'ai-site-builder:configure-site', aliases: ['aisb:cs'])]
  #[CLI\Usage(name: 'drush ai-site-builder:configure-site', description: 'Run final site configuration.')]
  public function configureSite(): void {
    // Rebuild the router to pick up new paths.
    $this->logger()->notice(dt('Rebuilding routes...'));
    $this->routeBuilder->rebuild();

    // Trigger pathauto bulk update for all content if available.
    if ($this->moduleHandler->moduleExists('pathauto') && $this->aliasTypeManager) {
      $this->logger()->notice(dt('Running pathauto bulk alias generation...'));
      $this->runPathautoUpdate();
    }

    // Clear all caches.
    $this->logger()->notice(dt('Clearing caches...'));
    drupal_flush_all_caches();

    $this->logger()->success(dt('Site configuration complete.'));
  }

  /**
   * Runs pathauto bulk alias generation for all entity types.
   *
   * Uses a persistent context per alias type, looping until each
   * type reports finished, matching Batch API expectations.
   */
  protected function runPathautoUpdate(): void {
    $definitions = $this->aliasTypeManager->getDefinitions();

    foreach (array_keys($definitions) as $id) {
      try {
        $aliasType = $this->aliasTypeManager->createInstance($id);
        if (!$aliasType instanceof AliasTypeBatchUpdateInterface) {
          continue;
        }

        // Simulate batch context — loop until the alias type is done.
        $context = [];
        do {
          $aliasType->batchUpdate('create', $context);
        } while (!isset($context['finished']) || $context['finished'] < 1);
      }
      catch (\Exception $e) {
        $this->logger()->warning(dt('Skipping alias type @id: @message', [
          '@id' => $id,
          '@message' => $e->getMessage(),
        ]));
      }
    }
  }

}
