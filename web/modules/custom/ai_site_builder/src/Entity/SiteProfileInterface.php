<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\taxonomy\TermInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for the SiteProfile entity.
 */
interface SiteProfileInterface extends ContentEntityInterface, EntityOwnerInterface, RevisionLogInterface {

  /**
   * Site profile status constants.
   */
  const STATUS_ONBOARDING = 'onboarding';
  const STATUS_GENERATING = 'generating';
  const STATUS_GENERATED = 'generated';
  const STATUS_PUBLISHED = 'published';
  const STATUS_EXPIRED = 'expired';

  /**
   * Subscription status constants.
   */
  const SUBSCRIPTION_TRIAL = 'trial';
  const SUBSCRIPTION_ACTIVE = 'active';
  const SUBSCRIPTION_EXPIRED = 'expired';
  const SUBSCRIPTION_CANCELLED = 'cancelled';

  /**
   * Gets the site name.
   */
  public function getSiteName(): string;

  /**
   * Sets the site name.
   */
  public function setSiteName(string $name): static;

  /**
   * Gets the site profile status.
   */
  public function getProfileStatus(): string;

  /**
   * Sets the site profile status.
   */
  public function setProfileStatus(string $status): static;

  /**
   * Gets the current onboarding step.
   */
  public function getOnboardingStep(): int;

  /**
   * Sets the current onboarding step.
   */
  public function setOnboardingStep(int $step): static;

  /**
   * Gets the industry term reference.
   */
  public function getIndustry(): ?TermInterface;

  /**
   * Gets the current generation status step ID.
   */
  public function getGenerationStatus(): ?string;

  /**
   * Sets the generation status step ID.
   */
  public function setGenerationStatus(string $status): static;

  /**
   * Gets the subscription status.
   */
  public function getSubscriptionStatus(): ?string;

  /**
   * Sets the subscription status.
   */
  public function setSubscriptionStatus(string $status): static;

}
