<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\ai_site_builder\BlueprintImportResult;

/**
 * Interface for the Blueprint Import Service.
 *
 * Handles importing blueprint JSON into Drupal entities:
 * canvas_page entities with component trees, content nodes, webforms, menus.
 */
interface BlueprintImportServiceInterface {

  /**
   * Parses a blueprint JSON file and returns a structured result.
   *
   * @param string $jsonPath
   *   The file path to the blueprint JSON.
   *
   * @return \Drupal\ai_site_builder\BlueprintImportResult
   *   The parsed blueprint data.
   *
   * @throws \RuntimeException
   *   If the file cannot be read or contains invalid JSON.
   */
  public function parseBlueprint(string $jsonPath): BlueprintImportResult;

  /**
   * Imports site metadata (name, slogan).
   *
   * @param array $siteData
   *   The site metadata array with 'name' and 'tagline' keys.
   */
  public function importSite(array $siteData): void;

  /**
   * Imports pages as canvas_page entities with component trees.
   *
   * Creates canvas_page entities, sets path aliases, meta tags,
   * builds the main menu, and sets the front page.
   *
   * @param array $pages
   *   Array of page definitions, each with slug, title, seo, component_tree.
   */
  public function importPages(array $pages): void;

  /**
   * Imports content entities from blueprint content section.
   *
   * Creates node entities for each content type (services, team_members, etc.)
   * using field mappings from the content type configs.
   *
   * @param array $content
   *   Associative array keyed by content type (e.g., 'services', 'team_members').
   */
  public function importContent(array $content): void;

  /**
   * Imports form definitions as Webform entities.
   *
   * @param array $forms
   *   Associative array of form definitions (e.g., 'contact' => [...]).
   */
  public function importForms(array $forms): void;

  /**
   * Imports header and footer as canvas_page entities.
   *
   * @param array $headerData
   *   The header configuration with 'component_tree' key.
   * @param array $footerData
   *   The footer configuration with 'component_tree' key.
   */
  public function importHeaderFooter(array $headerData, array $footerData): void;

  /**
   * Runs a full blueprint import: site, pages, content, forms, header/footer.
   *
   * @param string $jsonPath
   *   The file path to the blueprint JSON.
   */
  public function importAll(string $jsonPath): void;

}
