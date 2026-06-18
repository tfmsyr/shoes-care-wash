# 🚀 Laravel Project Setup Guide

Panduan ini membantu untuk menjalankan project Laravel dari awal hingga tahap **migrasi database** dan **seeding data**.

---

## 📌 Prasyarat

Pastikan sudah terpasang di komputer Anda:

- [PHP ^8.2](https://www.php.net/downloads.php)
- [Composer](https://getcomposer.org/download/)
- [MySQL / MariaDB](https://www.mysql.com/) atau database lain yang kompatibel

---

## 📂 Clone Project

Clone repository Laravel ke lokal:

```bash
git clone -b development https://gitlab.com/shoes-care-apps/backoffice-api-apps.git
cd backoffice-api-apps
```

## ⚙️ Install Dependencies

Install dependency PHP:

```bash
composer update
```

## 🔑 Konfigurasi Environment

Salin file .env.example menjadi .env:

```bash
cp .env.example .env
```

Generate application key:
```bash
php artisan key:generate
```

## 🛢️ Setup Database

Buat database baru di MySQL:

```bash
CREATE DATABASE nama_database;
```

Buka file .env dan sesuaikan konfigurasi database:
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

## 📦 Jalankan Migration & Seeder

Jalankan migrasi database:

```bash
php artisan migrate
```

Jika ada seeder:
```bash
php artisan db:seed
```

Atau sekaligus (migrasi + seeder):
```bash
php artisan migrate --seed
```

## ▶️ Menjalankan Aplikasi

Jalankan server lokal Laravel:

```bash
php artisan serve
```
Akses api di:

👉 http://127.0.0.1:8000/api