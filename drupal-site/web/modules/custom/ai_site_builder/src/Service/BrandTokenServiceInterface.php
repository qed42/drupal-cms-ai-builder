<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

/**
 * Interface for the Brand Token Service.
 *
 * Reads brand tokens from a JSON file and generates CSS custom properties
 * that map to Space DS theme variables.
 */
interface BrandTokenServiceInterface {

  /**
   * Generates CSS from a tokens JSON file.
   *
   * Reads the tokens JSON and produces a CSS string containing:
   * - Google Fonts @import (or @font-face for custom fonts)
   * - :root block with --space-color-* and --space-font-* custom properties
   *
   * @param string $tokensPath
   *   Path to the tokens.json file.
   *
   * @return string
   *   The generated CSS string.
   *
   * @throws \RuntimeException
   *   If the tokens file cannot be read or parsed.
   */
  public function generateTokenCss(string $tokensPath): string;

  /**
   * Applies brand tokens by writing CSS and configuring the site.
   *
   * - Generates CSS and writes it to public://css/brand-tokens.css
   * - If a logo_url is present, copies it to public://logo.png and sets
   *   the site logo in theme settings.
   * - If custom fonts are present, copies font files to public://fonts/.
   *
   * @param string $tokensPath
   *   Path to the tokens.json file.
   *
   * @throws \RuntimeException
   *   If the tokens file cannot be read or files cannot be written.
   */
  public function applyTokens(string $tokensPath): void;

}
