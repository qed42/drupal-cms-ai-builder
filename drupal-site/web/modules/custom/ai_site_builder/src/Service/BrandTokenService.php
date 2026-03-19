<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Psr\Log\LoggerInterface;

/**
 * Service for generating CSS custom properties from brand tokens JSON.
 *
 * Reads a tokens.json file containing colors, fonts, logo, and custom font
 * definitions, and generates CSS that maps to Space DS theme variables.
 */
class BrandTokenService implements BrandTokenServiceInterface {

  /**
   * The logger channel.
   */
  protected LoggerInterface $logger;

  /**
   * Common font weights used for Google Fonts imports.
   */
  protected const GOOGLE_FONT_WEIGHTS = '400;600;700';

  /**
   * The URI where generated brand token CSS is stored.
   */
  protected const CSS_OUTPUT_URI = 'public://brand/brand-tokens.css';

  /**
   * The URI where the site logo is stored.
   */
  protected const LOGO_OUTPUT_URI = 'public://logo.png';

  /**
   * The URI directory where custom fonts are stored.
   */
  protected const FONTS_OUTPUT_DIR = 'public://fonts';

  /**
   * Mapping of font file extensions to CSS font format strings.
   */
  protected const FONT_FORMAT_MAP = [
    'woff2' => 'woff2',
    'woff' => 'woff',
    'ttf' => 'truetype',
    'otf' => 'opentype',
    'eot' => 'embedded-opentype',
    'svg' => 'svg',
  ];

  /**
   * Constructs a BrandTokenService object.
   *
   * @param \Drupal\Core\File\FileSystemInterface $fileSystem
   *   The file system service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config factory service.
   * @param \Drupal\Core\File\FileUrlGeneratorInterface $fileUrlGenerator
   *   The file URL generator service.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger channel factory.
   */
  public function __construct(
    protected FileSystemInterface $fileSystem,
    protected ConfigFactoryInterface $configFactory,
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    LoggerChannelFactoryInterface $loggerFactory,
  ) {
    $this->logger = $loggerFactory->get('ai_site_builder');
  }

  /**
   * {@inheritdoc}
   */
  public function generateTokenCss(string $tokensPath): string {
    $tokens = $this->readTokensFile($tokensPath);
    return $this->generateTokenCssFromData($tokens);
  }

  /**
   * Generates CSS from an already-parsed tokens array.
   *
   * @param array $tokens
   *   The parsed tokens array.
   *
   * @return string
   *   The generated CSS string.
   */
  protected function generateTokenCssFromData(array $tokens): string {
    $css_parts = [];

    $colors = $tokens['colors'] ?? [];
    $fonts = $tokens['fonts'] ?? [];
    $customFonts = $tokens['custom_fonts'] ?? [];

    // Generate font imports or @font-face declarations.
    if (!empty($customFonts)) {
      $css_parts[] = $this->generateFontFaceDeclarations($customFonts);
    }
    elseif (!empty($fonts)) {
      $css_parts[] = $this->generateGoogleFontsImport($fonts);
    }

    // Generate :root custom properties.
    $css_parts[] = $this->generateRootBlock($colors, $fonts, $customFonts);

    return implode("\n\n", array_filter($css_parts)) . "\n";
  }

