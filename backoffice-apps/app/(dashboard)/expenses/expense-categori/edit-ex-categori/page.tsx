"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
// Import fungsi API real (create dihapus karena khusus edit)
import {
  getExpenseCategoryById,
  updateExpenseCategory,
} from "@/lib/expense-categori";

export default function FormEditCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = (params?.id || searchParams.get("id")) as string;

  // State form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Notifikasi
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Fungsi helper untuk memicu notifikasi
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    // Sembunyikan otomatis setelah 3 detik
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- 1. LOAD DATA UNTUK EDIT ---
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      const data = await getExpenseCategoryById(id);
      if (data) {
        setName(data.name);
        setDescription(data.description || "");
      } else {
        showToast("error", "Data tidak ditemukan atau terjadi kesalahan.");
        setTimeout(() => router.back(), 1500);
      }
      setIsLoading(false);
    };

    fetchDetail();
  }, [id, router]);

  // --- 2. HANDLE SAVE (UPDATE ONLY) ---
  async function handleSave() {
    if (!id) {
      showToast("error", "ID Kategori tidak valid.");
      return;
    }

    if (!name.trim()) {
      showToast("error", "Nama kategori harus diisi.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    // Langsung tembak ke fungsi update
    const success = await updateExpenseCategory(id, payload);

    if (success) {
      showToast("success", "Category updated successfully!");
      // Beri jeda sedikit agar user bisa melihat notifikasi sebelum pindah halaman
      setTimeout(() => {
        router.push("/expenses/expense-categori");
        router.refresh();
      }, 1500);
    } else {
      showToast("error", "Failed to update category. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50 p-6 md:p-8">
      {/* === NOTIFICATION TOAST === */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-100 animate-in fade-in slide-in-from-right-4 duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
              notification.type === "success"
                ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]"
                : "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
            <button
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className="ml-4 opacity-70 hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-10 shadow-sm min-h-[calc(100vh-6rem)]">
        <div className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl p-6 md:p-10 lg:p-12 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-2xl">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Teks statis menjadi Edit Category */}
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-8">
            Edit Category
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                rows={4}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 mt-10">
            <button
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-gray-500 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#3971FF] text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 disabled:bg-blue-400"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
