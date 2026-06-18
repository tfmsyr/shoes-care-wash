import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

/**
 * Helper untuk mengambil token terbaru
 */
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Konfigurasi header standar
 * Catatan: Jangan tambahkan 'Content-Type' manual agar Axios bisa 
 * menentukan boundary otomatis saat mengirim FormData (file).
 */
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    Accept: "application/json",
  },
});

export const employeeService = {
  /**
   * Mengambil konteks perusahaan user yang sedang login
   */
  async getMyCompany() {
    try {
      const response = await axios.get(`${API_URL}/companies/manage`, getHeaders());
      return response.data?.data;
    } catch (error) {
      console.error("Error fetching company context:", error);
      throw error;
    }
  },

  /**
   * Mengambil daftar karyawan berdasarkan company_id
   */
  async getAllEmployees(page = 1, size = 50) {
    try {
      const company = await this.getMyCompany();
      const companyId = company?.id;

      if (!companyId) throw new Error("Unauthorized: Company ID not found");

      const response = await axios.get(`${API_URL}/users`, {
        ...getHeaders(),
        params: {
          company_id: companyId,
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employees list:", error);
      throw error;
    }
  },

  /**
   * Mengambil detail satu karyawan (untuk halaman Edit/Detail)
   */
  async getEmployeeById(id: string | number) {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, getHeaders());
      // Handle jika response nested di data.data atau langsung di data
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Membuat karyawan baru
   * Mendukung JSON object maupun FormData (untuk upload foto)
   */
  async createEmployee(data: any) {
    try {
      const company = await this.getMyCompany();
      let payload;

      if (data instanceof FormData) {
        payload = data;
        if (!payload.has("company_id")) {
          payload.append("company_id", company.id);
        }
      } else {
        payload = { ...data, company_id: company.id };
      }

      const response = await axios.post(`${API_URL}/users`, payload, getHeaders());
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  /**
   * Update karyawan (Edit)
   * Backend route `users/{id}` saat ini menerima POST murni, termasuk saat upload foto.
   */
  async updateEmployee(id: string | number, data: any) {
    try {
      const payload = data instanceof FormData ? data : { ...data };

      const response = await axios.post(
        `${API_URL}/users/${id}`, 
        payload, 
        getHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Menghapus karyawan
   */
  async deleteEmployee(id: string | number) {
    try {
      const response = await axios.delete(`${API_URL}/users/${id}`, getHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      throw error;
    }
  }
};
