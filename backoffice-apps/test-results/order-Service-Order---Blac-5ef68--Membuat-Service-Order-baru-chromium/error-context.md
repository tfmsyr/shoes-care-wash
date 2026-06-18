# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order.spec.ts >> Service Order - Black Box Testing >> Membuat Service Order baru
- Location: tests\order.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Service Order')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - img "Shoes Care Illustration" [ref=e5]
    - generic [ref=e9]:
      - heading "Login" [level=1] [ref=e10]
      - paragraph [ref=e11]: Selamat datang kembali! Silakan masukkan data Anda.
      - generic [ref=e12]:
        - img [ref=e13]
        - text: Akun tidak ditemukan atau kata sandi salah.
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: No. HP *
          - textbox "Masukkan no. HP Anda" [ref=e18]: "081234567890"
        - generic [ref=e19]:
          - generic [ref=e20]: Password *
          - generic [ref=e21]:
            - textbox "Masukkan kata sandi Anda" [ref=e22]: password123
            - button [ref=e23]:
              - img [ref=e24]
        - generic [ref=e26]:
          - generic [ref=e27] [cursor=pointer]:
            - checkbox "Ingat saya" [ref=e28]
            - text: Ingat saya
          - link "Lupa Kata Sandi?" [ref=e29] [cursor=pointer]:
            - /url: /forgot-password
        - button "Login" [ref=e30]
        - generic [ref=e31]:
          - text: Belum punya akun?
          - link "Daftar sekarang" [ref=e32] [cursor=pointer]:
            - /url: /register
        - paragraph [ref=e33]: © 2025 Shoes Care - Semua Hak Dilindungi
  - generic [ref=e38] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e39]:
      - img [ref=e40]
    - generic [ref=e43]:
      - button "Open issues overlay" [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]: "0"
          - generic [ref=e47]: "1"
        - generic [ref=e48]: Issue
      - button "Collapse issues badge" [ref=e49]:
        - img [ref=e50]
  - alert [ref=e52]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Service Order - Black Box Testing', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Simulasi login
  7  |     await page.goto('/login');
  8  |     await page.fill('input[type="tel"]', '081234567890');
  9  |     await page.fill('input[type="password"]', 'password123');
  10 |     await page.click('button[type="submit"]');
  11 |   });
  12 | 
  13 |   test('Membuat Service Order baru', async ({ page }) => {
  14 |     // Navigasi ke service order
> 15 |     await page.click('text=Service Order');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  16 |     await expect(page).toHaveURL(/.*service-order/);
  17 |     
  18 |     // Klik tombol tambah order
  19 |     const addOrderBtn = page.locator('button', { hasText: /Tambah|New|Create/i });
  20 |     if (await addOrderBtn.isVisible()) {
  21 |       await addOrderBtn.click();
  22 |     }
  23 |     
  24 |     // Validasi form order muncul
  25 |     await expect(page.locator('form')).toBeVisible();
  26 |     
  27 |     // Tes isi data dasar
  28 |     await page.fill('input[name="customerName"]', 'Pelanggan Test');
  29 |     
  30 |     // Tidak di-submit untuk mencegah spam data di db asli,
  31 |     // Ini hanya tes memastikan UI fungsional
  32 |   });
  33 | 
  34 | });
  35 | 
```