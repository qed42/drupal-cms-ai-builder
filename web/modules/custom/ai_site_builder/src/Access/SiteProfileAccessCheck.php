<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Access;

use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Route access checker for SiteProfile-scoped routes.
 *
 * Ensures the current user owns the site profile referenced in the route,
 * or has admin permission.
 */
class SiteProfileAccessCheck implements AccessInterface {

  /**
   * Checks access for routes that reference a site_profile parameter.
   */
  public function access(AccountInterface $account, ?SiteProfileInterface $site_profile = NULL): AccessResultInterface {
    if (!$site_profile) {
      return AccessResult::forbidden('No site profile specified.');
    }

    if ($account->hasPermission('administer site profiles')) {
      return AccessResult::allowed()->cachePerPermissions();
    }

    if ((int) $site_profile->getOwnerId() === (int) $account->id()) {
      return AccessResult::allowed()
        ->cachePerUser()
        ->addCacheableDependency($site_profile);
    }

    return AccessResult::forbidden('You do not own this site profile.')
      ->cachePerUser()
      ->addCacheableDependency($site_profile);
  }

}
