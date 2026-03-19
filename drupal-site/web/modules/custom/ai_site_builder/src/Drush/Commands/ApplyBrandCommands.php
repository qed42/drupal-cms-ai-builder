<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Drush\Commands;

use Drupal\ai_site_builder\Service\BrandTokenServiceInterface;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Drush command for applying brand tokens to the site.
 */
final class ApplyBrandCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs an ApplyBrandCommands object.
   */
  public function __construct(
    #[Autowire(service: 'ai_site_builder.brand_token')]
    protected BrandTokenServiceInterface $brandTokenService,
  ) {
    parent::__construct();
  }

  /**
   * Apply brand tokens from a JSON file.
   *
   * Generates CSS custom properties for Space DS theme variables,
   * copies logo and custom fonts, and writes brand-tokens.css.
   */
  #[CLI\Command(name: 'ai-site-builder:apply-brand', aliases: ['aisb:ab'])]
  #[CLI\Option(name: 'tokens', description: 'Path to the tokens.json file.')]
  #[CLI\Usage(name: 'drush ai-site-builder:apply-brand --tokens=/tmp/tokens.json', description: 'Apply brand tokens from JSON file.')]
  public function applyBrand(array $options = ['tokens' => self::REQ]): void {
    $tokensPath = $options['tokens'];

    if (!file_exists($tokensPath)) {
      throw new \RuntimeException(sprintf('Tokens file not found: %s', $tokensPath));
    }

    $this->logger()->notice(dt('Applying brand tokens from @path...', ['@path' => $tokensPath]));
    $this->brandTokenService->applyTokens($tokensPath);
    $this->logger()->success(dt('Brand tokens applied successfully. CSS written to public://css/brand-tokens.css'));
  }

}
