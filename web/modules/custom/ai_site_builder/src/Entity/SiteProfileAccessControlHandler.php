<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Entity;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access control handler for the SiteProfile entity.
 *
 * Enforces that users can only access their own site profile.
 * Platform admins with 'administer site profiles' can access all.
 */
class SiteProfileAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account): AccessResultInterface {
    assert($entity instanceof SiteProfileInterface);

    if ($account->hasPermission('administer site profiles')) {
      return AccessResult::allowed()->cachePerPermissions();
    }

    if ((int) $entity->getOwnerId() === (int) $account->id()) {
      return AccessResult::allowed()
        ->cachePerUser()
        ->addCacheableDependency($entity);
    }

    return AccessResult::forbidden('You do not own this site profile.')
      ->cachePerUser()
      ->addCacheableDependency($entity);
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL): AccessResultInterface {
    if ($account->hasPermission('administer site profiles')) {
      return AccessResult::allowed()->cachePerPermissions();
    }

    // Any authenticated user with the onboarding permission can create.
    if ($account->hasPermission('access onboarding wizard')) {
      return AccessResult::allowed()->cachePerPermissions();
    }

    return AccessResult::forbidden()->cachePerPermissions();
  }

}
