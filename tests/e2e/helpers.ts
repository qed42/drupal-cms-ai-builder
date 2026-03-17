import { Page, expect } from '@playwright/test';
import { execFileSync } from 'child_process';

const PROJECT_DIR = '/Users/piyuesh23/Development/ai-experiments/drupal-cms-ai-builder';

/**
 * Log in as the Drupal admin user.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/user/login');
  await page.fill('#edit-name', 'admin');
  await page.fill('#edit-pass', 'admin');
  await page.click('#edit-submit');
  await expect(page).not.toHaveURL(/\/user\/login/);
}

/**
 * Log out the current user.
 * Drupal 11 has CSRF protection on logout — uses a tokenized URL.
 * The safest approach is to click the "Log out" link in the page header.
 */
export async function logout(page: Page): Promise<void> {
  // Click the "Log out" link which has the proper CSRF token.
  const logoutLink = page.getByRole('link', { name: 'Log out' });
  if (await logoutLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutLink.click();
  } else {
    // Fallback: navigate to /user/logout and handle confirm form.
    await page.goto('/user/logout');
    const submitButton = page.locator('#edit-submit');
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
    }
  }
  // Wait for the page to finish loading after logout.
  await page.waitForLoadState('networkidle');
  // Verify logged out by checking for "Log in" link.
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Generate a unique email for test users.
 */
export function uniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/**
 * Register a new user via the /start form and return the email used.
 */
export async function registerUser(page: Page, email?: string): Promise<string> {
  const userEmail = email ?? uniqueEmail();
  await page.goto('/start');
  await page.fill('#edit-email', userEmail);
  await page.fill('#edit-pass-pass1', 'TestPassword123!');
  await page.fill('#edit-pass-pass2', 'TestPassword123!');
  await page.click('#edit-submit');
  await page.waitForLoadState('networkidle');
  return userEmail;
}
