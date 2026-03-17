import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

/**
 * TASK-003: Industry taxonomy vocabulary.
 */
test.describe('TASK-003: Industry Taxonomy', () => {

  test('Industry vocabulary exists in admin', async ({ page }) => {
    await loginAsAdmin(page);
    const response = await page.goto('/admin/structure/taxonomy/manage/industry/overview');
    expect(response?.status()).toBe(200);
  });

  test('All 6 industry terms are present', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/structure/taxonomy/manage/industry/overview');

    const expectedTerms = [
      'Healthcare',
      'Legal',
      'Real Estate',
      'Restaurant',
      'Professional Services',
      'Other',
    ];

    for (const term of expectedTerms) {
      await expect(page.getByText(term, { exact: true }).first()).toBeVisible();
    }
  });

  test('Terms are in the correct order', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/structure/taxonomy/manage/industry/overview');

    // Get term names from the overview table rows.
    // Taxonomy overview uses draggable table with term names as links.
    const termLinks = page.locator('#taxonomy .tabledrag-handle + a, table td:first-child a');
    const count = await termLinks.count();

    // Collect visible term names from table.
    const termNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await termLinks.nth(i).textContent();
      if (text) {
        const trimmed = text.trim();
        if (['Healthcare', 'Legal', 'Real Estate', 'Restaurant', 'Professional Services', 'Other'].includes(trimmed)) {
          termNames.push(trimmed);
        }
      }
    }

    const expectedOrder = [
      'Healthcare',
      'Legal',
      'Real Estate',
      'Restaurant',
      'Professional Services',
      'Other',
    ];

    expect(termNames).toEqual(expectedOrder);
  });

});
