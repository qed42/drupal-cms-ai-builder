<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Form;

use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Multi-step onboarding wizard form.
 *
 * Manages steps 1-5 of the onboarding process, saving data to the user's
 * SiteProfile entity at each step transition.
 */
class OnboardingWizardForm extends FormBase {

  /**
   * Total number of wizard steps.
   */
  const TOTAL_STEPS = 5;

  /**
   * Industry-aware default color palettes.
   */
  const INDUSTRY_PALETTES = [
    'Healthcare' => ['#0077B6', '#00B4D8', '#48CAE4'],
    'Legal' => ['#1B263B', '#415A77', '#778DA9'],
    'Real Estate' => ['#2D6A4F', '#40916C', '#95D5B2'],
    'Restaurant' => ['#E63946', '#F4A261', '#E9C46A'],
    'Professional Services' => ['#023E8A', '#0077B6', '#90E0EF'],
    'Other' => ['#6C63FF', '#3F37C9', '#7209B7'],
  ];

  /**
   * Curated Google Font pairings (heading / body).
   */
  const FONT_PAIRINGS = [
    'Montserrat / Open Sans' => ['Montserrat', 'Open Sans'],
    'Playfair Display / Source Sans Pro' => ['Playfair Display', 'Source Sans Pro'],
    'Roboto Slab / Roboto' => ['Roboto Slab', 'Roboto'],
    'Lora / Merriweather Sans' => ['Lora', 'Merriweather Sans'],
    'Poppins / Nunito' => ['Poppins', 'Nunito'],
    'Oswald / Quattrocento' => ['Oswald', 'Quattrocento'],
    'Raleway / Lato' => ['Raleway', 'Lato'],
    'DM Serif Display / DM Sans' => ['DM Serif Display', 'DM Sans'],
  ];

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected AccountProxyInterface $currentUser,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('current_user'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'ai_site_builder_onboarding_wizard';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $profile = $this->loadCurrentProfile();
    if (!$profile) {
      $form['error'] = [
        '#markup' => '<p>' . $this->t('No site profile found. Please <a href="@url">register</a> first.', [
          '@url' => Url::fromRoute('ai_site_builder.register')->toString(),
        ]) . '</p>',
      ];
      return $form;
    }

    // Determine current step from form state or entity.
    $step = $form_state->get('step');
    if ($step === NULL) {
      $step = $profile->getOnboardingStep();
      $form_state->set('step', $step);
    }

    // Store profile ID for submit handlers.
    $form_state->set('profile_id', $profile->id());

    // Wrapper for AJAX replacement.
    $form['#prefix'] = '<div id="onboarding-wizard-wrapper">';
    $form['#suffix'] = '</div>';

    // Progress indicator.
    $form['progress'] = $this->buildProgressIndicator($step);

    // Step content container.
    $form['step_content'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['wizard-step-content']],
    ];

    // Build the current step.
    switch ($step) {
      case 1:
        $this->buildStep1($form['step_content'], $form_state, $profile);
        break;

      case 2:
        $this->buildStep2($form['step_content'], $form_state, $profile);
        break;

      case 3:
        $this->buildStep3($form['step_content'], $form_state, $profile);
        break;

      case 4:
        $this->buildStep4($form['step_content'], $form_state, $profile);
        break;

      case 5:
        // Step 5 (AI-generated questions) is Sprint 03.
        $form['step_content']['placeholder'] = [
          '#markup' => '<p>' . $this->t('Step 5: AI-generated industry questions will be available soon.') . '</p>',
        ];
        break;
    }

    // Navigation buttons.
    $form['actions'] = [
      '#type' => 'actions',
      '#attributes' => ['class' => ['wizard-actions']],
    ];

    if ($step > 1) {
      $form['actions']['back'] = [
        '#type' => 'submit',
        '#value' => $this->t('Back'),
        '#submit' => ['::backStep'],
        '#limit_validation_errors' => [],
        '#ajax' => [
          'callback' => '::ajaxRefresh',
          'wrapper' => 'onboarding-wizard-wrapper',
        ],
        '#attributes' => ['class' => ['wizard-btn-back']],
      ];
    }

