import { test, expect, Page } from '@playwright/test';
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
 * Helper: register and wait for wizard to load.
 */
async function registerAndWaitForWizard(page: Page, email?: string): Promise<string> {
  const userEmail = email ?? uniqueEmail();
  await registerUser(page, userEmail);
  await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });
  return userEmail;
}

/**
 * After AJAX rebuilds, Drupal appends incrementing suffixes to element IDs
 * (e.g., --2, --3). Use name attribute selectors for reliability.
 */

/**
 * Helper: complete Step 1 and advance to Step 2.
 */
async function completeStep1(page: Page, email: string, siteName = 'Test Business'): Promise<void> {
  await page.locator('input[name="site_name"]').fill(siteName);
  await page.locator('input[name="tagline"]').fill('A great tagline');
  await page.locator('input[name="admin_email"]').fill(email);
  await page.click('.wizard-btn-next');
  await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });
}

/**
 * Helper: complete Step 2 (select specified industry) and advance to Step 3.
 */
async function completeStep2(page: Page, industry = 'Healthcare'): Promise<void> {
  await page.getByLabel(industry).check();
  await page.click('.wizard-btn-next');
  await expect(page.locator('.wizard-progress-text')).toContainText('Step 3 of 5', { timeout: 15000 });
}

/**
 * Helper: complete Step 3 (defaults) and advance to Step 4.
 */
async function completeStep3(page: Page): Promise<void> {
  await page.click('.wizard-btn-next');
  await expect(page.locator('.wizard-progress-text')).toContainText('Step 4 of 5', { timeout: 15000 });
}


/**
 * TASK-007: Wizard Step 1 — Site Basics.
 */
test.describe('TASK-007: Wizard Step 1 — Site Basics', () => {

  test('All Step 1 fields render correctly', async ({ page }) => {
    await registerAndWaitForWizard(page);

    // site_name field (Step 1 is the first render, IDs are clean).
    await expect(page.locator('#edit-site-name')).toBeVisible();
    await expect(page.locator('label[for="edit-site-name"]')).toContainText('Site Name');

    // tagline field.
    await expect(page.locator('#edit-tagline')).toBeVisible();

    // logo upload field.
    await expect(page.locator('#edit-logo-upload')).toBeAttached();

    // admin_email field.
    await expect(page.locator('#edit-admin-email')).toBeVisible();
  });

  test('Admin email pre-fills from registration email', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);

    await expect(page.locator('#edit-admin-email')).toHaveValue(email);
  });

  test('Validation: site name too short shows error', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);

    await page.fill('#edit-site-name', 'A');
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');

    // Should stay on Step 1 with error.
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5', { timeout: 10000 });
    await expect(page.locator('body')).toContainText('at least 2 characters', { timeout: 10000 });
  });

  test('Validation: empty site name prevents navigation', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);

    await page.fill('#edit-site-name', '');
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');

    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5', { timeout: 10000 });
  });

  test('Step 1 data saves to SiteProfile on Next', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    const siteName = `Save Test ${Date.now()}`;

    await page.fill('#edit-site-name', siteName);
    await page.fill('#edit-tagline', 'My tagline');
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      echo 'site_name=' . $profile->get('site_name')->value . PHP_EOL;
      echo 'tagline=' . $profile->get('tagline')->value . PHP_EOL;
      echo 'admin_email=' . $profile->get('admin_email')->value . PHP_EOL;
      echo 'onboarding_step=' . $profile->get('onboarding_step')->value . PHP_EOL;
    `);

    expect(result).toContain(`site_name=${siteName}`);
    expect(result).toContain('tagline=My tagline');
    expect(result).toContain(`admin_email=${email}`);
    expect(result).toContain('onboarding_step=2');
  });
});


/**
 * TASK-008: Wizard Step 2 — Industry Selection.
 */
test.describe('TASK-008: Wizard Step 2 — Industry Selection', () => {

  test('All 6 industries display as selectable options', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);

    const radios = page.locator('input[name="industry"]');
    await expect(radios).toHaveCount(6);

    const industries = ['Healthcare', 'Legal', 'Real Estate', 'Restaurant', 'Professional Services', 'Other'];
    for (const industry of industries) {
      await expect(page.getByText(industry, { exact: true }).first()).toBeVisible();
    }
  });

  test('Single selection: clicking one deselects the previous', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);

    await page.getByLabel('Healthcare').check();
    await expect(page.getByLabel('Healthcare')).toBeChecked();

    await page.getByLabel('Legal').check();
    await expect(page.getByLabel('Legal')).toBeChecked();
    await expect(page.getByLabel('Healthcare')).not.toBeChecked();
  });

  test('"Other" reveals free-text textarea', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);

    await page.getByLabel('Other').check();

    // Use name selector — ID may have AJAX suffix.
    await expect(page.locator('textarea[name="industry_other"]')).toBeVisible({ timeout: 5000 });
  });

  test('Validation: cannot proceed without selecting industry', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);

    await page.click('.wizard-btn-next');

    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 10000 });
  });

  test('Selected industry saved to SiteProfile', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);

    await page.getByLabel('Restaurant').check();
    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 3 of 5', { timeout: 15000 });

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      $industry = $profile->get('industry')->entity;
      echo 'industry=' . ($industry ? $industry->label() : 'none') . PHP_EOL;
      echo 'onboarding_step=' . $profile->get('onboarding_step')->value . PHP_EOL;
    `);

    expect(result).toContain('industry=Restaurant');
    expect(result).toContain('onboarding_step=3');
  });
});


