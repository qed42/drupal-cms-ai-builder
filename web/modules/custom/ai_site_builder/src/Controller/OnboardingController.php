<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Controller;

use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for the onboarding wizard pages.
 *
 * Sprint 01: Placeholder that confirms registration flow works.
 * Sprint 02: Will be replaced with the full multi-step wizard.
 */
class OnboardingController extends ControllerBase {

  /**
   * Renders the onboarding page.
   */
  public function page(): array {
    $user = $this->currentUser();

    // Load the user's SiteProfile.
    $profiles = $this->entityTypeManager()->getStorage('site_profile')
      ->loadByProperties(['user_id' => $user->id()]);

    if (empty($profiles)) {
      return [
        '#markup' => $this->t('No site profile found. Please <a href="@url">register</a> first.', [
          '@url' => '/start',
        ]),
      ];
    }

    $profile = reset($profiles);
    assert($profile instanceof SiteProfileInterface);

    $build = [];

    $build['#cache'] = [
      'contexts' => ['user'],
      'tags' => ['site_profile:' . $profile->id()],
    ];

    $build['status'] = [
      '#markup' => '<h2>' . $this->t('Onboarding Status') . '</h2>',
    ];

    $build['details'] = [
      '#theme' => 'item_list',
      '#items' => [
        $this->t('Status: @status', ['@status' => $profile->getProfileStatus()]),
        $this->t('Current Step: @step of 5', ['@step' => $profile->getOnboardingStep()]),
        $this->t('Email: @email', ['@email' => $profile->get('admin_email')->value ?? 'N/A']),
      ],
    ];

    $build['message'] = [
      '#markup' => '<p>' . $this->t('The onboarding wizard will be available in Sprint 02. Your site profile has been created successfully.') . '</p>',
    ];

    return $build;
  }

}
