<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\EventSubscriber;

use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Redirects users with incomplete onboarding to the wizard.
 */
class OnboardingRedirectSubscriber implements EventSubscriberInterface {

  public function __construct(
    protected AccountProxyInterface $currentUser,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected RouteMatchInterface $routeMatch,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => ['onRequest', 30],
    ];
  }

  /**
   * Redirects site owners with incomplete onboarding.
   */
  public function onRequest(RequestEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }

    // Only apply to authenticated users with site_owner role.
    if ($this->currentUser->isAnonymous()) {
      return;
    }

    if (!in_array('site_owner', $this->currentUser->getRoles())) {
      return;
    }

    // Don't redirect if already on onboarding or admin pages.
    $route_name = $this->routeMatch->getRouteName();
    $excluded_routes = [
      'ai_site_builder.onboarding',
      'user.logout',
      'system.ajax',
      'system.403',
      'system.404',
    ];

    if (in_array($route_name, $excluded_routes) || str_starts_with($route_name ?? '', 'system.') || str_starts_with($route_name ?? '', 'admin')) {
      return;
    }

    // Check if the user has an onboarding profile.
    $profiles = $this->entityTypeManager->getStorage('site_profile')
      ->loadByProperties(['user_id' => $this->currentUser->id()]);

    if (empty($profiles)) {
      return;
    }

    $profile = reset($profiles);
    if (!$profile instanceof SiteProfileInterface) {
      return;
    }

    // Redirect only if still in onboarding status.
    if ($profile->getProfileStatus() === SiteProfileInterface::STATUS_ONBOARDING) {
      $url = Url::fromRoute('ai_site_builder.onboarding')->toString();
      $event->setResponse(new RedirectResponse($url));
    }
  }

}
