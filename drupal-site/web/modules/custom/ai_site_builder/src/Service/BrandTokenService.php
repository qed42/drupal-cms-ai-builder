<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Psr\Log\LoggerInterface;

/**
 * Service for applying brand tokens to Space DS theme settings.
 *
 * Reads a tokens.json file containing colors, fonts, logo, and custom font
 * definitions, and writes them to the space_ds.settings Drupal config so
 * the theme can generate CSS variables at runtime.
 */
class BrandTokenService implements BrandTokenServiceInterface {

  /**
   * The logger channel.
   */
  protected LoggerInterface $logger;

  /**
   * The URI where the site logo is stored.
   */
  protected const LOGO_OUTPUT_URI = 'public://logo.png';

  /**
   * The URI directory where custom fonts are stored.
   */
  protected const FONTS_OUTPUT_DIR = 'public://fonts';

  /**
   * All valid Space DS theme color setting keys.
   *
   * Colors provided using these keys are written directly to config without
   * translation. This is the preferred format for the generation pipeline.
   */
  protected const NATIVE_COLOR_KEYS = [
    'base_brand_color',
    'accent_color_primary',
    'accent_color_secondary',
    'neutral_color',
    'heading_color',
    'border_color',
    'gray_color',
    'success_color',
    'danger_color',
    'warning_color',
    'info_color',
    'background_color_1',
    'background_color_2',
    'background_color_3',
    'background_color_4',
    'background_color_5',
    'background_color_6',
    'background_color_7',
    'background_color_8',
    'background_color_9',
    'background_color_10',
  ];

  /**
   * Backward-compatible mapping of generic color keys to Space DS setting keys.
   *
   * Used when the onboarding UI sends colors with simple role names (e.g.,
   * "primary") instead of Space DS native keys (e.g., "accent_color_primary").
   */
  protected const LEGACY_COLOR_MAP = [
    'brand' => 'base_brand_color',
    'base' => 'base_brand_color',
    'primary' => 'accent_color_primary',
    'secondary' => 'accent_color_secondary',
    'neutral' => 'neutral_color',
    'text' => 'neutral_color',
    'heading' => 'heading_color',
    'border' => 'border_color',
    'gray' => 'gray_color',
    'success' => 'success_color',
    'danger' => 'danger_color',
    'warning' => 'warning_color',
    'info' => 'info_color',
  ];

  /**
   * Constructs a BrandTokenService object.
   *
   * @param \Drupal\Core\File\FileSystemInterface $fileSystem
   *   The file system service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config factory service.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger channel factory.
   */
  public function __construct(
    protected FileSystemInterface $fileSystem,
    protected ConfigFactoryInterface $configFactory,
    LoggerChannelFactoryInterface $loggerFactory,
  ) {
    $this->logger = $loggerFactory->get('ai_site_builder');
  }

  /**
   * {@inheritdoc}
   */
  public function applyTokens(string $tokensPath): void {
    $tokens = $this->readTokensFile($tokensPath);

    // Write brand colors and typography to theme settings.
    $this->applyBrandSettings($tokens);

    // Handle logo.
    if (!empty($tokens['logo_url'])) {
      $this->applyLogo($tokens['logo_url']);
    }

    // Handle custom font files.
    if (!empty($tokens['custom_fonts'])) {
      $this->copyCustomFontFiles($tokens['custom_fonts']);
    }
  }

  /**
   * Writes brand colors and typography to space_ds.settings config.
   *
   * Maps blueprint token keys to Space DS theme setting keys and persists
   * them so the theme's preprocess_page hook can generate CSS variables.
   *
   * @param array $tokens
   *   The parsed tokens array containing 'colors' and 'fonts' keys.
   */
  protected function applyBrandSettings(array $tokens): void {
    $config = $this->configFactory->getEditable('space_ds.settings');
    $colors = $tokens['colors'] ?? [];
    $fonts = $tokens['fonts'] ?? [];

    $nativeKeySet = array_flip(self::NATIVE_COLOR_KEYS);
    $appliedCount = 0;

    foreach ($colors as $tokenKey => $value) {
      if (empty($value)) {
        continue;
      }

      if (isset($nativeKeySet[$tokenKey])) {
        // Native Space DS key — write directly.
        $config->set($tokenKey, $value);
        $appliedCount++;
      }
      elseif (isset(self::LEGACY_COLOR_MAP[$tokenKey])) {
        // Legacy generic key — translate to native.
        $config->set(self::LEGACY_COLOR_MAP[$tokenKey], $value);
        $appliedCount++;
      }
      else {
        // Legacy background_N format (e.g., "background_1").
        if (preg_match('/^background_(\d+)$/', $tokenKey, $m)) {
          $config->set("background_color_{$m[1]}", $value);
          $appliedCount++;
        }
        else {
          $this->logger->warning('Unknown color token key "@key", skipping.', [
            '@key' => $tokenKey,
          ]);
        }
      }
    }

    // Typography: font family.
    $bodyFont = $fonts['body'] ?? $fonts['primary'] ?? '';
    if ($bodyFont) {
      $config->set('font_family', $this->mapToThemeFont($bodyFont));
    }

    // Typography: base font size.
    $fontSize = $fonts['size'] ?? $fonts['base_size'] ?? NULL;
    if ($fontSize) {
      $config->set('base_font_size', (int) $fontSize);
    }

    $config->save();
    $this->logger->info('Brand settings written to space_ds.settings config (@count color tokens applied).', [
      '@count' => $appliedCount,
    ]);
  }

