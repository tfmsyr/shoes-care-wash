"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { forgotPasswordSchema } from "@/schemas/auth/authSchema";
import { requestOTP } from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const result = forgotPasswordSchema.safeParse({ phone });

    if (!result.success) {
      setIsPending(false);
      setError(result.error.issues[0]?.message || "Phone number is invalid.");
      return;
    }

    try {
      await requestOTP(phone);
      sessionStorage.setItem("reset_phone", phone);
      sessionStorage.removeItem("reset_otp");
      router.push("/otp");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(
          err?.response?.data?.message || "Something went wrong. Please try again.",
        );
      }
      setIsPending(false);
      return;
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-[#0A2686] mb-2">Lupa Kata Sandi</h1>
      <p className="text-gray-500 mb-8">
        Masukkan no. HP Anda untuk menerima kode verifikasi dan mengatur ulang
        kata sandi.
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
            No. HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Masukkan no. HP Anda"
            className="w-full px-5 py-3.5 text-gray-600 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#0A2686] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
        >
          {isPending ? "Mengirim OTP..." : "Kirim Kode Verifikasi"}
        </button>

        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-100">
          Sudah ingat kata sandi?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Kembali ke login
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          (c) 2025 Shoes Care - Semua Hak Dilindungi
        </p>
      </form>
    </>
  );
}
