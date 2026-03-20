<?php

/**
 * @file
 * Fix canvas component image inputs: convert { src, alt } to media entity IDs.
 *
 * Run with: drush php:script scripts/fix-canvas-image-inputs.php
 *
 * Canvas image props use entity_reference to media entities (not raw image
 * field type). This script scans all canvas_page components, detects image
 * props via prop_field_definitions (field_type=entity_reference, target_type=media),
 * creates file + media entities, and updates the database with media entity IDs.
 */

use Drupal\Core\Database\Database;

$connection = Database::getConnection();
$entityTypeManager = \Drupal::entityTypeManager();
$componentStorage = $entityTypeManager->getStorage('component');
$fileStorage = $entityTypeManager->getStorage('file');
$mediaStorage = $entityTypeManager->getStorage('media');

// Cache of component_id → list of image prop names (entity_reference to media).
$imagePropsCache = [];

// Cache of file URI → media entity ID (avoid duplicates).
$mediaCache = [];

$updated = 0;
$mediaCreated = 0;

// Query all canvas_page component rows.
$rows = $connection->select('canvas_page__components', 'c')
  ->fields('c', ['entity_id', 'delta', 'components_component_id', 'components_inputs'])
  ->execute()
  ->fetchAll();

foreach ($rows as $row) {
  $componentId = $row->components_component_id;
  $inputsJson = $row->components_inputs;

  $inputs = json_decode($inputsJson, TRUE);
  if (!is_array($inputs)) {
    continue;
  }

  // Get image prop names for this component.
  if (!isset($imagePropsCache[$componentId])) {
    $imagePropsCache[$componentId] = [];
    $componentEntity = $componentStorage->load($componentId);
    if ($componentEntity) {
      $settings = $componentEntity->getSettings();
      $propFieldDefs = $settings['prop_field_definitions'] ?? [];
      foreach ($propFieldDefs as $propName => $def) {
        if (($def['field_type'] ?? '') === 'entity_reference'
            && ($def['field_storage_settings']['target_type'] ?? '') === 'media') {
          $imagePropsCache[$componentId][] = $propName;
        }
      }
    }
  }

  if (empty($imagePropsCache[$componentId])) {
    continue;
  }

  $changed = FALSE;

  foreach ($imagePropsCache[$componentId] as $propName) {
    if (!isset($inputs[$propName]) || !is_array($inputs[$propName])) {
      continue;
    }

    $imageData = $inputs[$propName];

    // Skip if already in Canvas format (has sourceType or is just an integer).
    if (isset($imageData['sourceType']) || isset($imageData['target_id'])) {
      continue;
    }
    // Skip if it's just a scalar (already a media entity ID).
    if (is_int($imageData) || is_string($imageData)) {
      continue;
    }

    if (empty($imageData['src'])) {
      continue;
    }

    $src = $imageData['src'];
    $alt = $imageData['alt'] ?? '';

    // Convert web path to stream wrapper URI.
    if (preg_match('#/sites/[^/]+/files/(.+)$#', $src, $matches)) {
      $uri = 'public://' . $matches[1];
    }
    else {
      echo "  WARNING: Cannot convert path to URI: $src\n";
      continue;
    }

    // Create media entity (or reuse cached one).
    if (!isset($mediaCache[$uri])) {
      $filename = basename($src);
      $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
      $mime = match ($extension) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        default => 'application/octet-stream',
      };

      // Create file entity.
      $file = $fileStorage->create([
        'uri' => $uri,
        'filename' => $filename,
        'filemime' => $mime,
        'status' => 1,
      ]);
      $file->save();
      echo "  Created file entity #{$file->id()} for $uri\n";

      // Create media entity.
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
      $mediaCache[$uri] = (int) $media->id();
      $mediaCreated++;
      echo "  Created media entity #{$media->id()} (file #{$file->id()}) for $uri\n";
    }

    $mediaId = $mediaCache[$uri];

    // For entity_reference fields, the collapsed value is just the entity ID.
    // Canvas denormalizes single-property fields to a scalar.
    $inputs[$propName] = $mediaId;
    $changed = TRUE;
    echo "  Fixed prop '$propName' on entity {$row->entity_id}, delta {$row->delta}: media_id=$mediaId\n";
  }

  if ($changed) {
    $newInputsJson = json_encode($inputs, JSON_UNESCAPED_UNICODE);
    $connection->update('canvas_page__components')
      ->fields(['components_inputs' => $newInputsJson])
      ->condition('entity_id', $row->entity_id)
      ->condition('delta', $row->delta)
      ->execute();

    // Also update the revision table.
    $connection->update('canvas_page_revision__components')
      ->fields(['components_inputs' => $newInputsJson])
      ->condition('entity_id', $row->entity_id)
      ->condition('delta', $row->delta)
      ->execute();

    $updated++;
  }
}

echo "\nDone: $updated rows updated, $mediaCreated media entities created.\n";

// Clear caches so Canvas picks up the new data.
drupal_flush_all_caches();
echo "Caches cleared.\n";
