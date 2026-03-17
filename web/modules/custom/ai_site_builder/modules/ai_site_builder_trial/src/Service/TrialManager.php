<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder_trial\Service;

use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\user\UserInterface;

/**
 * Manages trial activation and status checking.
 */
class TrialManager implements TrialManagerInterface {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected TimeInterface $time,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function startTrial(UserInterface $user): bool {
    $profile = $this->loadSiteProfile($user);
    if (!$profile) {
      return FALSE;
    }

    $now = $this->time->getRequestTime();
    $profile->set('trial_start', $now);
    $profile->set('trial_end', $now + (self::TRIAL_DURATION_DAYS * 86400));
    $profile->set('subscription_status', SiteProfileInterface::SUBSCRIPTION_TRIAL);
    $profile->save();

    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function isActive(UserInterface $user): bool {
    $profile = $this->loadSiteProfile($user);
    if (!$profile) {
      return FALSE;
    }

    // Active subscription always counts.
    $subscription = $profile->getSubscriptionStatus();
    if ($subscription === SiteProfileInterface::SUBSCRIPTION_ACTIVE) {
      return TRUE;
    }

    // Check trial period.
    $trial_end = (int) $profile->get('trial_end')->value;
    if ($trial_end > 0 && $this->time->getRequestTime() <= $trial_end) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getRemainingDays(UserInterface $user): int {
    $profile = $this->loadSiteProfile($user);
    if (!$profile) {
      return 0;
    }

    $trial_end = (int) $profile->get('trial_end')->value;
    if ($trial_end <= 0) {
      return 0;
    }

    $remaining_seconds = $trial_end - $this->time->getRequestTime();
    if ($remaining_seconds <= 0) {
      return 0;
    }

    return (int) ceil($remaining_seconds / 86400);
  }

  /**
   * Loads the SiteProfile for a given user.
   */
  protected function loadSiteProfile(UserInterface $user): ?SiteProfileInterface {
    $profiles = $this->entityTypeManager->getStorage('site_profile')
      ->loadByProperties(['user_id' => $user->id()]);

    if (empty($profiles)) {
      return NULL;
    }

    $profile = reset($profiles);
    return $profile instanceof SiteProfileInterface ? $profile : NULL;
  }

}
