# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard - Black Box Testing >> Melihat daftar pelanggan (Customers)
- Location: tests\dashboard.spec.ts:17:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:3000/login"

```

```yaml
- img "Shoes Care Illustration"
- heading "Login" [level=1]
- paragraph: Selamat datang kembali! Silakan masukkan data Anda.
- text: No. HP *
- textbox "Masukkan no. HP Anda": "081234567890"
- text: Password *
- textbox "Masukkan kata sandi Anda": password123
- button:
  - img
- checkbox "Ingat saya"
- text: Ingat saya
- link "Lupa Kata Sandi?":
  - /url: /forgot-password
- button "Sedang masuk..." [disabled]
- text: Belum punya akun?
- link "Daftar sekarang":
  - /url: /register
- paragraph: © 2025 Shoes Care - Semua Hak Dilindungi
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard - Black Box Testing', () => {
  4  | 
  5  |   // Gunakan beforeEach untuk login sebelum tiap tes dashboard jika perlu,
  6  |   // atau bisa juga asumsikan session sudah ada
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // Simulasi login untuk mendapatkan akses dashboard
  9  |     // Bisa disesuaikan dengan alur sebenarnya
  10 |     await page.goto('/login');
  11 |     await page.fill('input[type="tel"]', '081234567890');
  12 |     await page.fill('input[type="password"]', 'password123');
  13 |     await page.click('button[type="submit"]');
> 14 |     await expect(page).toHaveURL(/.*dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  15 |   });
  16 | 
  17 |   test('Melihat daftar pelanggan (Customers)', async ({ page }) => {
  18 |     // Navigasi ke menu Customers
  19 |     await page.click('text=Customers'); // Asumsi ada link/teks Customers
  20 |     
  21 |     // Verifikasi URL berubah
  22 |     await expect(page).toHaveURL(/.*customers/);
  23 |     
  24 |     // Verifikasi ada elemen tabel atau daftar pelanggan
  25 |     const table = page.locator('table');
  26 |     await expect(table).toBeVisible();
  27 |   });
  28 | 
  29 |   test('Melihat halaman laporan (Report)', async ({ page }) => {
  30 |     await page.click('text=Report'); 
  31 |     
  32 |     await expect(page).toHaveURL(/.*report/);
  33 |     
  34 |     // Pastikan chart atau komponen report utama muncul
  35 |     await expect(page.locator('text=Laporan')).toBeVisible();
  36 |   });
  37 | });
  38 | 
```