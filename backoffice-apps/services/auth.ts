import axios from "axios";
import Cookies from "js-cookie";
import {
  RegisterResponse,
  LoginResponse,
  ForgotPasswordResponse,
  VerifyOtpResponse,
  ResetPasswordResponse,
} from "@/types/auth";

// API_URL sekarang berisi http://192.168.1.19:8000/api
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// REGISTER
export async function register(payload: {
  business_name: string;
  business_address: string;
  name: string;
  phone: string;
  password: string;
}): Promise<RegisterResponse> {
  // Langsung tembak ke path spesifik
  const res = await axios.post<RegisterResponse>(
    `${API_URL}/v1/app/auth/register`,
    payload,
  );
  return res.data;
}

// LOGIN
export async function login(payload: {
  phone: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(
    `${API_URL}/v1/app/auth/login`,
    payload,
  );

  // Pastikan token tersimpan dengan benar di Cookies
  if (res?.data?.data?.token) {
    Cookies.set("token", res.data.data.token, { expires: 7 }); // Simpan selama 7 hari
  }
  return res.data;
}

// FORGOT PASSWORD
export async function forgotPassword(payload: {
  phone: string;
}): Promise<ForgotPasswordResponse> {
  const res = await axios.post<ForgotPasswordResponse>(
    `${API_URL}/v1/app/auth/forgot-password`,
    payload,
  );
  return res.data;
}

// VERIFY OTP
export async function verifyOtp(payload: {
  phone: string;
  otp_code: number;
}): Promise<VerifyOtpResponse> {
  const res = await axios.post<VerifyOtpResponse>(
    `${API_URL}/v1/app/auth/verify-otp`,
    payload,
  );
  return res.data;
}

// RESET PASSWORD
export async function resetPassword(payload: {
  phone: string;
  otp_code: number;
  password: string;
  password_confirm: string;
}): Promise<ResetPasswordResponse> {
  const res = await axios.post<ResetPasswordResponse>(
    `${API_URL}/v1/app/auth/reset-password`,
    payload,
  );
  return res.data;
}

// REQUEST OTP (Alias untuk forgotPassword)
export async function requestOTP(phone: string) {
  const response = await axios.post(`${API_URL}/v1/app/auth/forgot-password`, {
    phone,
  });
  return response.data;
}
