// file: lib/service-category.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Mengambil token dari cookies untuk mendeteksi user dan company_id secara otomatis di backend
const getToken = () => {
  return (
    Cookies.get("token") ||
    "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5" // Hapus nilai default ini nanti jika login sudah full berjalan
  );
};

// ==========================================
// 1. CREATE SERVICE CATEGORY (Tambah Data)
// ==========================================
export async function createServiceCategory(data: {
  name: string;
  description?: string;
}) {
  try {
    const res = await api.post(
      `/v1/app/service-categories`,
      {
        name: data.name,
        description: data.description || "-",
        // Backend otomatis membaca company_id dari Token
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("Create Service Category Error:", error);
    return null;
  }
}

// ==========================================
// 2. GET ALL SERVICE CATEGORIES (Tampil di Dashboard)
// ==========================================
export async function getServiceCategories() {
  try {
    const res = await api.get(`/v1/app/service-categories`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    // Menyesuaikan dengan format response Laravel, biasanya ada di res.data.data
    return (res.data as any)?.data || res.data;
  } catch (error) {
    console.error("Fetch Service Categories Error:", error);
    return []; // Kembalikan array kosong agar map() di frontend tidak error
  }
}

// ==========================================
// 3. GET SERVICE CATEGORY BY ID (Untuk halaman Edit)
// ==========================================
export async function getServiceCategoryById(id: string | number) {
  try {
    const res = await api.get(`/v1/app/service-categories/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return (res.data as any)?.data || res.data;
  } catch (error) {
    console.error(`Fetch Service Category ID ${id} Error:`, error);
    return null;
  }
}

// ==========================================
// 4. UPDATE SERVICE CATEGORY (Simpan Edit Data)
// ==========================================
export async function updateServiceCategory(
  id: string | number,
  data: { name: string; description?: string },
) {
  try {
    // BERUBAH DI SINI: Menggunakan POST karena backend menolak PUT
    const res = await api.post(
      `/v1/app/service-categories/${id}`,
      {
        name: data.name,
        description: data.description || "-",
      },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    return res.data;
  } catch (error) {
    console.error(`Update Service Category ID ${id} Error:`, error);
    return null;
  }
}

// ==========================================
// 5. DELETE SERVICE CATEGORY (Hapus Data di Dashboard)
// ==========================================
export async function deleteServiceCategory(id: string | number) {
  try {
    const res = await api.delete(`/v1/app/service-categories/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return true; // Return true jika berhasil dihapus
  } catch (error) {
    console.error(`Delete Service Category ID ${id} Error:`, error);
    return false; // Return false jika gagal
  }
}
