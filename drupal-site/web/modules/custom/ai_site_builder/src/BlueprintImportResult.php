<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder;

/**
 * Value object representing the result of a blueprint import.
 */
class BlueprintImportResult {

  /**
   * Constructs a BlueprintImportResult.
   *
   * @param array $site
   *   The site metadata.
   * @param array $brand
   *   The brand tokens.
   * @param array $pages
   *   The page definitions with component trees.
   * @param array $content
   *   The content items keyed by type.
   * @param array $forms
   *   The form definitions.
   */
  public function __construct(
    public readonly array $site,
    public readonly array $brand,
    public readonly array $pages,
    public readonly array $content,
    public readonly array $forms,
  ) {}

}
