import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

/**
 * TASK-002: SiteProfile custom entity.
 */
test.describe('TASK-002: SiteProfile Entity', () => {

  test('Admin can access site profiles listing page', async ({ page }) => {
    await loginAsAdmin(page);
    const response = await page.goto('/admin/content/site-profiles');
    expect(response?.status()).toBe(200);
    await expect(page.locator('th:has-text("Site Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Owner")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('Admin can access the add site profile form', async ({ page }) => {
    await loginAsAdmin(page);
    const response = await page.goto('/admin/content/site-profiles/add');
    expect(response?.status()).toBe(200);
    await expect(page.locator('#edit-site-name-0-value')).toBeVisible();
  });

  test('Admin can create a SiteProfile via the form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/content/site-profiles/add');

    await page.fill('#edit-site-name-0-value', 'QA Test Create');
    await page.selectOption('#edit-status', 'onboarding');
    await page.click('#edit-submit');

    // Should show success message.
    await expect(page.locator('.messages--status')).toBeVisible();
    await expect(page.getByText('has been created').first()).toBeVisible();
  });

  test('Admin can edit an existing SiteProfile', async ({ page }) => {
    await loginAsAdmin(page);
    // Navigate directly to add + create so we have a known profile.
    await page.goto('/admin/content/site-profiles/add');
    await page.fill('#edit-site-name-0-value', 'QA Test Edit');
    await page.selectOption('#edit-status', 'onboarding');
    await page.click('#edit-submit');
    await expect(page.locator('.messages--status')).toBeVisible();

    // Now find and click the Edit button in the operations dropdown.
    await page.goto('/admin/content/site-profiles');
    // The operations column has a primary "Edit" button visible.
    const editButton = page.locator('#block-claro-content .dropbutton-widget a:has-text("Edit")').first();
    await editButton.click();

    await page.fill('#edit-site-name-0-value', 'QA Test Edit Updated');
    await page.click('#edit-submit');
    await expect(page.locator('.messages--status')).toBeVisible();
    await expect(page.getByText('has been updated').first()).toBeVisible();
  });

  test('Admin can delete a SiteProfile', async ({ page }) => {
    await loginAsAdmin(page);
    // Create a profile to delete.
    await page.goto('/admin/content/site-profiles/add');
    await page.fill('#edit-site-name-0-value', 'QA Test Delete');
    await page.selectOption('#edit-status', 'onboarding');
    await page.click('#edit-submit');
    await expect(page.locator('.messages--status')).toBeVisible();

    // Go to listing and find the delete link.
    await page.goto('/admin/content/site-profiles');
    // Open the operations dropdown to reveal Delete link.
    const dropdownToggle = page.locator('#block-claro-content .dropbutton-toggle button').first();
    await dropdownToggle.click();
    // Click the delete link from the expanded dropdown.
    const deleteLink = page.locator('#block-claro-content .dropbutton-widget a:has-text("Delete")').first();
    await deleteLink.click();

    // The delete confirmation opens as a modal dialog.
    // Wait for the modal and click the "Delete" button inside it.
    const modal = page.locator('.ui-dialog');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: 'Delete' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.messages--status')).toBeVisible();
  });

  test('Anonymous user cannot access site profiles listing', async ({ page }) => {
    const response = await page.goto('/admin/content/site-profiles');
    const url = page.url();
    const isBlocked = response?.status() === 403 || url.includes('/user/login');
    expect(isBlocked).toBeTruthy();
  });

});
