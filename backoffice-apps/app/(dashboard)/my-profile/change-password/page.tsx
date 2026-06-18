"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

  // State untuk form
  const [formData, setFormData] = useState({
    password_current: "",
    password_new: "",
    password_confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const validatePassword = (password: string): boolean => {
    // Basic validation: at least 8 characters, one uppercase, one lowercase, one number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validasi: Cek apakah password baru & konfirmasi cocok
    if (formData.password_new !== formData.password_confirm) {
      setMessage({
        type: "error",
        text: "Konfirmasi password baru tidak cocok!",
      });
      return;
    }

    // Validasi kekuatan password baru
    if (!validatePassword(formData.password_new)) {
      setMessage({
        type: "error",
        text: "Password baru harus minimal 8 karakter, dengan huruf besar, kecil, dan angka.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setTimeout(() => router.push("/my-profile"), 2000); // Delay for user to see message
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengubah password. Coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow p-8 max-w-3xl"
      >
        <h1 className="text-xl font-semibold text-gray-800 mb-8">
          Ubah Kata Sandi
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        {/* Current Password */}
        <div className="mb-6">
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kata Sandi Saat Ini
          </label>
          <div className="relative">
            <input
              id="current-password"
              required
              disabled={loading}
              type={showCurrent ? "text" : "password"}
              value={formData.password_current}
              onChange={(e) =>
                setFormData({ ...formData, password_current: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              placeholder="Masukkan kata sandi saat ini"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
              aria-label="Tampilkan atau sembunyikan kata sandi saat ini"
            >
              {showCurrent ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-6">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              id="new-password"
              required
              disabled={loading}
              type={showNew ? "text" : "password"}
              value={formData.password_new}
              onChange={(e) =>
                setFormData({ ...formData, password_new: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              placeholder="Masukkan kata sandi baru"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
              aria-label="Tampilkan atau sembunyikan kata sandi baru"
            >
              {showNew ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-10">
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              required
              disabled={loading}
              type={showConfirm ? "text" : "password"}
              value={formData.password_confirm}
              onChange={(e) =>
                setFormData({ ...formData, password_confirm: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
              placeholder="Konfirmasi kata sandi baru"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:opacity-50"
              aria-label="Tampilkan atau sembunyikan konfirmasi kata sandi"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/my-profile")}
            className="px-6 py-2.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Tutup
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
