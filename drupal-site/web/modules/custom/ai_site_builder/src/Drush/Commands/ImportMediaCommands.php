<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Drush\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drush\Attributes as CLI;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * Drush command for batch-creating Media entities from a JSON manifest.
 *
 * TASK-443: Used by the provisioning pipeline to create Media entities
 * for user-uploaded images that were not placed in the blueprint by the
 * image matcher. Blueprint-placed images are already handled by
 * BlueprintImportService::resolveImageInputs().
 */
final class ImportMediaCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs an ImportMediaCommands object.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected FileSystemInterface $fileSystem,
  ) {
    parent::__construct();
  }

  /**
   * Batch-create Media entities from a JSON manifest file.
   *
   * Each manifest entry creates a file entity and a media entity (type: image).
   * Individual failures are logged and skipped — the batch does not abort.
   *
   * Manifest format:
   * @code
   * [
   *   { "file": "public://user-images/abc.jpg", "alt": "...", "name": "...", "bundle": "image" }
   * ]
   * @endcode
   *
   * Returns JSON to stdout:
   * @code
   * [
   *   { "image_id": "abc", "media_id": 42, "fid": 101 },
   *   { "image_id": "def", "error": "File not found" }
   * ]
   * @endcode
   */
  #[CLI\Command(name: 'ai-site-builder:import-media', aliases: ['aisb:im'])]
  #[CLI\Option(name: 'manifest', description: 'Path to the manifest JSON file.')]
  #[CLI\Usage(name: 'drush ai-site-builder:import-media --manifest=/tmp/media-manifest.json', description: 'Create media entities from manifest.')]
  public function importMedia(array $options = ['manifest' => self::REQ]): void {
    $manifestPath = $options['manifest'];

    if (!file_exists($manifestPath)) {
      throw new \RuntimeException(sprintf('Manifest file not found: %s', $manifestPath));
    }

    $raw = file_get_contents($manifestPath);
    $entries = json_decode($raw, TRUE);

    if (!is_array($entries)) {
      throw new \RuntimeException('Manifest must be a JSON array.');
    }

    $this->logger()->notice(dt('Processing @count media entries...', ['@count' => count($entries)]));

    $results = [];
    $fileStorage = $this->entityTypeManager->getStorage('file');
    $mediaStorage = $this->entityTypeManager->getStorage('media');

    foreach ($entries as $entry) {
      $fileUri = $entry['file'] ?? '';
      $alt = $entry['alt'] ?? '';
      $name = $entry['name'] ?? basename($fileUri);
      $bundle = $entry['bundle'] ?? 'image';

      // Extract image ID from filename (UUID before extension).
      $imageId = pathinfo(basename($fileUri), PATHINFO_FILENAME);

      try {
        // Verify the file exists on disk.
        $realPath = $this->fileSystem->realpath($fileUri);
        if ($realPath === FALSE || !file_exists($realPath)) {
          $this->logger()->warning(dt('File not found: @uri', ['@uri' => $fileUri]));
          $results[] = ['image_id' => $imageId, 'error' => 'File not found'];
          continue;
        }

        // Create file entity.
        /** @var \Drupal\file\FileInterface $fileEntity */
        $fileEntity = $fileStorage->create([
          'uri' => $fileUri,
          'filename' => $name,
          'filemime' => $this->getMimeType($fileUri),
          'status' => 1,
        ]);
        $fileEntity->save();
        $fid = (int) $fileEntity->id();

        // Create media entity.
        /** @var \Drupal\media\MediaInterface $mediaEntity */
        $mediaEntity = $mediaStorage->create([
          'bundle' => $bundle,
          'name' => $name,
          'field_media_image' => [
            'target_id' => $fid,
            'alt' => $alt,
          ],
          'status' => 1,
        ]);
        $mediaEntity->save();
        $mediaId = (int) $mediaEntity->id();

        $this->logger()->info(dt('Created media @mid (fid @fid) for @uri', [
          '@mid' => $mediaId,
          '@fid' => $fid,
          '@uri' => $fileUri,
        ]));

        $results[] = [
          'image_id' => $imageId,
          'media_id' => $mediaId,
          'fid' => $fid,
        ];
      }
      catch (\Exception $e) {
        $this->logger()->error(dt('Failed to create media for @uri: @msg', [
          '@uri' => $fileUri,
          '@msg' => $e->getMessage(),
        ]));
        $results[] = ['image_id' => $imageId, 'error' => $e->getMessage()];
      }
    }

    $successCount = count(array_filter($results, fn($r) => isset($r['media_id'])));
    $this->logger()->success(dt('Import complete: @success/@total media entities created.', [
      '@success' => $successCount,
      '@total' => count($results),
    ]));

    // Output results as JSON to stdout for the provisioning engine to parse.
    $this->output()->writeln(json_encode($results, JSON_PRETTY_PRINT));
  }

  /**
   * Determine MIME type from file URI.
   */
  private function getMimeType(string $uri): string {
    $extension = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
    $mimeMap = [
      'jpg' => 'image/jpeg',
      'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      'gif' => 'image/gif',
    ];
    return $mimeMap[$extension] ?? 'application/octet-stream';
  }

}
