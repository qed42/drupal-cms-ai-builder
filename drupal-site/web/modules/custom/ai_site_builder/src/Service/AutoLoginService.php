<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Site\Settings;
use Drupal\user\UserInterface;
use Psr\Log\LoggerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;

/**
 * Service for validating JWT tokens and managing auto-login users.
 */
class AutoLoginService {

  /**
   * The logger channel.
   */
  protected LoggerInterface $logger;

  /**
   * Constructs an AutoLoginService object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger channel factory.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    LoggerChannelFactoryInterface $loggerFactory,
  ) {
    $this->logger = $loggerFactory->get('ai_site_builder');
  }

  /**
   * Validates a JWT token and returns the decoded payload.
   *
   * Uses HMAC-SHA256 (HS256) with a shared secret from Drupal settings.
   *
   * @param string $jwt
   *   The JWT token string.
   *
   * @return array|null
   *   The decoded payload array, or NULL if validation fails.
   */
  public function validateToken(string $jwt): ?array {
    $secret = Settings::get('ai_site_builder_jwt_secret');
    if (empty($secret)) {
      $this->logger->error('JWT secret not configured in settings.php.');
      return NULL;
    }

    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
      $this->logger->warning('Invalid JWT format: expected 3 parts.');
      return NULL;
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;

    // Verify signature.
    $expectedSignature = $this->base64UrlEncode(
      hash_hmac('sha256', "$headerB64.$payloadB64", $secret, TRUE)
    );

    if (!hash_equals($expectedSignature, $signatureB64)) {
      $this->logger->warning('JWT signature verification failed.');
      return NULL;
    }

    // Decode header — verify algorithm.
    $header = json_decode($this->base64UrlDecode($headerB64), TRUE);
    if (($header['alg'] ?? '') !== 'HS256') {
      $this->logger->warning('Unsupported JWT algorithm: @alg', ['@alg' => $header['alg'] ?? 'none']);
      return NULL;
    }

    // Decode payload.
    $payload = json_decode($this->base64UrlDecode($payloadB64), TRUE);
    if (!is_array($payload)) {
      $this->logger->warning('Failed to decode JWT payload.');
      return NULL;
    }

    // Check expiration.
    if (isset($payload['exp']) && $payload['exp'] < time()) {
      $this->logger->warning('JWT token has expired.');
      return NULL;
    }

    // Require email in subject.
    if (empty($payload['sub'])) {
      $this->logger->warning('JWT missing required "sub" claim.');
      return NULL;
    }

    return $payload;
  }

  /**
   * Finds an existing user by email or creates a new one with site_owner role.
   *
   * @param string $email
   *   The user's email address.
   * @param string $name
   *   The user's display name.
   *
   * @return \Drupal\user\UserInterface|null
   *   The user entity, or NULL on failure.
   */
  public function findOrCreateUser(string $email, string $name): ?UserInterface {
    $userStorage = $this->entityTypeManager->getStorage('user');

    // Look up by email.
    $users = $userStorage->loadByProperties(['mail' => $email]);
    if (!empty($users)) {
      return reset($users);
    }

    // Create new user with site_owner role.
    try {
      /** @var \Drupal\user\UserInterface $user */
      $user = $userStorage->create([
        'name' => $email,
        'mail' => $email,
        'status' => 1,
        'pass' => \Drupal::service('password_generator')->generate(32),
      ]);

      if (!empty($name)) {
        $user->set('field_display_name', $name);
      }

      $user->addRole('site_owner');
      $user->save();

      $this->logger->info('Created new site_owner user: @email', ['@email' => $email]);
      return $user;
    }
    catch (\Exception $e) {
      $this->logger->error('Failed to create user @email: @message', [
        '@email' => $email,
        '@message' => $e->getMessage(),
      ]);
      return NULL;
    }
  }

  /**
   * Base64url-encodes data (RFC 7515).
   */
  protected function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  /**
   * Base64url-decodes data (RFC 7515).
   */
  protected function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'), TRUE) ?: '';
  }

}
