import { test, expect } from '@playwright/test';

test.describe('Service Order - Black Box Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Simulasi login
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Membuat Service Order baru', async ({ page }) => {
    // Navigasi ke service order
    await page.click('text=Service Order');
    await expect(page).toHaveURL(/.*service-order/);
    
    // Klik tombol tambah order
    const addOrderBtn = page.locator('button', { hasText: /Tambah|New|Create/i });
    if (await addOrderBtn.isVisible()) {
      await addOrderBtn.click();
    }
    
    // Validasi form order muncul
    await expect(page.locator('form')).toBeVisible();
    
    // Tes isi data dasar
    await page.fill('input[name="customerName"]', 'Pelanggan Test');
    
    // Tidak di-submit untuk mencegah spam data di db asli,
    // Ini hanya tes memastikan UI fungsional
  });

});
