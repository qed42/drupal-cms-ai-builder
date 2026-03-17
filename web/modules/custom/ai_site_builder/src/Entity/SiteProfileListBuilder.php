<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Entity;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a listing of SiteProfile entities.
 */
class SiteProfileListBuilder extends EntityListBuilder {

  /**
   * The date formatter service.
   */
  protected DateFormatterInterface $dateFormatter;

  /**
   * {@inheritdoc}
   */
  public static function createInstance(ContainerInterface $container, EntityTypeInterface $entity_type): static {
    $instance = parent::createInstance($container, $entity_type);
    $instance->dateFormatter = $container->get('date.formatter');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function buildHeader(): array {
    $header['id'] = $this->t('ID');
    $header['site_name'] = $this->t('Site Name');
    $header['owner'] = $this->t('Owner');
    $header['status'] = $this->t('Status');
    $header['created'] = $this->t('Created');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity): array {
    assert($entity instanceof SiteProfileInterface);

    $row['id'] = $entity->id();
    $row['site_name'] = $entity->toLink($entity->getSiteName() ?: $this->t('(unnamed)'));
    $row['owner'] = $entity->getOwner()?->toLink() ?? $this->t('N/A');
    $row['status'] = $entity->getProfileStatus();
    $row['created'] = $this->dateFormatter->format($entity->get('created')->value, 'short');
    return $row + parent::buildRow($entity);
  }

}
