import axios from "axios";

// === CONFIG MENGGUNAKAN .ENV ===
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

// === INTERFACES ===
export interface UserProfile {
  nik: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
}

export interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  logo?: string;
  photo?: string;
}

const resolveAssetUrl = (value?: string) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return value;

  try {
    const apiUrl = new URL(apiBase);
    const origin = apiUrl.origin;
    const normalized = value.trim().replace(/\\/g, "/").replace(/^\.?\//, "");
    const withoutPublic = normalized.replace(/^public\//, "");
    const withoutStorage = normalized.replace(/^storage\//, "");

    const candidates = [
      `${origin}/${normalized}`,
      `${origin}/${withoutPublic}`,
      `${origin}/storage/${withoutStorage}`,
      new URL(normalized, `${origin}/`).toString(),
    ];

    return candidates[0];
  } catch {
    return value;
  }
};

export function getCompanyImageSrc(company?: CompanyData | null) {
  if (!company) return undefined;
  return company.logo || company.photo || undefined;
}

const normalizeCompanyData = (company?: CompanyData | null): CompanyData | null => {
  if (!company) return null;

  return {
    ...company,
    logo: resolveAssetUrl(company.logo),
    photo: resolveAssetUrl(company.photo),
  };
};

// Buat instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor untuk Token
api.interceptors.request.use((config: any) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const manualToken = "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5";

  if (config.headers) {
    const finalToken = token && token !== "undefined" ? token : manualToken;
    config.headers.Authorization = `Bearer ${finalToken}`;
  }

  return config;
});

// === COMPANY FUNCTIONS ===

export async function getCompanyProfile(): Promise<CompanyData | null> {
  try {
    const response = await api.get<{ data: CompanyData }>("/companies/manage");
    return normalizeCompanyData(response.data?.data || response.data);
  } catch (error) {
    console.error("Gagal ambil profil:", error);
    return null;
  }
}

/**
 * Update profil menggunakan POST murni
 * Berdasarkan log Error 405, server hanya menerima POST
 */
export async function updateCompanyProfile(
  formData: FormData | CompanyData,
): Promise<boolean> {
  try {
    // Kita hapus append("_method", "PUT") karena server menolak PUT
    const response = await api.post("/companies/manage", formData, {
      headers: {
        // Otomatis deteksi multipart untuk upload foto
        "Content-Type":
          formData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    });

    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.log("=== DETAIL ERROR SERVER ===");
    // Lihat tabel error di console untuk cek validasi timezone
    if (error.response?.status === 422) {
      console.table(error.response.data.errors);
    } else {
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
    }

    return false;
  }
}

// === USER FUNCTIONS ===

/**
 * Fungsi untuk mengambil data User yang sedang login
 */
export async function getProfile(): Promise<UserProfile | null> {
  try {
    // GANTI "/me" MENJADI "/profile"
    const response = await api.get<{ data: UserProfile }>("/profile");

    // Biasanya Laravel Resource membungkus datanya dalam object 'data'
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Gagal ambil profil user:", error);
    return null;
  }
}

/**
 * Fungsi untuk update profil User
 */
export async function updateProfile(
  formData: FormData | any
): Promise<boolean> {
  try {
    // Sesuai dengan api.php: v1/app/profile/update
    const response = await api.post("/profile/update", formData, {
      headers: {
        "Content-Type":
          formData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    });

    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error("Gagal update profil user:", error.response?.data || error.message);
    return false;
  }
}

export async function updateProfilePhoto(file: File): Promise<UserProfile | null> {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await api.post<{ data: UserProfile }>("/profile/change-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data || response.data || null;
  } catch (error: any) {
    console.error("Gagal update foto profil:", error.response?.data || error.message);
    return null;
  }
}
