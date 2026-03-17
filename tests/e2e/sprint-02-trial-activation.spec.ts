import { test, expect } from '@playwright/test';
import { registerUser, uniqueEmail } from './helpers';
import { execFileSync } from 'child_process';

const PROJECT_DIR = '/Users/piyuesh23/Development/ai-experiments/drupal-cms-ai-builder';

/**
 * Helper: run a Drush php:eval command and return stdout.
 */
function drushEval(phpCode: string): string {
  return execFileSync('ddev', ['drush', 'php:eval', phpCode], {
    cwd: PROJECT_DIR,
    encoding: 'utf-8',
    timeout: 30000,
  }).trim();
}

/**
 * TASK-005: Trial Activation Service.
 *
 * Verifies the TrialManager service activates trials on registration
 * and that trial dates are properly stored on the SiteProfile entity.
 */
test.describe('TASK-005: Trial Activation', () => {

  test('Trial starts automatically on registration', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Verify trial dates via Drush.
    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      echo 'trial_start=' . $profile->get('trial_start')->value . PHP_EOL;
      echo 'trial_end=' . $profile->get('trial_end')->value . PHP_EOL;
      echo 'subscription_status=' . $profile->get('subscription_status')->value . PHP_EOL;
    `);

    expect(result).toContain('subscription_status=trial');
    // trial_start and trial_end should be set (non-empty).
    const trialStart = result.match(/trial_start=(\d+)/);
    const trialEnd = result.match(/trial_end=(\d+)/);
    expect(trialStart).not.toBeNull();
    expect(trialEnd).not.toBeNull();

    // Trial end should be ~14 days after start.
    const startTs = parseInt(trialStart![1]);
    const endTs = parseInt(trialEnd![1]);
    const diffDays = (endTs - startTs) / 86400;
    expect(diffDays).toBe(14);
  });

  test('isActive() returns true for user within trial period', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $manager = \\Drupal::service('ai_site_builder_trial.trial_manager');
      echo $manager->isActive($user) ? 'active' : 'inactive';
    `);

    expect(result).toBe('active');
  });

  test('getRemainingDays() returns correct count for new user', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $manager = \\Drupal::service('ai_site_builder_trial.trial_manager');
      echo $manager->getRemainingDays($user);
    `);

    const days = parseInt(result);
    // New user should have 14 days remaining.
    expect(days).toBe(14);
  });

  test('isActive() returns false after trial_end is passed', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Manually set trial_end to the past via Drush.
    drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      $profile->set('trial_end', time() - 86400);
      $profile->save();
    `);

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $manager = \\Drupal::service('ai_site_builder_trial.trial_manager');
      echo $manager->isActive($user) ? 'active' : 'inactive';
    `);

    expect(result).toBe('inactive');
  });

});
