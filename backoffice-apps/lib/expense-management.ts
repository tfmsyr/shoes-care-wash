import axios from "axios";

// Base URL sesuai dengan pola proyek Anda
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

export interface Expense {
  code: string;
  created_at: any;
  id: string | number;
  expense_category_id?: string | number;
  name: string;
  amount: number | string;
  date: string;
  description?: string;
  company_id?: string | number;
  category?: any;
  [key: string]: any;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor untuk Token Otomatis
api.interceptors.request.use((config: any) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const manualToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  if (config.headers) {
    config.headers.Authorization = `Bearer ${
      token && token !== "undefined" && token !== "null" ? token : manualToken
    }`;
  }
  return config;
});

/**
 * Helper untuk membersihkan format uang (menghapus Rp, koma, titik)
 */
const cleanAmountValue = (amount: string | number) => {
  if (typeof amount === "string") {
    const cleaned = amount.replace(/[^0-9]/g, "");
    return Number(cleaned);
  }
  return Number(amount) || 0;
};

/**
 * 1. Ambil List Expenses (Bisa dengan pencarian)
 */
export async function getExpenses(query: string = ""): Promise<Expense[]> {
  try {
    const response = await api.get(`/expenses`, {
      params: { search: query },
    });
    const resData = response.data;
    if (resData && Array.isArray(resData.data)) return resData.data;
    if (resData && resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return Array.isArray(resData) ? resData : [];
  } catch (error) {
    console.error("Fetch Expenses Error:", error);
    return [];
  }
}

/**
 * 2. Ambil Semua List Expenses (All)
 */
export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const response = await api.get(`/expenses/all`);
    const resData = response.data;
    if (resData && Array.isArray(resData.data)) return resData.data;
    return Array.isArray(resData) ? resData : [];
  } catch (error) {
    console.error("Fetch All Expenses Error:", error);
    return [];
  }
}

/**
 * 3. Ambil SATU Expense berdasarkan ID
 */
export async function getExpenseById(
  id: string | number,
): Promise<Expense | null> {
  try {
    const response = await api.get(`/expenses/${id}`);
    const resData = response.data;
    return resData?.data || resData || null;
  } catch (error) {
    console.error(`Fetch Expense ID ${id} Error:`, error);
    return null;
  }
}

/**
 * 4. Tambah Expense BARU (Mendukung Upload File)
 */
export async function createExpense(data: any): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("date", data.date);
    formData.append("amount", cleanAmountValue(data.amount).toString());
    formData.append("description", data.description || "");

    // Fleksibilitas membaca ID Kategori dari form
    const catId =
      data.expense_category_id || data.category?.id || data.category_id;
    if (catId) formData.append("category_id", catId.toString());

    // Cek upload file (Bisa objek File langsung, atau dari FileList/Array)
    if (data.proof instanceof File) {
      formData.append("proof", data.proof);
    } else if (data.proof && data.proof[0] instanceof File) {
      formData.append("proof", data.proof[0]);
    }

    const response = await api.post("/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error("Create Error:", error.response?.data || error.message);
    return false;
  }
}

/**
 * 5. Update Expense (MENGGUNAKAN METHOD SPOOFING)
 */
export async function updateExpense(
  id: string | number,
  data: any,
): Promise<boolean> {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("date", data.date);
    formData.append("amount", cleanAmountValue(data.amount).toString());
    formData.append("description", data.description || "");

    const catId =
      data.expense_category_id || data.category?.id || data.category_id;
    if (catId) formData.append("category_id", catId.toString());

    // Hanya kirim file jika user mengunggah file baru
    // (Jika tidak diubah, data.proof biasanya berupa string URL lama, jangan dikirim)
    if (data.proof instanceof File) {
      formData.append("proof", data.proof);
    } else if (data.proof && data.proof[0] instanceof File) {
      formData.append("proof", data.proof[0]);
    }

    // METHOD SPOOFING: Laravel mewajibkan POST + _method=PUT untuk FormData yang berisi file
    formData.append("_method", "PUT");

    const response = await api.post(`/expenses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return (
      response.status === 200 ||
      response.status === 204 ||
      response.status === 201
    );
  } catch (error: any) {
    console.error(
      `Update Error (ID: ${id}):`,
      error.response?.data || error.message,
    );
    if (error.response?.data?.errors) {
      alert(
        "Gagal memperbarui data:\n" +
          JSON.stringify(error.response.data.errors, null, 2),
      );
    }
    return false;
  }
}

/**
 * 6. Hapus Expense
 */
export async function deleteExpense(id: string | number): Promise<boolean> {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error(`Delete Error (ID: ${id}):`, error);
    return false;
  }
}

/**
 * 7. Export Expenses ke Excel/PDF
 */
export async function exportExpenses(): Promise<Blob | null> {
  try {
    const response = await api.get<Blob>(`/expenses/export`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Export Error:", error);
    return null;
  }
}