/**
 * TASK-009: Wizard Step 3 — Brand Input.
 */
test.describe('TASK-009: Wizard Step 3 — Brand Input', () => {

  test('Color pickers render with industry-aware defaults', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page, 'Healthcare');

    // Use name selectors for elements rendered after AJAX rebuilds.
    const colorPrimary = page.locator('input[name="color_primary"]');
    const colorSecondary = page.locator('input[name="color_secondary"]');
    const colorAccent = page.locator('input[name="color_accent"]');

    await expect(colorPrimary).toBeVisible();
    await expect(colorSecondary).toBeVisible();
    await expect(colorAccent).toBeVisible();

    // Healthcare defaults: #0077B6, #00B4D8, #48CAE4 (lowercased by browser).
    await expect(colorPrimary).toHaveValue('#0077b6');
    await expect(colorSecondary).toHaveValue('#00b4d8');
    await expect(colorAccent).toHaveValue('#48cae4');
  });

  test('Font selector shows 8 font pairings', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);

    const fontRadios = page.locator('input[name="font_pairing"]');
    await expect(fontRadios).toHaveCount(8);

    await expect(page.getByLabel('Montserrat / Open Sans')).toBeChecked();
  });

  test('Reference URL validation rejects invalid URLs', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);

    // Use name selector for URL field after AJAX rebuilds.
    await page.locator('input[name="reference_url_0"]').fill('not-a-valid-url');
    await page.click('.wizard-btn-next');

    // Should stay on Step 3 with an error.
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 3 of 5', { timeout: 10000 });
  });

  test('Skipping all fields proceeds with defaults', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);

    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 4 of 5', { timeout: 15000 });
  });

  test('Brand data saved to SiteProfile', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page, 'Real Estate');

    // Change primary color via JS.
    await page.evaluate(() => {
      const primary = document.querySelector('input[name="color_primary"]') as HTMLInputElement;
      if (primary) {
        primary.value = '#ff0000';
        primary.dispatchEvent(new Event('input', { bubbles: true }));
        primary.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Select a different font pairing.
    await page.getByLabel('Poppins / Nunito').check();

    // Add a reference URL.
    await page.locator('input[name="reference_url_0"]').fill('https://example.com');

    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 4 of 5', { timeout: 15000 });

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      echo 'color_primary=' . $profile->get('color_primary')->value . PHP_EOL;
      echo 'font_heading=' . $profile->get('font_heading')->value . PHP_EOL;
      echo 'font_body=' . $profile->get('font_body')->value . PHP_EOL;
      $urls = [];
      foreach ($profile->get('reference_urls') as $item) { $urls[] = $item->value; }
      echo 'reference_urls=' . implode(',', $urls) . PHP_EOL;
      echo 'onboarding_step=' . $profile->get('onboarding_step')->value . PHP_EOL;
    `);

    expect(result).toContain('color_primary=#ff0000');
    expect(result).toContain('font_heading=Poppins');
    expect(result).toContain('font_body=Nunito');
    expect(result).toContain('reference_urls=https://example.com');
    expect(result).toContain('onboarding_step=4');
  });
});


/**
 * TASK-010: Wizard Step 4 — Business Context.
 */
test.describe('TASK-010: Wizard Step 4 — Business Context', () => {

  test('Step 4 fields render with placeholders', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);
    await completeStep3(page);

    // Use name selectors for elements after multiple AJAX rebuilds.
    await expect(page.locator('textarea[name="services"]')).toBeVisible();
    await expect(page.locator('textarea[name="target_audience"]')).toBeVisible();
    await expect(page.locator('input[name="competitor_0"]')).toBeVisible();

    // CTA fields with placeholders.
    const cta0 = page.locator('input[name="cta_0"]');
    await expect(cta0).toBeVisible();
    await expect(cta0).toHaveAttribute('placeholder', 'Book Now');

    const cta1 = page.locator('input[name="cta_1"]');
    await expect(cta1).toHaveAttribute('placeholder', 'Get a Quote');
  });

  test('Validation: services field is required', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);
    await completeStep3(page);

    // Leave services empty and try to proceed.
    await page.locator('textarea[name="services"]').fill('');
    await page.click('.wizard-btn-next');

    // Should stay on Step 4.
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 4 of 5', { timeout: 10000 });
  });

  test('Step 4 data saved to SiteProfile', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);
    await completeStep1(page, email);
    await completeStep2(page);
    await completeStep3(page);

    // Fill Step 4 fields using name selectors.
    await page.locator('textarea[name="services"]').fill('Web Design\nSEO Optimization');
    await page.locator('textarea[name="target_audience"]').fill('Small business owners');
    await page.locator('input[name="competitor_0"]').fill('CompetitorA');
    await page.locator('input[name="competitor_1"]').fill('CompetitorB');
    await page.locator('input[name="cta_0"]').fill('Contact Us');
    await page.locator('input[name="cta_1"]').fill('Get a Quote');

    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 5 of 5', { timeout: 15000 });

    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      echo 'services=' . $profile->get('services')->value . PHP_EOL;
      echo 'target_audience=' . $profile->get('target_audience')->value . PHP_EOL;
      $comps = [];
      foreach ($profile->get('competitors') as $item) { $comps[] = $item->value; }
      echo 'competitors=' . implode(',', $comps) . PHP_EOL;
      $ctas = [];
      foreach ($profile->get('ctas') as $item) { $ctas[] = $item->value; }
      echo 'ctas=' . implode(',', $ctas) . PHP_EOL;
      echo 'onboarding_step=' . $profile->get('onboarding_step')->value . PHP_EOL;
    `);

    expect(result).toContain('services=Web Design');
    expect(result).toContain('SEO Optimization');
    expect(result).toContain('target_audience=Small business owners');
    expect(result).toContain('competitors=CompetitorA,CompetitorB');
    expect(result).toContain('ctas=Contact Us,Get a Quote');
    expect(result).toContain('onboarding_step=5');
  });
});


