<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder_trial\Service;

use Drupal\user\UserInterface;

/**
 * Interface for the trial manager service.
 */
interface TrialManagerInterface {

  /**
   * The default trial duration in days.
   */
  const TRIAL_DURATION_DAYS = 14;

  /**
   * Starts a trial for the given user.
   *
   * Sets trial_start and trial_end on the user's SiteProfile entity.
   *
   * @param \Drupal\user\UserInterface $user
   *   The user to start the trial for.
   *
   * @return bool
   *   TRUE if the trial was started, FALSE if no SiteProfile was found.
   */
  public function startTrial(UserInterface $user): bool;

  /**
   * Checks if the user's trial or subscription is active.
   *
   * @param \Drupal\user\UserInterface $user
   *   The user to check.
   *
   * @return bool
   *   TRUE if the trial is active or subscription is active.
   */
  public function isActive(UserInterface $user): bool;

  /**
   * Gets the number of days remaining in the trial.
   *
   * @param \Drupal\user\UserInterface $user
   *   The user to check.
   *
   * @return int
   *   The number of days remaining, or 0 if expired or no trial found.
   */
  public function getRemainingDays(UserInterface $user): int;

}
