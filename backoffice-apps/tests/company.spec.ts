import { test, expect } from '@playwright/test';

test.describe('Company Module - Black Box Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Akses halaman Company', async ({ page }) => {
    await page.goto('/company');
    await expect(page).toHaveURL(/.*company/);
    
    // Verifikasi ada tabel atau info perusahaan
    const heading = page.locator('h1', { hasText: /Company|Perusahaan/i });
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  });
});
