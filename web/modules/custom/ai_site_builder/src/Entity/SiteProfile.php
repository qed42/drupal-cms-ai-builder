<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Entity;

use Drupal\Core\Entity\Attribute\ContentEntityType;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\Routing\DefaultHtmlRouteProvider;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\taxonomy\TermInterface;
use Drupal\user\EntityOwnerTrait;
use Drupal\Core\Entity\RevisionLogEntityTrait;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\ai_site_builder\Form\SiteProfileForm;

/**
 * Defines the site_profile entity.
 */
#[ContentEntityType(
  id: 'site_profile',
  label: new TranslatableMarkup('Site Profile'),
  label_collection: new TranslatableMarkup('Site Profiles'),
  label_singular: new TranslatableMarkup('site profile'),
  label_plural: new TranslatableMarkup('site profiles'),
  entity_keys: [
    'id' => 'id',
    'uuid' => 'uuid',
    'revision' => 'revision_id',
    'label' => 'site_name',
    'owner' => 'user_id',
  ],
  handlers: [
    'access' => SiteProfileAccessControlHandler::class,
    'list_builder' => SiteProfileListBuilder::class,
    'view_builder' => SiteProfileViewBuilder::class,
    'form' => [
      'default' => SiteProfileForm::class,
      'edit' => SiteProfileForm::class,
      'delete' => \Drupal\Core\Entity\ContentEntityDeleteForm::class,
    ],
    'route_provider' => [
      'html' => DefaultHtmlRouteProvider::class,
    ],
  ],
  links: [
    'canonical' => '/admin/content/site-profiles/{site_profile}',
    'add-form' => '/admin/content/site-profiles/add',
    'edit-form' => '/admin/content/site-profiles/{site_profile}/edit',
    'delete-form' => '/admin/content/site-profiles/{site_profile}/delete',
    'collection' => '/admin/content/site-profiles',
  ],
  base_table: 'site_profile',
  revision_table: 'site_profile_revision',
  admin_permission: 'administer site profiles',
  revision_metadata_keys: [
    'revision_user' => 'revision_uid',
    'revision_created' => 'revision_timestamp',
    'revision_log_message' => 'revision_log',
  ],
)]
class SiteProfile extends ContentEntityBase implements SiteProfileInterface, RevisionLogInterface {

  use EntityOwnerTrait;
  use EntityChangedTrait;
  use RevisionLogEntityTrait;

  /**
   * {@inheritdoc}
   */
  public function getSiteName(): string {
    return $this->get('site_name')->value ?? '';
  }

  /**
   * {@inheritdoc}
   */
  public function setSiteName(string $name): static {
    $this->set('site_name', $name);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getProfileStatus(): string {
    return $this->get('status')->value ?? self::STATUS_ONBOARDING;
  }

  /**
   * {@inheritdoc}
   */
  public function setProfileStatus(string $status): static {
    $this->set('status', $status);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getOnboardingStep(): int {
    return (int) ($this->get('onboarding_step')->value ?? 1);
  }

  /**
   * {@inheritdoc}
   */
  public function setOnboardingStep(int $step): static {
    $this->set('onboarding_step', $step);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getIndustry(): ?TermInterface {
    $industry = $this->get('industry')->entity;
    return $industry instanceof TermInterface ? $industry : NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getGenerationStatus(): ?string {
    return $this->get('generation_status')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setGenerationStatus(string $status): static {
    $this->set('generation_status', $status);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getSubscriptionStatus(): ?string {
    return $this->get('subscription_status')->value;
  }

  /**
   * {@inheritdoc}
   */
  public function setSubscriptionStatus(string $status): static {
    $this->set('subscription_status', $status);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type): array {
    $fields = parent::baseFieldDefinitions($entity_type);
    $fields += static::ownerBaseFieldDefinitions($entity_type);
    $fields += static::revisionLogBaseFieldDefinitions($entity_type);

    // Owner field settings.
    $fields['user_id']
      ->setLabel(new TranslatableMarkup('Owner'))
      ->setDescription(new TranslatableMarkup('The user who owns this site profile.'))
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 0,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => 60,
        ],
      ]);

    // --- Status fields ---

    $fields['status'] = BaseFieldDefinition::create('list_string')
      ->setLabel(new TranslatableMarkup('Status'))
      ->setDescription(new TranslatableMarkup('The current status of the site profile.'))
      ->setDefaultValue(self::STATUS_ONBOARDING)
      ->setRequired(TRUE)
      ->setRevisionable(TRUE)
      ->setSetting('allowed_values', [
        self::STATUS_ONBOARDING => 'Onboarding',
        self::STATUS_GENERATING => 'Generating',
        self::STATUS_GENERATED => 'Generated',
        self::STATUS_PUBLISHED => 'Published',
        self::STATUS_EXPIRED => 'Expired',
      ])
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'list_default',
        'weight' => 1,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_select',
        'weight' => 1,
      ]);

    $fields['onboarding_step'] = BaseFieldDefinition::create('integer')
      ->setLabel(new TranslatableMarkup('Onboarding Step'))
      ->setDescription(new TranslatableMarkup('Current onboarding wizard step (1-5).'))
      ->setDefaultValue(1)
      ->setRevisionable(TRUE)
      ->setSetting('min', 1)
      ->setSetting('max', 5)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'number_integer',
        'weight' => 2,
      ])
      ->setDisplayOptions('form', [
        'type' => 'number',
        'weight' => 2,
      ]);