  /**
   * {@inheritdoc}
   */
  public function applyTokens(string $tokensPath): void {
    $tokens = $this->readTokensFile($tokensPath);

    // Generate CSS from already-parsed tokens to avoid double file read.
    $css = $this->generateTokenCssFromData($tokens);
    $this->ensureDirectoryExists('public://brand');
    $this->fileSystem->saveData($css, self::CSS_OUTPUT_URI, FileSystemInterface::EXISTS_REPLACE);
    $this->logger->info('Brand token CSS written to @path.', ['@path' => self::CSS_OUTPUT_URI]);

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
   * Generates a Google Fonts @import URL from font definitions.
   *
   * @param array $fonts
   *   Associative array with keys like 'heading' and 'body' mapping to font
   *   family names (e.g., 'Nunito Sans', 'Open Sans').
   *
   * @return string
   *   The CSS @import statement for Google Fonts.
   */
  protected function generateGoogleFontsImport(array $fonts): string {
    $families = [];

    foreach ($fonts as $fontName) {
      if (empty($fontName) || !is_string($fontName)) {
        continue;
      }
      // Google Fonts URL uses + for spaces and :wght@ for weights.
      $encoded = str_replace(' ', '+', $fontName);
      $families[] = 'family=' . $encoded . ':wght@' . self::GOOGLE_FONT_WEIGHTS;
    }

    if (empty($families)) {
      return '';
    }

    // Remove duplicate font families.
    $families = array_unique($families);

    $url = 'https://fonts.googleapis.com/css2?' . implode('&', $families) . '&display=swap';
    return "@import url('" . $url . "');";
  }

  /**
   * Generates @font-face declarations for custom fonts.
   *
   * @param array $customFonts
   *   Array of custom font definitions. Each entry should contain:
   *   - family: The font family name.
   *   - src: The URL or path to the font file.
   *   - weight: (optional) Font weight, defaults to '400'.
   *   - style: (optional) Font style, defaults to 'normal'.
   *
   * @return string
   *   The CSS @font-face declarations.
   */
  protected function generateFontFaceDeclarations(array $customFonts): string {
    $declarations = [];

    foreach ($customFonts as $font) {
      if (empty($font['family']) || empty($font['src'])) {
        continue;
      }

      $family = $font['family'];
      $src = $font['src'];
      $weight = $font['weight'] ?? '400';
      $style = $font['style'] ?? 'normal';

      // Determine font format from file extension.
      $extension = strtolower(pathinfo($src, PATHINFO_EXTENSION));
      $format = self::FONT_FORMAT_MAP[$extension] ?? '';

      // Build the src value with format hint if available.
      $srcValue = "url('{$src}')";
      if ($format) {
        $srcValue .= " format('{$format}')";
      }

      $declarations[] = <<<CSS
@font-face {
  font-family: '{$family}';
  src: {$srcValue};
  font-weight: {$weight};
  font-style: {$style};
  font-display: swap;
}
CSS;
    }

    return implode("\n\n", $declarations);
  }

  /**
   * Generates the :root CSS block with custom properties.
   *
   * @param array $colors
   *   Associative array of color tokens (e.g., ['primary' => '#2563eb']).
   * @param array $fonts
   *   Associative array of font tokens (e.g., ['heading' => 'Nunito Sans']).
   * @param array $customFonts
   *   Array of custom font definitions (used for font family references).
   *
   * @return string
   *   The :root CSS block.
   */
  protected function generateRootBlock(array $colors, array $fonts, array $customFonts): string {
    $properties = [];

    // Map color keys to --space-color-{key} custom properties.
    foreach ($colors as $key => $value) {
      if (!is_string($value) || empty($value)) {
        continue;
      }
      $sanitizedKey = preg_replace('/[^a-z0-9-]/', '-', strtolower((string) $key));
      $properties[] = "  --space-color-{$sanitizedKey}: {$value};";
    }

    // Map font keys to --space-font-{key} custom properties.
    // If custom fonts are provided, use those family names.
    $fontFamilies = [];
    if (!empty($customFonts)) {
      foreach ($customFonts as $font) {
        if (!empty($font['family']) && !empty($font['role'])) {
          $fontFamilies[$font['role']] = $font['family'];
        }
      }
    }

    foreach ($fonts as $key => $fontName) {
      if (empty($fontName) || !is_string($fontName)) {
        continue;
      }
      // Use custom font family name if available for this role.
      $family = $fontFamilies[$key] ?? $fontName;
      $sanitizedKey = preg_replace('/[^a-z0-9-]/', '-', strtolower((string) $key));
      $fallback = ($key === 'heading') ? 'sans-serif' : 'serif';
      $properties[] = "  --space-font-{$sanitizedKey}: '{$family}', {$fallback};";
    }

    if (empty($properties)) {
      return '';
    }

    return ":root {\n" . implode("\n", $properties) . "\n}";
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
