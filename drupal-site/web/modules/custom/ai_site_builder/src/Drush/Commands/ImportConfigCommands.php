<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Drush\Commands;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Drush command for importing industry-specific content type configurations.
 */
final class ImportConfigCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs an ImportConfigCommands object.
   */
  public function __construct(
    protected ConfigFactoryInterface $configFactory,
    protected ModuleInstallerInterface $moduleInstaller,
    protected ModuleHandlerInterface $moduleHandler,
  ) {
    parent::__construct();
  }

  /**
   * Import industry-specific content type configurations.
   *
   * Enables the ai_site_builder_content submodule which installs all
   * content type configs. The industry mapping is stored in module config
   * for use by other services.
   */
  #[CLI\Command(name: 'ai-site-builder:import-config', aliases: ['aisb:ic'])]
  #[CLI\Option(name: 'industry', description: 'Industry type (e.g., healthcare, legal, real_estate, restaurant, professional_services).')]
  #[CLI\Usage(name: 'drush ai-site-builder:import-config --industry=healthcare', description: 'Install healthcare content types.')]
  public function importConfig(array $options = ['industry' => 'professional_services']): void {
    $industry = $options['industry'];

    // Validate industry against known types.
    $industryConfig = $this->configFactory->get('ai_site_builder.industry_content_types');
    $validIndustries = array_keys($industryConfig->getRawData());
    // Remove _core key if present.
    $validIndustries = array_filter($validIndustries, fn($k) => $k !== '_core');

    if (!in_array($industry, $validIndustries, TRUE)) {
      $this->logger()->warning(dt('Unknown industry "@industry". Using universal content types only. Valid: @valid', [
        '@industry' => $industry,
        '@valid' => implode(', ', $validIndustries),
      ]));
    }

    // Store the selected industry in module settings for later use.
    $this->configFactory->getEditable('ai_site_builder.settings')
      ->set('industry', $industry)
      ->save();

    // Enable the content submodule which installs all content type configs.
    if (!$this->moduleHandler->moduleExists('ai_site_builder_content')) {
      $this->moduleInstaller->install(['ai_site_builder_content']);
      $this->logger()->success(dt('Enabled ai_site_builder_content module with all content type configs.'));
    }
    else {
      $this->logger()->notice(dt('ai_site_builder_content module already enabled.'));
    }

    $this->logger()->success(dt('Industry config imported for "@industry".', ['@industry' => $industry]));
  }

}