    if ($step < self::TOTAL_STEPS) {
      $form['actions']['next'] = [
        '#type' => 'submit',
        '#value' => $this->t('Next'),
        '#submit' => ['::nextStep'],
        '#ajax' => [
          'callback' => '::ajaxRefresh',
          'wrapper' => 'onboarding-wizard-wrapper',
        ],
        '#button_type' => 'primary',
        '#attributes' => ['class' => ['wizard-btn-next']],
      ];
    }

    // Attach library.
    $form['#attached']['library'][] = 'ai_site_builder/onboarding_wizard';

    return $form;
  }

  /**
   * Builds the progress indicator render array.
   */
  protected function buildProgressIndicator(int $current_step): array {
    $steps = [
      1 => $this->t('Site Basics'),
      2 => $this->t('Industry'),
      3 => $this->t('Brand'),
      4 => $this->t('Business'),
      5 => $this->t('Questions'),
    ];

    $items = [];
    foreach ($steps as $num => $label) {
      $state = 'upcoming';
      if ($num < $current_step) {
        $state = 'completed';
      }
      elseif ($num === $current_step) {
        $state = 'current';
      }

      $items[] = [
        '#markup' => '<span class="wizard-step wizard-step--' . $state . '">'
          . '<span class="wizard-step__number">' . $num . '</span>'
          . '<span class="wizard-step__label">' . $label . '</span>'
          . '</span>',
      ];
    }

    return [
      '#theme' => 'item_list',
      '#items' => $items,
      '#attributes' => ['class' => ['wizard-progress']],
      '#prefix' => '<div class="wizard-progress-wrapper"><span class="wizard-progress-text">' . $this->t('Step @current of @total', ['@current' => $current_step, '@total' => self::TOTAL_STEPS]) . '</span>',
      '#suffix' => '</div>',
    ];
  }

  /**
   * Step 1: Site Basics — site name, tagline, logo, admin email.
   */
  protected function buildStep1(array &$form, FormStateInterface $form_state, SiteProfileInterface $profile): void {
    $form['step_title'] = [
      '#markup' => '<h2>' . $this->t('Tell us about your site') . '</h2>',
    ];

    $form['site_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Site Name'),
      '#description' => $this->t('The name of your website (2-100 characters).'),
      '#required' => TRUE,
      '#maxlength' => 100,
      '#default_value' => $profile->getSiteName(),
      '#attributes' => ['placeholder' => $this->t('My Awesome Business')],
    ];

    $form['tagline'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Tagline'),
      '#description' => $this->t('A short tagline for your website (optional).'),
      '#maxlength' => 255,
      '#default_value' => $profile->get('tagline')->value ?? '',
      '#attributes' => ['placeholder' => $this->t('Your business, simplified')],
    ];

    $form['logo'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Logo'),
      '#description' => $this->t('Upload your logo (PNG, JPG, or SVG, max 5MB). Optional.'),
      '#upload_location' => 'public://site-profiles/logos',
      '#upload_validators' => [
        'file_validate_extensions' => ['png jpg jpeg svg'],
        'file_validate_size' => [5 * 1024 * 1024],
      ],
      '#default_value' => $profile->get('logo')->target_id ? [$profile->get('logo')->target_id] : [],
    ];

    $form['admin_email'] = [
      '#type' => 'email',
      '#title' => $this->t('Admin Email'),
      '#description' => $this->t('The administrative contact email for your site.'),
      '#required' => TRUE,
      '#default_value' => $profile->get('admin_email')->value ?: $this->currentUser->getEmail(),
    ];
  }

  /**
   * Step 2: Industry Selection — visual cards with "Other" fallback.
   */
  protected function buildStep2(array &$form, FormStateInterface $form_state, SiteProfileInterface $profile): void {
    $form['step_title'] = [
      '#markup' => '<h2>' . $this->t('What industry is your business in?') . '</h2>',
    ];

    // Load industry taxonomy terms.
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')
      ->loadByProperties(['vid' => 'industry']);

    $options = [];
    $other_tid = NULL;
    foreach ($terms as $term) {
      $options[$term->id()] = $term->label();
      if ($term->label() === 'Other') {
        $other_tid = $term->id();
      }
    }

    $current_industry = $profile->get('industry')->target_id;

    $form['industry'] = [
      '#type' => 'radios',
      '#title' => $this->t('Select your industry'),
      '#title_display' => 'invisible',
      '#options' => $options,
      '#required' => TRUE,
      '#default_value' => $current_industry,
      '#attributes' => ['class' => ['industry-cards']],
    ];

    $form['industry_other'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Describe your industry'),
      '#description' => $this->t('Please describe your industry or business type.'),
      '#default_value' => $profile->get('industry_other')->value ?? '',
      '#rows' => 3,
      '#states' => [
        'visible' => [
          ':input[name="industry"]' => ['value' => (string) $other_tid],
        ],
        'required' => [
          ':input[name="industry"]' => ['value' => (string) $other_tid],
        ],
      ],
    ];
  }

  /**
   * Step 3: Brand Input — colors, fonts, reference URLs, brand guidelines.
   */
  protected function buildStep3(array &$form, FormStateInterface $form_state, SiteProfileInterface $profile): void {
    $form['step_title'] = [
      '#markup' => '<h2>' . $this->t('Define your brand') . '</h2>',
      '#prefix' => '<div class="step-intro">',
      '#suffix' => '<p>' . $this->t('All fields are optional — we\'ll use sensible defaults if you skip anything.') . '</p></div>',
    ];

    // Determine default palette based on selected industry.
    $industry = $profile->getIndustry();
    $industry_name = $industry ? $industry->label() : 'Other';
    $defaults = self::INDUSTRY_PALETTES[$industry_name] ?? self::INDUSTRY_PALETTES['Other'];

    $form['colors'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Brand Colors'),
      '#description' => $this->t('Enter hex color codes (e.g., #FF5733). Defaults are based on your industry.'),
    ];

    $form['colors']['color_primary'] = [
      '#type' => 'color',
      '#title' => $this->t('Primary Color'),
      '#default_value' => $profile->get('color_primary')->value ?: $defaults[0],
    ];

    $form['colors']['color_secondary'] = [
      '#type' => 'color',
      '#title' => $this->t('Secondary Color'),
      '#default_value' => $profile->get('color_secondary')->value ?: $defaults[1],
    ];

    $form['colors']['color_accent'] = [
      '#type' => 'color',
      '#title' => $this->t('Accent Color'),
      '#default_value' => $profile->get('color_accent')->value ?: $defaults[2],
    ];

    // Font selector.
    $font_options = [];
    foreach (self::FONT_PAIRINGS as $label => $fonts) {
      $font_options[$label] = $label;
    }

    // Determine current font pairing from saved values.
    $current_heading = $profile->get('font_heading')->value ?? '';
    $current_body = $profile->get('font_body')->value ?? '';
    $current_pairing = '';
    foreach (self::FONT_PAIRINGS as $label => $fonts) {
      if ($fonts[0] === $current_heading && $fonts[1] === $current_body) {
        $current_pairing = $label;
        break;
      }
    }

    $form['font_pairing'] = [
      '#type' => 'radios',
      '#title' => $this->t('Font Pairing'),
      '#description' => $this->t('Select a heading + body font combination.'),
      '#options' => $font_options,
      '#default_value' => $current_pairing ?: 'Montserrat / Open Sans',
      '#attributes' => ['class' => ['font-pairing-selector']],
    ];

    // Reference URLs.
    $form['reference_urls'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Reference Websites'),
      '#description' => $this->t('Share up to 3 websites you like for inspiration (optional).'),
    ];

    $saved_urls = [];
    foreach ($profile->get('reference_urls') as $item) {
      $saved_urls[] = $item->value;
    }

    for ($i = 0; $i < 3; $i++) {
      $form['reference_urls']['reference_url_' . $i] = [
        '#type' => 'url',
        '#title' => $this->t('Reference URL @num', ['@num' => $i + 1]),
        '#title_display' => 'invisible',
        '#default_value' => $saved_urls[$i] ?? '',
        '#attributes' => ['placeholder' => $this->t('https://example.com')],
      ];
    }

    // Brand guidelines upload.
    $form['brand_guidelines'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Brand Guidelines'),
      '#description' => $this->t('Upload a brand guidelines document (PDF, PNG, JPG, max 10MB). Optional.'),
      '#upload_location' => 'public://site-profiles/brand-guidelines',
      '#upload_validators' => [
        'file_validate_extensions' => ['pdf png jpg jpeg'],
        'file_validate_size' => [10 * 1024 * 1024],
      ],
      '#default_value' => $profile->get('brand_guidelines')->target_id ? [$profile->get('brand_guidelines')->target_id] : [],
    ];
  }

  /**
   * Step 4: Business Context — services, audience, competitors, CTAs.
   */
  protected function buildStep4(array &$form, FormStateInterface $form_state, SiteProfileInterface $profile): void {
    $form['step_title'] = [
      '#markup' => '<h2>' . $this->t('Tell us about your business') . '</h2>',
    ];

    $form['services'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Services Offered'),
      '#description' => $this->t('List your services or products, one per line. At least one is required.'),
      '#required' => TRUE,
      '#rows' => 5,
      '#default_value' => $profile->get('services')->value ?? '',
      '#attributes' => ['placeholder' => "Web Design\nSEO Optimization\nContent Marketing"],
    ];

    $form['target_audience'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Target Audience'),
      '#description' => $this->t('Describe your ideal customers (max 500 characters).'),
      '#rows' => 3,
      '#maxlength' => 500,
      '#default_value' => $profile->get('target_audience')->value ?? '',
      '#attributes' => [
        'placeholder' => $this->t('Small business owners looking for affordable web presence...'),
      ],
    ];

    // Competitors.
    $form['competitors_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Competitors'),
      '#description' => $this->t('Name up to 3 competitors (optional).'),
    ];

    $saved_competitors = [];
    foreach ($profile->get('competitors') as $item) {
      $saved_competitors[] = $item->value;
    }

    for ($i = 0; $i < 3; $i++) {
      $form['competitors_fieldset']['competitor_' . $i] = [
        '#type' => 'textfield',
        '#title' => $this->t('Competitor @num', ['@num' => $i + 1]),
        '#title_display' => 'invisible',
        '#default_value' => $saved_competitors[$i] ?? '',
        '#maxlength' => 255,
        '#attributes' => ['placeholder' => $this->t('Competitor name or URL')],
      ];
    }

    // CTAs.
    $form['ctas_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Calls to Action'),
      '#description' => $this->t('What actions should visitors take on your site? (Up to 5)'),
    ];

    $saved_ctas = [];
    foreach ($profile->get('ctas') as $item) {
      $saved_ctas[] = $item->value;
    }

    $cta_placeholders = [
      'Book Now',
      'Get a Quote',
      'Contact Us',
      'Shop Now',
      'Learn More',
    ];

    for ($i = 0; $i < 5; $i++) {
      $form['ctas_fieldset']['cta_' . $i] = [
        '#type' => 'textfield',
        '#title' => $this->t('CTA @num', ['@num' => $i + 1]),
        '#title_display' => 'invisible',
        '#default_value' => $saved_ctas[$i] ?? '',
        '#maxlength' => 255,
        '#attributes' => ['placeholder' => $cta_placeholders[$i] ?? ''],
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $step = $form_state->get('step');
    $triggering_element = $form_state->getTriggeringElement();

    // Skip validation on "Back" button.
    if ($triggering_element && isset($triggering_element['#submit']) && in_array('::backStep', $triggering_element['#submit'])) {
      return;
    }

    switch ($step) {
      case 1:
        $this->validateStep1($form_state);
        break;

      case 2:
        $this->validateStep2($form_state);
        break;

      case 3:
        $this->validateStep3($form_state);
        break;

      case 4:
        $this->validateStep4($form_state);
        break;
    }
  }

  /**
   * Validates Step 1 fields.
   */
  protected function validateStep1(FormStateInterface $form_state): void {
    $site_name = trim($form_state->getValue('site_name') ?? '');
    if (mb_strlen($site_name) < 2) {
      $form_state->setErrorByName('site_name', $this->t('Site name must be at least 2 characters.'));
    }
  }

  /**
   * Validates Step 2 fields.
   */
  protected function validateStep2(FormStateInterface $form_state): void {
    $industry = $form_state->getValue('industry');
    if (empty($industry)) {
      $form_state->setErrorByName('industry', $this->t('Please select an industry.'));
      return;
    }

    // If "Other" is selected, require the description.
    $term = $this->entityTypeManager->getStorage('taxonomy_term')->load($industry);
    if ($term && $term->label() === 'Other') {
      $other_text = trim($form_state->getValue('industry_other') ?? '');
      if (empty($other_text)) {
        $form_state->setErrorByName('industry_other', $this->t('Please describe your industry.'));
      }
    }
  }

  /**
   * Validates Step 3 fields.
   */
  protected function validateStep3(FormStateInterface $form_state): void {
    // Validate reference URLs if provided.
    for ($i = 0; $i < 3; $i++) {
      $url = trim($form_state->getValue('reference_url_' . $i) ?? '');
      if (!empty($url) && !filter_var($url, FILTER_VALIDATE_URL)) {
        $form_state->setErrorByName('reference_url_' . $i, $this->t('Please enter a valid URL.'));
      }
    }
  }

  /**
   * Validates Step 4 fields.
   */
  protected function validateStep4(FormStateInterface $form_state): void {
    $services = trim($form_state->getValue('services') ?? '');
    if (empty($services)) {
      $form_state->setErrorByName('services', $this->t('Please enter at least one service.'));
    }

    $audience = trim($form_state->getValue('target_audience') ?? '');
    if (mb_strlen($audience) > 500) {
      $form_state->setErrorByName('target_audience', $this->t('Target audience must be 500 characters or fewer.'));
    }
  }

  /**
   * Submit handler for "Next" button.
   */
  public function nextStep(array &$form, FormStateInterface $form_state): void {
    $step = $form_state->get('step');
    $profile = $this->loadProfile($form_state);

    if ($profile) {
      $this->saveStepData($step, $form_state, $profile);
      $next_step = min($step + 1, self::TOTAL_STEPS);
      $profile->setOnboardingStep($next_step);
      $profile->save();
      $form_state->set('step', $next_step);
    }

    $form_state->setRebuild();
  }

  /**
   * Submit handler for "Back" button.
   */
  public function backStep(array &$form, FormStateInterface $form_state): void {
    $step = $form_state->get('step');
    $prev_step = max($step - 1, 1);
    $form_state->set('step', $prev_step);
    $form_state->setRebuild();
  }

  /**
   * AJAX callback to refresh the wizard.
   */
  public function ajaxRefresh(array &$form, FormStateInterface $form_state): array {
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // Default submit — handled by nextStep/backStep.
  }

  /**
   * Saves step data to the SiteProfile entity.
   */
  protected function saveStepData(int $step, FormStateInterface $form_state, SiteProfileInterface $profile): void {
    switch ($step) {
      case 1:
        $profile->setSiteName(trim($form_state->getValue('site_name') ?? ''));
        $profile->set('tagline', trim($form_state->getValue('tagline') ?? ''));
        $profile->set('admin_email', trim($form_state->getValue('admin_email') ?? ''));
        // Handle logo file.
        $logo = $form_state->getValue('logo');
        if (!empty($logo)) {
          $fid = is_array($logo) ? reset($logo) : $logo;
          if ($fid) {
            $profile->set('logo', $fid);
            // Make file permanent.
            $file = $this->entityTypeManager->getStorage('file')->load($fid);
            if ($file && $file->isTemporary()) {
              $file->setPermanent();
              $file->save();
            }
          }
        }
        else {
          $profile->set('logo', NULL);
        }
        break;

      case 2:
        $profile->set('industry', $form_state->getValue('industry'));
        $profile->set('industry_other', trim($form_state->getValue('industry_other') ?? ''));
        break;

      case 3:
        $profile->set('color_primary', $form_state->getValue('color_primary'));
        $profile->set('color_secondary', $form_state->getValue('color_secondary'));
        $profile->set('color_accent', $form_state->getValue('color_accent'));

        // Resolve font pairing.
        $pairing = $form_state->getValue('font_pairing');
        if ($pairing && isset(self::FONT_PAIRINGS[$pairing])) {
          $fonts = self::FONT_PAIRINGS[$pairing];
          $profile->set('font_heading', $fonts[0]);
          $profile->set('font_body', $fonts[1]);
        }

        // Reference URLs.
        $urls = [];
        for ($i = 0; $i < 3; $i++) {
          $url = trim($form_state->getValue('reference_url_' . $i) ?? '');
          if (!empty($url)) {
            $urls[] = $url;
          }
        }
        $profile->set('reference_urls', $urls);

        // Brand guidelines file.
        $guidelines = $form_state->getValue('brand_guidelines');
        if (!empty($guidelines)) {
          $fid = is_array($guidelines) ? reset($guidelines) : $guidelines;
          if ($fid) {
            $profile->set('brand_guidelines', $fid);
            $file = $this->entityTypeManager->getStorage('file')->load($fid);
            if ($file && $file->isTemporary()) {
              $file->setPermanent();
              $file->save();
            }
          }
        }
        else {
          $profile->set('brand_guidelines', NULL);
        }
        break;

      case 4:
        $profile->set('services', trim($form_state->getValue('services') ?? ''));
        $profile->set('target_audience', trim($form_state->getValue('target_audience') ?? ''));

        // Competitors (multi-value field).
        $competitors = [];
        for ($i = 0; $i < 3; $i++) {
          $comp = trim($form_state->getValue('competitor_' . $i) ?? '');
          if (!empty($comp)) {
            $competitors[] = $comp;
          }
        }
        $profile->set('competitors', $competitors);

        // CTAs (multi-value field).
        $ctas = [];
        for ($i = 0; $i < 5; $i++) {
          $cta = trim($form_state->getValue('cta_' . $i) ?? '');
          if (!empty($cta)) {
            $ctas[] = $cta;
          }
        }
        $profile->set('ctas', $ctas);
        break;
    }
  }

  /**
   * Loads the current user's SiteProfile.
   */
  protected function loadCurrentProfile(): ?SiteProfileInterface {
    $profiles = $this->entityTypeManager->getStorage('site_profile')
      ->loadByProperties(['user_id' => $this->currentUser->id()]);

    if (empty($profiles)) {
      return NULL;
    }

    $profile = reset($profiles);
    return $profile instanceof SiteProfileInterface ? $profile : NULL;
  }

  /**
   * Loads the profile from form state.
   */
  protected function loadProfile(FormStateInterface $form_state): ?SiteProfileInterface {
    $profile_id = $form_state->get('profile_id');
    if (!$profile_id) {
      return $this->loadCurrentProfile();
    }

    $profile = $this->entityTypeManager->getStorage('site_profile')->load($profile_id);
    return $profile instanceof SiteProfileInterface ? $profile : NULL;
  }

}
