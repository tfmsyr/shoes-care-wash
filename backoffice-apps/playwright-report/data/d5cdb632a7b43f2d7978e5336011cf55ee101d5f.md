# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication - Black Box Testing >> Login berhasil dengan kredensial valid
- Location: tests\auth.spec.ts:5:7

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
  3  | test.describe('Authentication - Black Box Testing', () => {
  4  |   
  5  |   test('Login berhasil dengan kredensial valid', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     
  8  |     // Asumsi form login memiliki input email dan password
  9  |     await page.fill('input[type="tel"]', '081234567890');
  10 |     await page.fill('input[type="password"]', 'password123');
  11 |     
  12 |     // Asumsi tombol submit
  13 |     await page.click('button[type="submit"]');
  14 |     
  15 |     // Verifikasi diarahkan ke dashboard
> 16 |     await expect(page).toHaveURL(/.*dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  17 |   });
  18 | 
  19 |   test('Login gagal dengan kredensial tidak valid', async ({ page }) => {
  20 |     await page.goto('/login');
  21 |     
  22 |     await page.fill('input[type="tel"]', '0000000000');
  23 |     await page.fill('input[type="password"]', 'wrongpassword');
  24 |     await page.click('button[type="submit"]');
  25 |     
  26 |     // Verifikasi pesan error muncul
  27 |     // Menyesuaikan dengan pesan error yang sebenarnya nanti
  28 |     const errorMessage = page.locator('text=invalid'); // Contoh sederhana
  29 |     await expect(errorMessage).toBeVisible();
  30 |   });
  31 |   
  32 |   test('Akses dashboard ditolak jika belum login', async ({ page }) => {
  33 |     // Menuju dashboard langsung tanpa auth
  34 |     await page.goto('/dashboard');
  35 |     
  36 |     // Seharusnya diarahkan kembali ke halaman login
  37 |     await expect(page).toHaveURL(/.*login/);
  38 |   });
  39 | 
  40 | });
  41 | 
```