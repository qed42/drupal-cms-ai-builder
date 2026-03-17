import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

/**
 * TASK-001: Scaffold ai_site_builder core module.
 */
test.describe('TASK-001: Module Scaffold', () => {

  test('Drupal site is accessible', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('Module is enabled on admin modules page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/modules');
    // The module checkbox should be checked.
    const checkbox = page.locator('#edit-modules-ai-site-builder-enable');
    await expect(checkbox).toBeChecked();
  });

  test('Module permissions are registered', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/people/permissions');
    await expect(page.getByText('Access the onboarding wizard').first()).toBeVisible();
    await expect(page.getByText('Generate a site').first()).toBeVisible();
    await expect(page.getByText('Administer all site profiles').first()).toBeVisible();
  });

  test('Admin status report loads without errors', async ({ page }) => {
    await loginAsAdmin(page);
    const response = await page.goto('/admin/reports/status');
    expect(response?.status()).toBe(200);
  });

});