  /**
   * Maps a font name to one of the Space DS theme's supported font families.
   *
   * The Space DS theme supports three font family options: Geist, sans-serif,
   * and serif. This method maps arbitrary font names to the closest match.
   *
   * @param string $fontName
   *   The font family name from the blueprint tokens.
   *
   * @return string
   *   One of 'Geist', 'sans-serif', or 'serif'.
   */
  protected function mapToThemeFont(string $fontName): string {
    $fontLower = strtolower($fontName);
    if (str_contains($fontLower, 'geist')) {
      return 'Geist';
    }
    if (str_contains($fontLower, 'serif') && !str_contains($fontLower, 'sans')) {
      return 'serif';
    }
    return 'sans-serif';
  }

  /**
   * Reads and parses a tokens JSON file.
   *
   * @param string $tokensPath
   *   The file path to the tokens JSON file.
   *
   * @return array
   *   The parsed tokens array.
   *
   * @throws \RuntimeException
   *   If the file cannot be read or contains invalid JSON.
   */
  protected function readTokensFile(string $tokensPath): array {
    if (!file_exists($tokensPath) || !is_readable($tokensPath)) {
      throw new \RuntimeException(sprintf('Tokens file not found or not readable: %s', $tokensPath));
    }

    $json = file_get_contents($tokensPath);
    if ($json === FALSE) {
      throw new \RuntimeException(sprintf('Failed to read tokens file: %s', $tokensPath));
    }

    $tokens = json_decode($json, TRUE);
    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new \RuntimeException(sprintf('Invalid JSON in tokens file %s: %s', $tokensPath, json_last_error_msg()));
    }

    return $tokens;
  }

  /**
   * Copies the logo from a URL or path and sets it as the site logo.
   *
   * @param string $logoUrl
   *   The URL or file path of the logo.
   */
  protected function applyLogo(string $logoUrl): void {
    try {
      // The logoUrl may be a stream wrapper URI (public://filename.jpg) if the
      // provisioning step already copied the file, or a remote URL.
      if (str_starts_with($logoUrl, 'public://')) {
        $sourcePath = $this->fileSystem->realpath($logoUrl);
        if (!$sourcePath || !file_exists($sourcePath)) {
          $this->logger->warning('Logo file not found at @url.', ['@url' => $logoUrl]);
          return;
        }
        $logoData = file_get_contents($sourcePath);
      }
      else {
        $logoData = @file_get_contents($logoUrl);
      }

      if ($logoData === FALSE) {
        $this->logger->warning('Failed to fetch logo from @url.', ['@url' => $logoUrl]);
        return;
      }

      $this->fileSystem->saveData($logoData, self::LOGO_OUTPUT_URI, FileSystemInterface::EXISTS_REPLACE);
      $this->logger->info('Logo saved to @path.', ['@path' => self::LOGO_OUTPUT_URI]);

      // Set the logo in the default theme's settings.
      $defaultTheme = $this->configFactory->get('system.theme')->get('default');
      if ($defaultTheme) {
        $themeSettings = $this->configFactory->getEditable("{$defaultTheme}.settings");
        $logoPath = $this->fileSystem->realpath(self::LOGO_OUTPUT_URI);
        $themeSettings->set('logo.use_default', FALSE);
        $themeSettings->set('logo.path', $logoPath ?: self::LOGO_OUTPUT_URI);
        $themeSettings->save();
        $this->logger->info('Site logo configured for theme @theme.', ['@theme' => $defaultTheme]);
      }
    }
    catch (\Exception $e) {
      $this->logger->error('Error applying logo: @message', ['@message' => $e->getMessage()]);
    }
  }

  /**
   * Copies custom font files to the public fonts directory.
   *
   * @param array $customFonts
   *   Array of custom font definitions with 'src' keys.
   */
  protected function copyCustomFontFiles(array $customFonts): void {
    $this->ensureDirectoryExists(self::FONTS_OUTPUT_DIR);

    foreach ($customFonts as $font) {
      if (empty($font['src'])) {
        continue;
      }

      try {
        $src = $font['src'];
        $filename = basename($src);
        $destination = self::FONTS_OUTPUT_DIR . '/' . $filename;

        $fontData = file_get_contents($src);
        if ($fontData === FALSE) {
          $this->logger->warning('Failed to fetch custom font from @src.', ['@src' => $src]);
          continue;
        }

        $this->fileSystem->saveData($fontData, $destination, FileSystemInterface::EXISTS_REPLACE);
        $this->logger->info('Custom font saved to @path.', ['@path' => $destination]);
      }
      catch (\Exception $e) {
        $this->logger->error('Error copying custom font: @message', ['@message' => $e->getMessage()]);
      }
    }
  }

  /**
   * Ensures a directory exists, creating it if necessary.
   *
   * @param string $uri
   *   The stream wrapper URI of the directory.
   */
  protected function ensureDirectoryExists(string $uri): void {
    $this->fileSystem->prepareDirectory($uri, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);
  }

}
