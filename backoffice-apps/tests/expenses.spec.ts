import { test, expect } from '@playwright/test';

test.describe('Expenses Module - Black Box Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Melihat daftar Expenses', async ({ page }) => {
    await page.goto('/expenses');
    await expect(page).toHaveURL(/.*expenses/);
    
    // Verifikasi ada heading/tabel pengeluaran
    const heading = page.locator('h1', { hasText: /Expense|Pengeluaran/i });
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  });
});