/**
 * Sprint Definition of Done: Full Steps 1–4 end-to-end walkthrough.
 */
test.describe('Sprint 02: Full Wizard Walkthrough', () => {

  test('Complete Steps 1–4 end-to-end', async ({ page }) => {
    const email = await registerAndWaitForWizard(page);

    // --- Step 1: Site Basics ---
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5');
    await page.locator('input[name="site_name"]').fill('E2E Walkthrough Site');
    await page.locator('input[name="tagline"]').fill('Built by automation');
    await page.locator('input[name="admin_email"]').fill(email);
    await page.click('.wizard-btn-next');

    // --- Step 2: Industry ---
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });
    await page.getByLabel('Professional Services').check();
    await page.click('.wizard-btn-next');

    // --- Step 3: Brand ---
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 3 of 5', { timeout: 15000 });
    await page.click('.wizard-btn-next');

    // --- Step 4: Business Context ---
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 4 of 5', { timeout: 15000 });
    await page.locator('textarea[name="services"]').fill('Consulting\nAdvisory\nTraining');
    await page.locator('textarea[name="target_audience"]').fill('Enterprise clients');
    await page.locator('input[name="cta_0"]').fill('Schedule a Call');
    await page.click('.wizard-btn-next');

    // --- Step 5: Placeholder ---
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 5 of 5', { timeout: 15000 });
    await expect(page.locator('body')).toContainText('AI-generated industry questions', { timeout: 10000 });

    // Verify all data persisted via Drush.
    const result = drushEval(`
      $users = \\Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['mail' => '${email}']);
      $user = reset($users);
      $profiles = \\Drupal::entityTypeManager()->getStorage('site_profile')->loadByProperties(['user_id' => $user->id()]);
      $profile = reset($profiles);
      echo 'site_name=' . $profile->get('site_name')->value . PHP_EOL;
      echo 'tagline=' . $profile->get('tagline')->value . PHP_EOL;
      $industry = $profile->get('industry')->entity;
      echo 'industry=' . ($industry ? $industry->label() : 'none') . PHP_EOL;
      echo 'services=' . $profile->get('services')->value . PHP_EOL;
      echo 'onboarding_step=' . $profile->get('onboarding_step')->value . PHP_EOL;
    `);

    expect(result).toContain('site_name=E2E Walkthrough Site');
    expect(result).toContain('tagline=Built by automation');
    expect(result).toContain('industry=Professional Services');
    expect(result).toContain('services=Consulting');
    expect(result).toContain('onboarding_step=5');
  });

});
