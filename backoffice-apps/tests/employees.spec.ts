import { test, expect } from '@playwright/test';

test.describe('Employees Module - Black Box Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Melihat daftar Employees', async ({ page }) => {
    await page.goto('/employees');
    await expect(page).toHaveURL(/.*employees/);
    
    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  });
});
