<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for the onboarding wizard page.
 */
class OnboardingController extends ControllerBase {

  /**
   * Renders the onboarding wizard page.
   */
  public function page(): array {
    $build = [];

    $build['#cache'] = [
      'contexts' => ['user'],
    ];

    $build['wizard'] = $this->formBuilder()->getForm('Drupal\ai_site_builder\Form\OnboardingWizardForm');

    return $build;
  }

}