    // --- Step 1: Basics ---

    $fields['site_name'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Site Name'))
      ->setDescription(new TranslatableMarkup('The name of the website.'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 100)
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'string',
        'weight' => 3,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 3,
      ]);

    $fields['tagline'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Tagline'))
      ->setDescription(new TranslatableMarkup('A short tagline for the website.'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 255)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 4,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 4,
      ]);

    $fields['logo'] = BaseFieldDefinition::create('file')
      ->setLabel(new TranslatableMarkup('Logo'))
      ->setDescription(new TranslatableMarkup('The site logo (PNG, JPG, or SVG, max 5MB).'))
      ->setRevisionable(TRUE)
      ->setSetting('file_extensions', 'png jpg jpeg svg')
      ->setSetting('max_filesize', '5MB')
      ->setSetting('file_directory', 'site-profiles/logos')
      ->setSetting('uri_scheme', 'public')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'file_default',
        'weight' => 5,
      ])
      ->setDisplayOptions('form', [
        'type' => 'file_generic',
        'weight' => 5,
      ]);

    $fields['admin_email'] = BaseFieldDefinition::create('email')
      ->setLabel(new TranslatableMarkup('Admin Email'))
      ->setDescription(new TranslatableMarkup('The administrative email for the site.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'email_mailto',
        'weight' => 6,
      ])
      ->setDisplayOptions('form', [
        'type' => 'email_default',
        'weight' => 6,
      ]);

    // --- Step 2: Industry ---

    $fields['industry'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(new TranslatableMarkup('Industry'))
      ->setDescription(new TranslatableMarkup('The industry classification for this site.'))
      ->setRevisionable(TRUE)
      ->setSetting('target_type', 'taxonomy_term')
      ->setSetting('handler', 'default:taxonomy_term')
      ->setSetting('handler_settings', [
        'target_bundles' => ['industry' => 'industry'],
      ])
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'entity_reference_label',
        'weight' => 7,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_select',
        'weight' => 7,
      ]);

    $fields['industry_other'] = BaseFieldDefinition::create('text_long')
      ->setLabel(new TranslatableMarkup('Industry (Other)'))
      ->setDescription(new TranslatableMarkup('Free-text description if "Other" industry is selected.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'text_default',
        'weight' => 8,
      ])
      ->setDisplayOptions('form', [
        'type' => 'text_textarea',
        'weight' => 8,
      ]);

    // --- Step 3: Brand ---

    $fields['color_primary'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Primary Color'))
      ->setDescription(new TranslatableMarkup('Primary brand color in hex format (#RRGGBB).'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 7)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 9,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 9,
      ]);

    $fields['color_secondary'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Secondary Color'))
      ->setDescription(new TranslatableMarkup('Secondary brand color in hex format (#RRGGBB).'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 7)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 10,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 10,
      ]);

    $fields['color_accent'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Accent Color'))
      ->setDescription(new TranslatableMarkup('Accent brand color in hex format (#RRGGBB).'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 7)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 11,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 11,
      ]);

    $fields['font_heading'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Heading Font'))
      ->setDescription(new TranslatableMarkup('Google Font name for headings.'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 100)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 12,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 12,
      ]);

    $fields['font_body'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Body Font'))
      ->setDescription(new TranslatableMarkup('Google Font name for body text.'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 100)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 13,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 13,
      ]);

    $fields['reference_urls'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Reference URLs'))
      ->setDescription(new TranslatableMarkup('URLs of websites the user likes for inspiration.'))
      ->setRevisionable(TRUE)
      ->setCardinality(3)
      ->setSetting('max_length', 2048)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => 14,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 14,
      ]);

    $fields['brand_guidelines'] = BaseFieldDefinition::create('file')
      ->setLabel(new TranslatableMarkup('Brand Guidelines'))
      ->setDescription(new TranslatableMarkup('Brand guidelines document (PDF, PNG, JPG, max 10MB).'))
      ->setRevisionable(TRUE)
      ->setSetting('file_extensions', 'pdf png jpg jpeg')
      ->setSetting('max_filesize', '10MB')
      ->setSetting('file_directory', 'site-profiles/brand-guidelines')
      ->setSetting('uri_scheme', 'public')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'file_default',
        'weight' => 15,
      ])
      ->setDisplayOptions('form', [
        'type' => 'file_generic',
        'weight' => 15,
      ]);

    // --- Step 4: Business Context ---

    $fields['services'] = BaseFieldDefinition::create('text_long')
      ->setLabel(new TranslatableMarkup('Services'))
      ->setDescription(new TranslatableMarkup('List of services offered (one per line).'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'text_default',
        'weight' => 16,
      ])
      ->setDisplayOptions('form', [
        'type' => 'text_textarea',
        'weight' => 16,
      ]);

    $fields['target_audience'] = BaseFieldDefinition::create('text_long')
      ->setLabel(new TranslatableMarkup('Target Audience'))
      ->setDescription(new TranslatableMarkup('Description of the target audience (max 500 chars).'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'text_default',
        'weight' => 17,
      ])
      ->setDisplayOptions('form', [
        'type' => 'text_textarea',
        'weight' => 17,
      ]);

    $fields['competitors'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Competitors'))
      ->setDescription(new TranslatableMarkup('Competitor business names or URLs.'))
      ->setRevisionable(TRUE)
      ->setCardinality(3)
      ->setSetting('max_length', 255)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => 18,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 18,
      ]);

    $fields['ctas'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Calls to Action'))
      ->setDescription(new TranslatableMarkup('Desired calls to action for the website.'))
      ->setRevisionable(TRUE)
      ->setCardinality(5)
      ->setSetting('max_length', 255)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => 19,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => 19,
      ]);

    // --- Step 5: Dynamic Questions ---

    $fields['industry_answers'] = BaseFieldDefinition::create('map')
      ->setLabel(new TranslatableMarkup('Industry Answers'))
      ->setDescription(new TranslatableMarkup('Serialized Q&A pairs from dynamic industry questions.'))
      ->setRevisionable(TRUE);

    $fields['compliance_flags'] = BaseFieldDefinition::create('list_string')
      ->setLabel(new TranslatableMarkup('Compliance Flags'))
      ->setDescription(new TranslatableMarkup('Applicable compliance requirements.'))
      ->setRevisionable(TRUE)
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setSetting('allowed_values', [
        'hipaa' => 'HIPAA',
        'ada' => 'ADA',
        'gdpr' => 'GDPR',
        'pci' => 'PCI',
        'ferpa' => 'FERPA',
      ])
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'list_default',
        'weight' => 21,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_buttons',
        'weight' => 21,
      ]);

    // --- Generation Metadata ---

    $fields['generation_status'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Generation Step'))
      ->setDescription(new TranslatableMarkup('The current generation pipeline step ID.'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 50)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 22,
      ]);

    $fields['generation_started'] = BaseFieldDefinition::create('timestamp')
      ->setLabel(new TranslatableMarkup('Generation Started'))
      ->setDescription(new TranslatableMarkup('When site generation was initiated.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'timestamp',
        'weight' => 23,
      ]);

    $fields['generation_completed'] = BaseFieldDefinition::create('timestamp')
      ->setLabel(new TranslatableMarkup('Generation Completed'))
      ->setDescription(new TranslatableMarkup('When site generation finished.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'timestamp',
        'weight' => 24,
      ]);

    $fields['generated_pages'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(new TranslatableMarkup('Generated Pages'))
      ->setDescription(new TranslatableMarkup('References to generated page nodes.'))
      ->setRevisionable(TRUE)
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setSetting('target_type', 'node')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'entity_reference_label',
        'weight' => 25,
      ]);

    $fields['generated_content_types'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Generated Content Types'))
      ->setDescription(new TranslatableMarkup('Machine names of content types used for this site.'))
      ->setRevisionable(TRUE)
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setSetting('max_length', 64)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => 26,
      ]);

    // --- Trial & Subscription ---

    $fields['trial_start'] = BaseFieldDefinition::create('timestamp')
      ->setLabel(new TranslatableMarkup('Trial Start'))
      ->setDescription(new TranslatableMarkup('When the trial period started.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'timestamp',
        'weight' => 27,
      ]);

    $fields['trial_end'] = BaseFieldDefinition::create('timestamp')
      ->setLabel(new TranslatableMarkup('Trial End'))
      ->setDescription(new TranslatableMarkup('When the trial period ends.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'timestamp',
        'weight' => 28,
      ]);

    $fields['subscription_id'] = BaseFieldDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Subscription ID'))
      ->setDescription(new TranslatableMarkup('External payment reference (e.g. Stripe subscription ID).'))
      ->setRevisionable(TRUE)
      ->setSetting('max_length', 255)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
        'weight' => 29,
      ]);

    $fields['subscription_status'] = BaseFieldDefinition::create('list_string')
      ->setLabel(new TranslatableMarkup('Subscription Status'))
      ->setDescription(new TranslatableMarkup('Current subscription status.'))
      ->setRevisionable(TRUE)
      ->setSetting('allowed_values', [
        self::SUBSCRIPTION_TRIAL => 'Trial',
        self::SUBSCRIPTION_ACTIVE => 'Active',
        self::SUBSCRIPTION_EXPIRED => 'Expired',
        self::SUBSCRIPTION_CANCELLED => 'Cancelled',
      ])
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'list_default',
        'weight' => 30,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_select',
        'weight' => 30,
      ]);

    // --- Timestamps ---

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(new TranslatableMarkup('Created'))
      ->setDescription(new TranslatableMarkup('The time the site profile was created.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'timestamp',
        'weight' => 31,
      ]);

    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(new TranslatableMarkup('Changed'))
      ->setDescription(new TranslatableMarkup('The time the site profile was last updated.'))
      ->setRevisionable(TRUE);

    return $fields;
  }

}
