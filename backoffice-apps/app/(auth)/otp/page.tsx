"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { otpSchema } from "@/schemas/auth/authSchema";
import { requestOTP, verifyOtp } from "@/services/auth";

export default function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem("reset_phone") || "";
    if (!savedPhone) {
      router.replace("/forgot-password");
      return;
    }
    setPhone(savedPhone);
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    const result = otpSchema.safeParse({ otp: otpCode });

    if (!result.success) {
      setError(result.error.issues[0]?.message || "OTP is invalid.");
      return;
    }

    if (!phone) {
      setError("Phone number session not found. Please request OTP again.");
      router.push("/forgot-password");
      return;
    }

    try {
      setIsPending(true);
      await verifyOtp({
        phone,
        otp_code: Number(otpCode),
      });
      sessionStorage.setItem("reset_otp", otpCode);
      router.push("/confirm-password");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(err?.response?.data?.message || "OTP verification failed.");
      }
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      router.push("/forgot-password");
      return;
    }

    try {
      setIsResending(true);
      setError("");
      setSuccess("");
      await requestOTP(phone);
      setOtp(Array(4).fill(""));
      setTimeLeft(60);
      sessionStorage.removeItem("reset_otp");
      setSuccess("A new OTP has been sent to your phone number.");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(err?.response?.data?.message || "Failed to resend OTP.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-[#0A2686] mb-2">Verifikasi OTP</h1>
      <p className="text-gray-500 mb-8">
        Masukkan 4 digit kode verifikasi yang dikirim ke {phone || "no. HP Anda"}.
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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, index)}
              className={`w-14 h-14 text-center text-lg font-bold text-gray-700 rounded-xl border focus:outline-none focus:ring-4 transition-all ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-600 focus:ring-blue-100"
              }`}
            />
          ))}
        </div>

        <p className={`text-center text-sm font-semibold ${timeLeft === 0 ? "text-red-600" : "text-blue-600"}`}>
          {timeLeft === 0
            ? "OTP kedaluwarsa. Anda bisa meminta kode baru."
            : `Kirim ulang tersedia dalam ${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`}
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#0A2686] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
        >
          {isPending ? "Memverifikasi..." : "Verifikasi OTP"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Belum menerima kode?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timeLeft > 0 || isResending}
            className={`font-bold ${
              timeLeft > 0 || isResending
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
          >
            {isResending ? "Mengirim..." : "Kirim ulang kode"}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-100">
          Nomor salah?{" "}
          <Link href="/forgot-password" className="text-blue-600 font-bold hover:underline">
            Ganti no. HP
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          (c) 2025 Shoes Care - Semua Hak Dilindungi
        </p>
      </form>
    </>
  );
}
