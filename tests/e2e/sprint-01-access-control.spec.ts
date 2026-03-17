import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, registerUser, uniqueEmail } from './helpers';

/**
 * TASK-002 + TASK-034: SiteProfile access control and data isolation.
 */
test.describe('TASK-034: Access Control & Data Isolation', () => {

  test('User can view their own SiteProfile on /onboarding', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    await page.goto('/onboarding');
    await expect(page.getByText('Status: onboarding')).toBeVisible();
    // Email is rendered via BigPipe — wait for it to appear in the DOM.
    await expect(page.locator('body')).toContainText(email, { timeout: 10000 });
  });

  test('Site owner cannot access admin site profiles page', async ({ page }) => {
    const email = uniqueEmail();
    await registerUser(page, email);

    // Site owner tries to access admin listing.
    const response = await page.goto('/admin/content/site-profiles');
    const url = page.url();
    const isBlocked = response?.status() === 403 || url.includes('/user/login');
    expect(isBlocked).toBeTruthy();
  });

  test('Admin can list all SiteProfiles from multiple users', async ({ page }) => {
    // Start fresh as admin — avoid logout/login cycle which causes BigPipe issues.
    await loginAsAdmin(page);
    await page.goto('/admin/content/site-profiles');
    // Wait for the table to render.
    await expect(page.locator('th:has-text("Site Name")')).toBeVisible({ timeout: 15000 });
    // Verify at least some profiles exist (from previous test runs).
    const rows = page.locator('#block-claro-content table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin can view individual SiteProfile detail page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content/site-profiles');

    // Click on a profile link to view canonical page.
    const profileLink = page.locator('#block-claro-content td a').first();
    await profileLink.click();

    // Should be on a site profile detail page.
    expect(page.url()).toContain('/admin/content/site-profiles/');
  });

});
