import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, registerUser, uniqueEmail } from './helpers';

/**
 * TASK-006: Onboarding Wizard Framework.
 *
 * Verifies the multi-step wizard shell: rendering, navigation, progress
 * indicator, access control, and step persistence.
 */
test.describe('TASK-006: Onboarding Wizard Framework', () => {

  test('Wizard renders at /onboarding with progress indicator', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Should be on /onboarding.
    await expect(page).toHaveURL(/\/onboarding/);

    // Wizard wrapper should be visible.
    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // Progress indicator should show "Step 1 of 5".
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5');

    // All 5 step labels should be present.
    await expect(page.locator('.wizard-step__label')).toHaveCount(5);
  });

  test('Step 1 shows Next button but no Back button', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // "Next" button should be visible.
    await expect(page.locator('.wizard-btn-next')).toBeVisible();
    // "Back" button should NOT be visible on Step 1.
    await expect(page.locator('.wizard-btn-back')).not.toBeVisible();
  });

  test('Non-authenticated users cannot access /onboarding', async ({ page }) => {
    const response = await page.goto('/onboarding');
    // Should get 403 (permission denied) for anonymous users.
    expect(response?.status()).toBe(403);
  });

  test('Step navigation: Next advances to Step 2 via AJAX', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // Fill required Step 1 fields.
    await page.fill('#edit-site-name', 'Test Business Site');
    await page.fill('#edit-admin-email', email);

    // Click "Next" button.
    await page.click('.wizard-btn-next');

    // Wait for AJAX to complete — Step 2 content should appear.
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });

    // Back button should now be visible.
    await expect(page.locator('.wizard-btn-back')).toBeVisible();

    // URL should stay the same (AJAX, no page reload).
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('Back button returns to previous step', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // Complete Step 1.
    await page.fill('#edit-site-name', 'Back Test Site');
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });

    // Click Back.
    await page.click('.wizard-btn-back');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5', { timeout: 15000 });

    // Step 1 fields should be visible again (use name selector — IDs may change after AJAX rebuild).
    await expect(page.locator('input[name="site_name"]')).toBeVisible();
  });

  test('Returning user resumes at their current step', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // Complete Step 1.
    await page.fill('#edit-site-name', 'Resume Test Site');
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });

    // Navigate away and come back.
    await page.goto('/user');
    await page.waitForLoadState('networkidle');
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Should resume at Step 2, not Step 1.
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 10000 });
  });

  test('Data persists between steps — site_name saved on Next', async ({ page }) => {
    const email = uniqueEmail();
    const siteName = 'Persistent Test Site';
    await registerUser(page, email);

    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });

    // Fill Step 1 and advance.
    await page.fill('#edit-site-name', siteName);
    await page.fill('#edit-admin-email', email);
    await page.click('.wizard-btn-next');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 2 of 5', { timeout: 15000 });

    // Go back to Step 1.
    await page.click('.wizard-btn-back');
    await expect(page.locator('.wizard-progress-text')).toContainText('Step 1 of 5', { timeout: 15000 });

    // Site name should still be populated (use name selector — IDs may change after AJAX rebuild).
    await expect(page.locator('input[name="site_name"]')).toHaveValue(siteName);
  });

});
