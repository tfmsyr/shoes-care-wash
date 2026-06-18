import axios from "axios";
import Cookies from "js-cookie";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

// 1. Tambahkan Interface agar Frontend kamu tahu isi data Product
export interface Product {
  id: string | number;
  name: string;
  price?: number;
  purchase_price?: number;
  selling_price?: number;
  code: string;
  image_url?: string;
  photo?: string;
  category_id?: number;
  description?: string;
  stock?: number;
  discount?: number;
  unit?: string;
  barcode?: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  return (
    Cookies.get("token") ||
    "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5" // Token fallback kamu
  );
};

// Interceptor untuk mempermudah penulisan Authorization di setiap request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Bungkus dalam Objek productApi
export const productApi = {
  /** Ambil SEMUA Produk */
  getAll: async (): Promise<Product[]> => {
    try {
      const res = await api.get(`/products`);
      return (res.data as any)?.data || res.data;
    } catch (error) {
      console.error("Fetch Products Error:", error);
      return [];
    }
  },

  /** Ambil SATU Produk */
  getById: async (id: string | number): Promise<Product | null> => {
    try {
      const res = await api.get(`/products/${id}`);
      return (res.data as any)?.data || res.data;
    } catch (error) {
      console.error("Fetch Product Detail Error:", error);
      return null;
    }
  },

  /** Buat Produk Baru (Pakai FormData untuk Gambar) */
  create: async (formData: FormData) => {
    try {
      const res = await api.post(`/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("Create Product Error:", error);
      throw error;
    }
  },

  /** Update Produk mengikuti route backend POST /products/{id} */
  update: async (id: string | number, formData: FormData) => {
    try {
      const res = await api.post(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error("Update Product Error:", error);
      throw error;
    }
  },

  /** Hapus Produk */
  delete: async (id: string | number) => {
    try {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      console.error("Delete Product Error:", error);
      throw error;
    }
  },

  /** Ambil Semua Kategori */
  getCategories: async () => {
    try {
      const res = await api.get(`/product-categories/all`);
      return (res.data as any)?.data || res.data;
    } catch (error) {
      console.error("Fetch Categories Error:", error);
      throw error;
    }
  },
};

// Export fungsi mandiri untuk menjaga kompatibilitas kode lama
export const getProducts = productApi.getAll;
export const getProductById = productApi.getById;
export const createProduct = productApi.create;
export const updateProduct = productApi.update;
export const deleteProduct = productApi.delete;
export const getCategories = productApi.getCategories;
