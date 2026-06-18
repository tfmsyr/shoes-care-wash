// types/auth.ts

// ========== REGISTER ==========
export interface RegisterResponse {
  data: {
    id: number;
    company: { id: number; name: string };
    photo: string | null;
    nik: string | null;
    name: string;
    email: string | null;
    phone: string;
    role: { id: number; name: string };
    status: number;
    permissions: { name: string; slug: string }[];
    created_at: string;
    updated_at: string;
  };
}

// ========== LOGIN ==========
export interface LoginResponse {
  token: any;
  data: {
    id: number;
    company: { id: number; name: string };
    photo: string | null;
    nik: string | null;
    name: string;
    email: string | null;
    phone: string;
    token: string;
    role: { id: number; name: string };
    status: number;
    permissions: { name: string; slug: string }[];
    created_at: string;
    updated_at: string;
  };
}

// ========== FORGOT PASSWORD ==========
export interface ForgotPasswordResponse {
  data: {
    id: number;
    company: { id: number; name: string };
    photo: string | null;
    nik: string | null;
    name: string;
    email: string | null;
    phone: string;
    role: { id: number; name: string };
    status: number;
    permissions: { name: string; slug: string }[];
    created_at: string;
    updated_at: string;
  };
}

// ========== VERIFY OTP ==========
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

// ========== RESET PASSWORD ==========
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
