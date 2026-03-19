<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Controller;

use Drupal\ai_site_builder\Service\AutoLoginService;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controller for JWT-based auto-login from the platform dashboard.
 */
class AutoLoginController extends ControllerBase {

  /**
   * Constructs an AutoLoginController.
   *
   * @param \Drupal\ai_site_builder\Service\AutoLoginService $autoLoginService
   *   The auto-login service.
   */
  public function __construct(
    #[Autowire(service: 'ai_site_builder.auto_login')]
    protected AutoLoginService $autoLoginService,
  ) {}

  /**
   * Handles auto-login via JWT token.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The incoming request.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A redirect response to the Canvas editor or an error page.
   */
  public function login(Request $request): Response {
    $token = $request->query->get('token', '');
    $redirect = $request->query->get('redirect', '/');

    if (empty($token)) {
      return $this->errorResponse('No login token provided. Please try again from your dashboard.');
    }

    // Validate JWT.
    $payload = $this->autoLoginService->validateToken($token);
    if ($payload === NULL) {
      return $this->errorResponse('Invalid or expired login token. Please try again from your dashboard.');
    }

    // Find or create user.
    $email = $payload['sub'];
    $name = $payload['name'] ?? '';
    $user = $this->autoLoginService->findOrCreateUser($email, $name);

    if ($user === NULL) {
      return $this->errorResponse('Unable to process login. Please try again from your dashboard.');
    }

    // Log the user in.
    user_login_finalize($user);

    // Sanitize redirect path — only allow internal paths.
    if (!str_starts_with($redirect, '/')) {
      $redirect = '/';
    }

    return new TrustedRedirectResponse($redirect);
  }

  /**
   * Returns a simple error page response.
   *
   * @param string $message
   *   The error message to display.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   An HTML error response.
   */
  protected function errorResponse(string $message): Response {
    $html = '<html><body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6;">';
    $html .= '<div style="text-align: center; max-width: 400px; padding: 2rem;">';
    $html .= '<h1 style="color: #1f2937; font-size: 1.5rem;">Login Error</h1>';
    $html .= '<p style="color: #6b7280; margin: 1rem 0;">' . htmlspecialchars($message) . '</p>';
    $html .= '</div></body></html>';

    return new Response($html, 403);
  }

}
