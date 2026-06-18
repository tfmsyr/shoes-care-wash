# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: products.spec.ts >> Products Module - Black Box Testing >> Melihat daftar Products
- Location: tests\products.spec.ts:11:7

# Error details

```
Error: locator.isVisible: Error: strict mode violation: locator('div').filter({ hasText: /Product|Produk/i }) resolved to 11 elements:
    1) <div class="flex h-screen overflow-hidden bg-[#F7F8FA] text-gray-800">…</div> aka locator('div').filter({ hasText: 'shoes care washDashboardPesanan LayananPesanan' })
    2) <div class="space-y-1 mb-6">…</div> aka getByText('DashboardPesanan')
    3) <div class="mb-6 space-y-1">…</div> aka getByText('ManajemenLayananProdukKategori ProdukManajemen ProdukPelangganKaryawanPerusahaan')
    4) <div class="space-y-1">…</div> aka getByText('ProdukKategori')
    5) <div class="flex items-center">…</div> aka getByRole('button', { name: 'Produk' })
    6) <div class="pl-11 pr-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">…</div> aka getByText('Kategori ProdukManajemen')
    7) <div class="flex min-w-0 flex-1 flex-col h-full transition-all duration-300 ease-in-out pl-[var(--sidebar-width)]">…</div> aka getByText('ProdukAAdminPenggunaProduct')
    8) <div class="p-8">…</div> aka getByText('Product MenuProduct')
    9) <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">…</div> aka getByText('Product CategoriesManage product categories for easy organization.Product')
    10) <div class="flex items-center gap-3 mb-3">…</div> aka getByRole('button', { name: 'Product Categories Manage' })
    ...

Call log:
    - checking visibility of locator('div').filter({ hasText: /Product|Produk/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - button [ref=e4]:
        - img [ref=e5]
      - generic [ref=e7]:
        - img "Logo" [ref=e10]
        - generic [ref=e11]: shoes care wash
      - navigation [ref=e12]:
        - generic [ref=e13]:
          - link "Dashboard" [ref=e14] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e16]
            - generic [ref=e19]: Dashboard
          - link "Pesanan Layanan" [ref=e20] [cursor=pointer]:
            - /url: /service-order
            - img [ref=e22]
            - generic [ref=e25]: Pesanan Layanan
          - link "Pesanan Produk" [ref=e26] [cursor=pointer]:
            - /url: /products-order
            - img [ref=e28]
            - generic [ref=e31]: Pesanan Produk
        - generic [ref=e33]:
          - paragraph [ref=e34]: Manajemen
          - button "Layanan" [ref=e36]:
            - generic [ref=e37]:
              - img [ref=e39]
              - generic [ref=e42]: Layanan
            - img [ref=e43]
          - generic [ref=e45]:
            - button "Produk" [ref=e46]:
              - generic [ref=e47]:
                - img [ref=e49]
                - generic [ref=e52]: Produk
              - img [ref=e53]
            - generic [ref=e55]:
              - link "Kategori Produk" [ref=e56] [cursor=pointer]:
                - /url: /products/product-categori
              - link "Manajemen Produk" [ref=e57] [cursor=pointer]:
                - /url: /products/product-management
          - link "Pelanggan" [ref=e58] [cursor=pointer]:
            - /url: /customers
            - img [ref=e60]
            - generic [ref=e65]: Pelanggan
          - link "Karyawan" [ref=e66] [cursor=pointer]:
            - /url: /employees
            - img [ref=e68]
            - generic [ref=e72]: Karyawan
          - link "Perusahaan" [ref=e73] [cursor=pointer]:
            - /url: /company
            - img [ref=e75]
            - generic [ref=e79]: Perusahaan
        - generic [ref=e81]:
          - paragraph [ref=e82]: Laporan
          - link "Laporan" [ref=e83] [cursor=pointer]:
            - /url: /report
            - img [ref=e85]
            - generic [ref=e87]: Laporan
          - button "Pengeluaran" [ref=e89]:
            - generic [ref=e90]:
              - img [ref=e92]
              - generic [ref=e94]: Pengeluaran
            - img [ref=e95]
      - generic [ref=e98]:
        - generic [ref=e100]: U
        - generic [ref=e101]:
          - paragraph [ref=e102]: User
          - paragraph [ref=e103]: Owner
    - generic [ref=e104]:
      - banner [ref=e105]:
        - navigation [ref=e106]:
          - link [ref=e107] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e108]
          - img [ref=e111]
          - link "Produk" [ref=e113] [cursor=pointer]:
            - /url: /products
        - button "A Admin Pengguna" [ref=e115]:
          - generic [ref=e117]: A
          - generic [ref=e118]:
            - generic [ref=e119]: Admin
            - generic [ref=e120]: Pengguna
      - main [ref=e121]:
        - generic [ref=e122]:
          - heading "Product Menu" [level=1] [ref=e123]
          - generic [ref=e124]:
            - button "Product Categories Manage product categories for easy organization." [ref=e125]:
              - generic [ref=e126]:
                - img [ref=e127]
                - heading "Product Categories" [level=2] [ref=e132]
              - paragraph [ref=e133]: Manage product categories for easy organization.
            - button "Product Management Add, edit, and manage all your products." [ref=e134]:
              - generic [ref=e135]:
                - img [ref=e136]
                - heading "Product Management" [level=2] [ref=e146]
              - paragraph [ref=e147]: Add, edit, and manage all your products.
  - button "Open Next.js Dev Tools" [ref=e153] [cursor=pointer]:
    - img [ref=e154]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Products Module - Black Box Testing', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[type="tel"]', '081234567890');
  7  |     await page.fill('input[type="password"]', 'password123');
  8  |     await page.click('button[type="submit"]');
  9  |   });
  10 | 
  11 |   test('Melihat daftar Products', async ({ page }) => {
  12 |     await page.goto('/products');
  13 |     await expect(page).toHaveURL(/.*products/);
  14 |     
  15 |     // Asumsi halaman memuat list produk
  16 |     const productList = page.locator('div', { hasText: /Product|Produk/i });
> 17 |     if (await productList.isVisible()) {
     |                           ^ Error: locator.isVisible: Error: strict mode violation: locator('div').filter({ hasText: /Product|Produk/i }) resolved to 11 elements:
  18 |       await expect(productList).toBeVisible();
  19 |     }
  20 |   });
  21 | });
  22 | 
```