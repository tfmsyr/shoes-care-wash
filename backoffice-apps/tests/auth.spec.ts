import { test, expect } from '@playwright/test';

test.describe('Authentication - Black Box Testing', () => {
  
  test('Login berhasil dengan kredensial valid', async ({ page }) => {
    await page.goto('/login');
    
    // Asumsi form login memiliki input email dan password
    await page.fill('input[type="tel"]', '081234567890');
    await page.fill('input[type="password"]', 'password123');
    
    // Asumsi tombol submit
    await page.click('button[type="submit"]');
    
    // Verifikasi diarahkan ke dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Login gagal dengan kredensial tidak valid', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="tel"]', '0000000000');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verifikasi pesan error muncul
    // Menyesuaikan dengan pesan error yang sebenarnya nanti
    const errorMessage = page.locator('text=invalid'); // Contoh sederhana
    await expect(errorMessage).toBeVisible();
  });
  
  test('Akses dashboard ditolak jika belum login', async ({ page }) => {
    // Menuju dashboard langsung tanpa auth
    await page.goto('/dashboard');
    
    // Seharusnya diarahkan kembali ke halaman login
    await expect(page).toHaveURL(/.*login/);
  });

});
