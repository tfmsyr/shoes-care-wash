# Dokumentasi Arsitektur Class Diagram - Shoes Care Wash

Dokumen ini menjelaskan struktur Class Diagram (OOP) yang dirancang untuk sistem "Shoes Care & Wash", termasuk fungsionalitas, atribut utama, dan relasi logis antar kelas.

## 1. Class Definitions

### `User` (Abstract Class)
Kelas dasar yang menyimpan informasi autentikasi dan identitas umum.
- **Atribut Utama**: `id` (UUID), `email` (String), `passwordHash` (String), `fullName` (String).
- **Fungsi**: Entitas inti bagi sistem autentikasi (`login()`, `logout()`).

### `Employee` (Inherits from `User`)
Merepresentasikan pegawai toko.
- **Atribut Utama**: `employeeCode` (String), `role` (RoleType Enum: ADMIN, WASHER, CASHIER), `salary` (Float).
- **Relasi**: Menggunakan *Inheritance* (Pewarisan) dari kelas `User`. Memiliki relasi *1-to-Many* dengan `Order` (satu pegawai bisa menangani banyak pesanan).

### `Customer` (Inherits from `User`)
Merepresentasikan pelanggan yang mendaftar di sistem.
- **Atribut Utama**: `phoneNumber` (String), `address` (String), `isMember` (Boolean), `loyaltyPoints` (Int).
- **Relasi**: *Inheritance* dari `User`. Memiliki relasi *1-to-Many* dengan `Order` (satu pelanggan bisa membuat banyak pesanan).

### `Service`
Katalog layanan yang ditawarkan (contoh: Deep Clean, Unyellowing).
- **Atribut Utama**: `id` (UUID), `name` (String), `description` (String), `basePrice` (Float), `estimatedDurationHours` (Int).

### `Order`
Tabel utama untuk mencatat satu transaksi pesanan cuci sepatu.
- **Atribut Utama**: `orderNumber` (String), `orderDate` (DateTime), `status` (OrderStatus Enum), `totalAmount` (Float).
- **Fungsi**: Menampung banyak item cuci dalam satu nomor pesanan.

### `OrderItem`
Detail spesifik untuk satu pasang sepatu yang dicuci di dalam sebuah `Order`.
- **Atribut Utama**: `shoeBrand` (String), `shoeColor` (String), `initialCondition` (String), `beforePhotoUrl` (String), `afterPhotoUrl` (String), `subTotal` (Float).
- **Relasi**: Menggunakan relasi **Composition** dengan `Order`. Artinya, `OrderItem` tidak bisa berdiri sendiri; jika `Order` dihapus, maka `OrderItem` di dalamnya otomatis terhapus. Memiliki relasi *Many-to-1* dengan `Service` (banyak item sepatu bisa menggunakan jenis layanan yang sama).

### `Payment`
Sistem pembayaran untuk pesanan.
- **Atribut Utama**: `id` (UUID), `amount` (Float), `method` (String), `status` (String).
- **Relasi**: *1-to-1* dengan `Order` (Satu pesanan dibayar dengan satu nota transaksi pembayaran utama).

## 2. Relasi Antar Class

1. **Inheritance (Pewarisan)**: `Customer` dan `Employee` mewarisi properti dari `User`. Ini menghemat redundansi data seperti Nama, Email, dan Password untuk keperluan Login.
2. **1-to-Many**: 
   - `Customer` -> `Order`: Satu pelanggan bisa melakukan pemesanan berkali-kali.
   - `Employee` -> `Order`: Satu *Washer* bisa mencuci banyak orderan sepatu.
3. **Many-to-1**: 
   - `OrderItem` -> `Service`: Banyak sepatu dari order yang berbeda bisa menggunakan layanan "Deep Clean".
4. **Composition**: 
   - `Order` *-- `OrderItem`: Hubungan "Kuat". Sebuah item cucian (sepatu spesifik dengan foto *before-after*) mutlak adalah bagian dari sebuah `Order`. Tanpa `Order` yang sah, `OrderItem` tidak ada artinya.
5. **1-to-1**:
   - `Order` -> `Payment`: Setiap order memiliki satu catatan tagihan pembayaran spesifik.
