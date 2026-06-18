import axios from "axios";

// Ambil URL dasar dari env
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

/**
 * INTERFACES
 */
export interface ServiceResponse {
  data: any;
  meta?: {
    last_page: number;
    current_page: number;
    total: number;
  };
}

/**
 * AXIOS INSTANCE CONFIGURATION
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    // HAPUS "Content-Type": "application/json" di sini
    // agar Axios bisa otomatis menyesuaikan tipe konten (terutama untuk FormData)
  },
});

// Interceptor untuk menyisipkan Token secara otomatis pada setiap request
api.interceptors.request.use((config: any) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const manualToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  const activeToken =
    token && token !== "undefined" && token !== "null" ? token : manualToken;

  if (config.headers && activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }
  return config;
});

/**
 * API METHODS
 */

/**
 * 1. MENGAMBIL/MENCARI DATA (GET LIST)
 */
export async function searchServices(params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<ServiceResponse | null> {
  try {
    // Tidak perlu lagi kirim company_id, biarkan backend memfilter berdasarkan Token
    const response = await api.get<ServiceResponse>(`/services`, {
      params: params,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Gagal ambil data servis:",
      error.response?.data || error.message,
    );
    return null;
  }
}

/**
 * 2. MENGAMBIL DETAIL DATA BERDASARKAN ID (GET DETAIL)
 */
export async function getServiceById(
  id: string | number,
): Promise<ServiceResponse | null> {
  try {
    const response = await api.get<ServiceResponse>(`/services/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Gagal ambil detail servis:",
      error.response?.data || error.message,
    );
    return null;
  }
}

/**
 * 3. MENAMBAH DATA BARU (POST)
 */
export async function createService(formData: FormData): Promise<any> {
  try {
    const response = await api.post(`/services`, formData);
    return response.data;
  } catch (error: any) {
    console.error("Detail Error Create:", error.response?.data);
    throw error.response?.data || error;
  }
}

/**
 * 4. MEMPERBARUI DATA (UPDATE)
 */
export async function updateService(
  id: string | number,
  formData: FormData,
): Promise<any> {
  try {
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }

    const response = await api.post(`/services/${id}`, formData);
    return response.data;
  } catch (error: any) {
    console.error("Detail Error Update:", error.response?.data);
    throw error.response?.data || error;
  }
}

/**
 * 5. MENGHAPUS DATA (DELETE)
 */
export async function deleteService(id: string | number): Promise<boolean> {
  if (!id || id === "undefined" || id === "null") {
    console.error(
      "❌ Batal Hapus: ID yang dikirim ke fungsi deleteService kosong atau undefined!",
    );
    return false;
  }

  try {
    console.log(`⏳ Sedang mencoba menghapus data dengan ID: ${id}...`);
    const response = await api.delete(`/services/${id}`);

    if (response.status === 200 || response.status === 204) {
      console.log(`✅ Berhasil menghapus data ID: ${id}`);
      return true;
    }

    return false;
  } catch (error: any) {
    const statusCode = error.response?.status;
    console.error(
      `❌ Gagal hapus servis (Status Code: ${statusCode || "Unknown"}):`,
      error.response?.data || error.message,
    );
    return false;
  }
}

// =====================================================================
// TAMBAHAN BARU: Export serviceApi agar bisa dibaca oleh halaman Edit Order
// =====================================================================
export const serviceApi = {
  getAll: async () => {
    return await searchServices({});
  },
  getById: async (id: string | number) => {
    return await getServiceById(id);
  },
  create: async (formData: FormData) => {
    return await createService(formData);
  },
  update: async (id: string | number, formData: FormData) => {
    return await updateService(id, formData);
  },
  delete: async (id: string | number) => {
    return await deleteService(id);
  },
};
