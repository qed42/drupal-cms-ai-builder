import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, registerUser, uniqueEmail } from './helpers';

/**
 * TASK-004: Simplified user registration form.
 */
test.describe('TASK-004: User Registration', () => {

  test('Registration page is accessible to anonymous users', async ({ page }) => {
    const response = await page.goto('/start');
    expect(response?.status()).toBe(200);
    await expect(page.locator('#edit-email')).toBeVisible();
    await expect(page.locator('#edit-pass-pass1')).toBeVisible();
    await expect(page.locator('#edit-pass-pass2')).toBeVisible();
  });

  test('Registration page shows login link for existing users', async ({ page }) => {
    await page.goto('/start');
    // The login link is rendered below the form.
    const loginLink = page.locator('a[href*="/user/login"]');
    await expect(loginLink.first()).toBeAttached();
  });

  test('User can register and is redirected to /onboarding', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Should be redirected to /onboarding.
    await expect(page).toHaveURL(/\/onboarding/);

    // Should see the onboarding wizard form (Sprint 02 replaced the placeholder).
    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });
    // Progress indicator should show Step 1.
    await expect(page.locator('body')).toContainText('Step 1 of 5', { timeout: 10000 });
  });

  test('User is automatically logged in after registration', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Navigate to user page — should show account page (not login form).
    await page.goto('/user');
    await expect(page).not.toHaveURL(/\/user\/login/);
    // The user profile page should NOT show the login form.
    await expect(page.locator('#edit-name')).not.toBeVisible();
  });

  test('Registered user has site_owner role', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);
    await logout(page);

    // Log in as admin and check the user's roles.
    await loginAsAdmin(page);
    await page.goto('/admin/people');
    const userRow = page.locator(`tr:has-text("${email}")`);
    await expect(userRow.first()).toBeVisible();
    await expect(userRow.first().getByText('Site Owner')).toBeVisible();
  });

  test('SiteProfile is created for registered user', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Verify by checking the /onboarding page loads the wizard with Step 1.
    await page.goto('/onboarding');
    await expect(page.locator('#onboarding-wizard-wrapper')).toBeVisible({ timeout: 10000 });
    // Admin email field should be pre-filled with the registration email.
    await expect(page.locator('#edit-admin-email')).toHaveValue(email, { timeout: 10000 });
  });

  test('Duplicate email shows error', async ({ page }) => {
    const email = uniqueEmail();

    // Register first time.
    await registerUser(page, email);
    await logout(page);

    // Try to register again with same email.
    await page.goto('/start');
    await expect(page.locator('#edit-email')).toBeVisible();
    await page.fill('#edit-email', email);
    await page.fill('#edit-pass-pass1', 'AnotherPassword123!');
    await page.fill('#edit-pass-pass2', 'AnotherPassword123!');
    await page.click('#edit-submit');
    await page.waitForLoadState('networkidle');

    // Should show an error message about duplicate email.
    // Space DS theme may not use .messages--error class, so check text content.
    await expect(page.getByText('already exists').first()).toBeVisible();
  });

  test('Logged-in users cannot access /start', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // User is logged in, try to access /start.
    const response = await page.goto('/start');
    expect(response?.status()).toBe(403);
  });

});
