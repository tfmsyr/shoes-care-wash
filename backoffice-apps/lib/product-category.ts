// file: lib/product-category.ts
import axios from "axios";

// 1. Gabungkan URL dari env dengan path /v1/app di sini
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

// --- INTERFACES ---
export interface Category {
  id: string;
  name: string;
  description: string;
  company_id?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: { id: string; name: string } | null;
  selling_price: string | number;
  stock: string | number;
  unit: string;
}

// --- AXIOS CONFIG ---
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor untuk Token Otomatis
api.interceptors.request.use((config: any) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 2. Ambil token dari env.local, atau gunakan fallback testing kamu
  const manualToken =
    process.env.NEXT_PUBLIC_AUTH_TOKEN ||
    "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5";

  if (config.headers) {
    config.headers.Authorization = `Bearer ${
      token && token !== "undefined" && token !== "null" ? token : manualToken
    }`;
  }
  return config;
});

/**
 * Helper untuk ambil Company ID secara aman
 */
const getSafeCompanyId = () => {
  if (typeof window === "undefined") return "1";
  try {
    const companyId = localStorage.getItem("company_id");
    if (companyId) return companyId;

    const profileStr = localStorage.getItem("user_profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.company_id || "1";
    }
    return "1";
  } catch (error) {
    return "1";
  }
};

// ==========================================
//           CATEGORY FUNCTIONS
// ==========================================

export async function getProductCategories(): Promise<Category[]> {
  try {
    const companyId = getSafeCompanyId();
    const response = await api.get("/product-categories/all", {
      params: { company_id: companyId },
    });
    const rawData = response.data;
    const parsedData = Array.isArray(rawData) ? rawData : rawData?.data || [];

    return parsedData;
  } catch (error: any) {
    console.error(
      "❌ Gagal ambil list kategori:",
      error.response?.data || error.message,
    );
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await api.get<{ data: Category }>(
      `/product-categories/${id}`,
    );
    return response.data?.data || null;
  } catch (error: any) {
    return null;
  }
}

export async function createProductCategory(data: {
  name: string;
  description?: string;
}): Promise<boolean> {
  try {
    const payload = {
      company_id: getSafeCompanyId(),
      name: data.name,
      description: data.description || "-",
    };
    const response = await api.post("/product-categories", payload);
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    return false;
  }
}

export async function updateProductCategory(
  id: string,
  data: { name: string; description?: string },
): Promise<boolean> {
  try {
    const payload = {
      company_id: getSafeCompanyId(),
      name: data.name,
      description: data.description || "-",
    };
    const response = await api.post(`/product-categories/${id}`, payload);
    return (
      response.status === 200 ||
      response.status === 204 ||
      response.status === 201
    );
  } catch (error: any) {
    return false;
  }
}

export async function deleteProductCategory(id: string): Promise<boolean> {
  try {
    const response = await api.delete(`/product-categories/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    return false;
  }
}

// ==========================================
//           PRODUCT FUNCTIONS
// ==========================================

/**
 * Ambil list semua produk (Dipakai di halaman Product Management)
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const companyId = getSafeCompanyId();
    const response = await api.get("/products", {
      params: { company_id: companyId },
    });
    const rawData = response.data;
    return Array.isArray(rawData) ? rawData : rawData?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Gagal ambil list produk:",
      error.response?.data || error.message,
    );
    return [];
  }
}

/**
 * Simpan Produk Baru (Dipakai di halaman Add Product)
 * Menerima FormData karena ada file gambar
 */
export async function createProduct(
  formData: FormData,
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // 👇 BLOK TAMBAHAN: Pengaman agar company_id selalu terkirim otomatis ke Laravel
    const companyId = getSafeCompanyId();
    if (!formData.has("company_id")) {
      formData.append("company_id", companyId);
    }

    // Override Content-Type menjadi multipart/form-data khusus untuk upload file
    const response = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "❌ Gagal save produk:",
      error.response?.data || error.message,
    );
    return { success: false, error: error.response?.data };
  }
}

/**
 * Hapus Produk
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error(
      "❌ Gagal hapus produk:",
      error.response?.data || error.message,
    );
    return false;
  }
}
