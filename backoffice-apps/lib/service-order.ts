import axios, { InternalAxiosRequestConfig } from "axios";

// === CONFIG MENGGUNAKAN .ENV ===
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

// === INTERFACES ===
export interface Customer {
  id: number;
  name: string;
  phone: string;
}

export interface Service {
  id: number;
  name: string;
  price?: number;
}

// Interface untuk detail item yang ada di dalam sebuah order
export interface ServiceOrderDetail {
  id: number;
  service_order_id: number;
  service_id: number;
  qty?: number;
  quantity?: number;
  price: number;    // Harga pada saat transaksi dilakukan
  subtotal?: number;
  service?: Service; // Relasi ke data Master Service (untuk ambil nama)
}

export interface ServiceOrder {
  data: ServiceOrder;
  id: number;
  order_number: string;
  customer_id: number;
  discount: number;
  status: string;
  notes?: string;
  total?: string | number;
  customer?: Customer;       // Relasi ke tabel Customers
  details?: ServiceOrderDetail[]; // Array dari detail item layanan
  created_at?: string;
}

/**
 * Interface untuk pengiriman data (Payload)
 */
export interface ServiceOrderPayload {
  order_number?: string;
  customer_id: number;
  discount?: number;
  status: string;
  notes?: string;
  items?: {
    service_id: number;
    qty: number; // Pastikan menggunakan 'qty' agar lolos validasi Laravel
    price: number;
  }[];
}

// Buat instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor untuk Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Token manual untuk testing (Ganti jika sudah production)
    const manualToken = "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5";

    if (config.headers) {
      const finalToken = token && token !== "undefined" ? token : manualToken;
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// === SERVICE ORDER FUNCTIONS ===

export const serviceOrderApi = {
  /**
   * Ambil semua data Service Orders untuk Tabel Utama
   */
  getAll: async () => {
    try {
      const response = await api.get("/service-orders");
      // Biasanya Laravel mengembalikan { data: [...] }
      return response.data.data || response.data;
    } catch (error: any) {
      console.error("Gagal ambil data service orders:", error);
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data dari server",
      );
    }
  },

  /**
   * Ambil satu data detail berdasarkan ID (Untuk Invoice)
   */
  getById: async (id: number | string): Promise<ServiceOrder> => {
    try {
      if (!id) throw new Error("ID tidak valid");
      const response = await api.get(`/service-orders/${id}`);
      
      // Mengambil data dari wrapper .data milik Laravel Resource
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`Gagal ambil detail ID ${id}:`, error.response || error);
      if (error.response?.status === 404) {
        throw new Error("Data pesanan tidak ditemukan (404).");
      }
      throw new Error(
        error.response?.data?.message || "Gagal mengambil detail pesanan",
      );
    }
  },

  /**
   * Buat pesanan baru
   */
  create: async (payload: ServiceOrderPayload) => {
    try {
      const response = await api.post("/service-orders", payload);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(", ");
        throw new Error(`Validasi Gagal: ${errorMessage}`);
      }
      throw new Error(
        error.response?.data?.message || "Gagal membuat pesanan.",
      );
    }
  },

  /**
   * Update data pesanan
   */
  update: async (
    id: number | string,
    payload: Partial<ServiceOrderPayload>,
  ) => {
    try {
      const response = await api.put(`/service-orders/${id}`, payload);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(", ");
        throw new Error(`Validasi Gagal: ${errorMessage}`);
      }
      throw new Error(
        error.response?.data?.message || "Gagal memperbarui pesanan.",
      );
    }
  },

  /**
   * Hapus data pesanan
   */
  delete: async (id: number | string) => {
    try {
      const response = await api.delete(`/service-orders/${id}`);
      return response.status === 204 || response.status === 200;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Gagal menghapus pesanan.",
      );
    }
  },
};
