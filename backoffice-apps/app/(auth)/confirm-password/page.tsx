"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { confirmPasswordSchema } from "@/schemas/auth/authSchema";
import { resetPassword } from "@/services/auth";

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem("reset_phone") || "";
    const savedOtp = sessionStorage.getItem("reset_otp") || "";

    if (!savedPhone || !savedOtp) {
      router.replace("/forgot-password");
      return;
    }

    setPhone(savedPhone);
    setOtpCode(savedOtp);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phone || !otpCode) {
      setError("Reset session not found. Please request OTP again.");
      router.push("/forgot-password");
      return;
    }

    const result = confirmPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Password is invalid.");
      return;
    }

    try {
      setIsPending(true);
      const response = await resetPassword({
        phone,
        otp_code: Number(otpCode),
        password,
        password_confirm: confirmPassword,
      });

      setSuccess(response.message || "Password updated successfully.");
      sessionStorage.removeItem("reset_phone");
      sessionStorage.removeItem("reset_otp");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(err?.response?.data?.message || "Failed to reset password.");
      }
      setIsPending(false);
    }
  };

  return (
    <>
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex justify-between items-center animate-fade-in-down">
          <span className="font-medium text-sm">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-600 hover:text-green-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold text-[#0A2686] mb-2">Buat Kata Sandi Baru</h1>
      <p className="text-gray-500 mb-8">
        Atur kata sandi baru untuk {phone || "akun Anda"} agar proses pemulihan selesai.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru"
              className="w-full px-5 py-3.5 text-gray-600 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Gunakan 8-10 karakter.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Konfirmasi Kata Sandi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi baru"
              className="w-full px-5 py-3.5 text-gray-600 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#0A2686] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
        >
          {isPending ? "Menyimpan..." : "Reset Kata Sandi"}
        </button>

        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-100">
          Kembali ke{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          (c) 2025 Shoes Care - Semua Hak Dilindungi
        </p>
      </form>
    </>
  );
}
