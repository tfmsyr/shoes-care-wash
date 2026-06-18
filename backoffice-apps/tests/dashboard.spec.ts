import { test, expect } from '@playwright/test';

test.describe('Dashboard - Black Box Testing', () => {

  // Gunakan beforeEach untuk login sebelum tiap tes dashboard jika perlu,
  // atau bisa juga asumsikan session sudah ada
  test.beforeEach(async ({ page }) => {
    // Simulasi login untuk mendapatkan akses dashboard
    // Bisa disesuaikan dengan alur sebenarnya
    await page.goto('/login');
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Melihat daftar pelanggan (Customers)', async ({ page }) => {
    // Navigasi ke menu Customers
    await page.click('text=Customers'); // Asumsi ada link/teks Customers
    
    // Verifikasi URL berubah
    await expect(page).toHaveURL(/.*customers/);
    
    // Verifikasi ada elemen tabel atau daftar pelanggan
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Melihat halaman laporan (Report)', async ({ page }) => {
    await page.click('text=Report'); 
    
    await expect(page).toHaveURL(/.*report/);
    
    // Pastikan chart atau komponen report utama muncul
    await expect(page.locator('text=Laporan')).toBeVisible();
  });
});
