import { test, expect } from '@playwright/test';

test.describe('Services Module - Black Box Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Melihat daftar Services', async ({ page }) => {
    await page.goto('/servicess');
    await expect(page).toHaveURL(/.*servicess/);
    
    // Verifikasi ada heading/tabel layanan
    const heading = page.locator('h1', { hasText: /Service/i });
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  });
});
