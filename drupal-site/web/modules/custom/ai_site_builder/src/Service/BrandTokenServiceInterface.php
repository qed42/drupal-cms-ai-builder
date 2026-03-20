<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

/**
 * Interface for the Brand Token Service.
 *
 * Reads brand tokens from a JSON file and writes color/typography settings
 * to the Space DS theme configuration (space_ds.settings).
 */
interface BrandTokenServiceInterface {

  /**
   * Applies brand tokens by writing theme settings and configuring the site.
   *
   * - Writes brand colors and typography to space_ds.settings config
   * - If a logo_url is present, copies it to public://logo.png and sets
   *   the site logo in theme settings.
   * - If custom fonts are present, copies font files to public://fonts/.
   *
   * @param string $tokensPath
   *   Path to the tokens.json file.
   *
   * @throws \RuntimeException
   *   If the tokens file cannot be read or settings cannot be written.
   */
  public function applyTokens(string $tokensPath): void;

}
