import axios from "axios";

// Base URL sesuai dengan pola proyek Anda
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

export interface ExpenseCategory {
  id: string | number;
  name: string;
  description?: string;
  company_id?: string;
}

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
  const manualToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  if (config.headers) {
    config.headers.Authorization = `Bearer ${
      token && token !== "undefined" && token !== "null" ? token : manualToken
    }`;
  }
  return config;
});

/**
 * Helper BARU: Mengambil konteks perusahaan berdasarkan token login saat ini.
 * Menghindari data tertukar dengan perusahaan lain dan menghapus hardcode ID "4".
 */
async function getMyCompany() {
  try {
    const response = await api.get(`/companies/manage`);
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching company context:", error);
    throw new Error("Unauthorized: Company context not found");
  }
}

/**
 * 1. Ambil List Expense Categories (Search/Pagination)
 * Otomatis difilter berdasarkan perusahaan user yang sedang login.
 */
export async function getExpenseCategories(
  query: string = "",
): Promise<ExpenseCategory[]> {
  try {
    const company = await getMyCompany();
    const companyId = company?.id;

    if (!companyId) return [];

    const response = await api.get<{ data: ExpenseCategory[] }>(
      `/expense-categories`,
      {
        params: {
          company_id: companyId,
          search: query,
        },
      },
    );

    return response.data?.data || [];
  } catch (error: any) {
    console.error(
      "Gagal ambil list expense category:",
      error.response?.data || error.message,
    );
    return [];
  }
}

/**
 * 2. Ambil SATU Category berdasarkan ID
 */
export async function getExpenseCategoryById(
  id: string | number,
): Promise<ExpenseCategory | null> {
  try {
    const response = await api.get<{ data: ExpenseCategory }>(
      `/expense-categories/${id}`,
    );
    return response.data?.data || null;
  } catch (error: any) {
    console.error(
      `Gagal ambil category ID ${id}:`,
      error.response?.data || error.message,
    );
    return null;
  }
}

/**
 * 3. Tambah Category BARU
 */
export async function createExpenseCategory(data: any): Promise<boolean> {
  try {
    const company = await getMyCompany();

    const payload = {
      ...data,
      company_id: company?.id,
    };

    const response = await api.post("/expense-categories", payload);
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error(
      "Gagal tambah category:",
      error.response?.data || error.message,
    );
    return false;
  }
}

/**
 * 4. Update Category
 * Sesuai api.php Anda: Route::post('expense-categories/{id}', 'update')
 */
export async function updateExpenseCategory(
  id: string | number,
  data: any,
): Promise<boolean> {
  try {
    const company = await getMyCompany();

    const payload = {
      ...data,
      company_id: company?.id,
      // Tambahkan _method: "PUT" jika sewaktu-waktu backend menolak POST biasa untuk update
      // _method: "PUT"
    };

    const response = await api.post(`/expense-categories/${id}`, payload);
    return (
      response.status === 200 ||
      response.status === 204 ||
      response.status === 201
    );
  } catch (error: any) {
    console.error(
      "Gagal update category:",
      error.response?.data || error.message,
    );
    return false;
  }
}

/**
 * 5. Hapus Category
 */
export async function deleteExpenseCategory(
  id: string | number,
): Promise<boolean> {
  try {
    const response = await api.delete(`/expense-categories/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error(
      "Gagal hapus category:",
      error.response?.data || error.message,
    );
    return false;
  }
}
