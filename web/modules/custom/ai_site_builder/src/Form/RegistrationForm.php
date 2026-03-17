<?php

declare(strict_types=1);

namespace Drupal\ai_site_builder\Form;

use Drupal\ai_site_builder\Entity\SiteProfile;
use Drupal\ai_site_builder\Entity\SiteProfileInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Url;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Simplified registration form for site owners.
 */
class RegistrationForm extends FormBase {

  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected MailManagerInterface $mailManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('plugin.manager.mail'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'ai_site_builder_registration_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['email'] = [
      '#type' => 'email',
      '#title' => $this->t('Email Address'),
      '#required' => TRUE,
      '#maxlength' => 254,
      '#attributes' => [
        'placeholder' => $this->t('you@example.com'),
        'autocomplete' => 'email',
      ],
    ];

    $form['pass'] = [
      '#type' => 'password_confirm',
      '#required' => TRUE,
      '#size' => 25,
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Start Building'),
      '#button_type' => 'primary',
    ];

    $form['login_link'] = [
      '#markup' => '<p>' . $this->t('Already have an account? <a href="@url">Log in</a>.', [
        '@url' => Url::fromRoute('user.login')->toString(),
      ]) . '</p>',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $email = trim($form_state->getValue('email'));

    // Check for duplicate email.
    $existing = $this->entityTypeManager->getStorage('user')
      ->loadByProperties(['mail' => $email]);

    if (!empty($existing)) {
      $form_state->setErrorByName('email', $this->t('An account with this email already exists. <a href="@url">Log in instead</a>.', [
        '@url' => Url::fromRoute('user.login')->toString(),
      ]));
    }

    // Also check username collision (we use email as username).
    $existing_name = $this->entityTypeManager->getStorage('user')
      ->loadByProperties(['name' => $email]);

    if (!empty($existing_name)) {
      $form_state->setErrorByName('email', $this->t('An account with this email already exists.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $email = trim($form_state->getValue('email'));
    $password = $form_state->getValue('pass');

    // 1. Create user account.
    $user = User::create([
      'name' => $email,
      'mail' => $email,
      'pass' => $password,
      'status' => 1,
    ]);
    $user->addRole('site_owner');
    $user->save();

    // 2. Create SiteProfile.
    $profile = SiteProfile::create([
      'user_id' => $user->id(),
      'site_name' => '',
      'status' => SiteProfileInterface::STATUS_ONBOARDING,
      'onboarding_step' => 1,
      'admin_email' => $email,
      'subscription_status' => SiteProfileInterface::SUBSCRIPTION_TRIAL,
      'trial_start' => \Drupal::time()->getRequestTime(),
      'trial_end' => \Drupal::time()->getRequestTime() + (14 * 86400),
    ]);
    $profile->save();

    // 3. Log user in.
    user_login_finalize($user);

    // 4. Send welcome email.
    $this->mailManager->mail('ai_site_builder', 'welcome', $email, $user->getPreferredLangcode(), [
      'account' => $user,
    ]);

    $this->messenger()->addStatus($this->t('Welcome! Your account has been created. Let\'s build your website.'));

    // 5. Redirect to onboarding.
    $form_state->setRedirect('ai_site_builder.onboarding');
  }

}
