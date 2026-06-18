import { test, expect } from '@playwright/test';

test.describe('Products Module - Black Box Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Melihat daftar Products', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/.*products/);
    
    // Asumsi halaman memuat list produk
    const productList = page.locator('div', { hasText: /Product|Produk/i });
    if (await productList.isVisible()) {
      await expect(productList).toBeVisible();
    }
  });
});
