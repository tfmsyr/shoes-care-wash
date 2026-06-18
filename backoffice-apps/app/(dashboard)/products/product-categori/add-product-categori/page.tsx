"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { createProductCategory } from "@/lib/product-category";

export default function AddCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk mengatur notifikasi
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    setNotification(null); // Reset notifikasi setiap kali tombol ditekan

    const success = await createProductCategory({
      name: name,
      description: desc || "-",
    });

    if (success) {
      // Tampilkan notifikasi sukses
      setNotification({
        type: "success",
        message: "Category added successfully!",
      });
      
      // Beri delay 1.5 detik agar user sempat melihat notifikasi sebelum pindah halaman
      setTimeout(() => {
        router.push("/products/product-categori");
        router.refresh();
      }, 1500);
    } else {
      // Tampilkan notifikasi gagal
      setNotification({
        type: "error",
        message: "Failed to add category. Please try again",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50/30 w-full p-6 md:p-8 relative">
      
      {/* NOTIFIKASI TOAST (Pojok Kanan Atas) */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-5 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[320px] z-50 transition-all duration-300 ease-in-out ${
            notification.type === "success"
              ? "bg-[#e8f5e9] text-[#2e7d32]" // Warna background hijau muda, text hijau gelap
              : "bg-[#ffebee] text-[#c62828]" // Warna background merah muda, text merah gelap
          }`}
        >
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* PERUBAHAN DI SINI:
        Menghapus 'max-w-4xl mx-auto' dan menggantinya dengan 'w-full'
        agar card putih ini menyebar penuh mengisi sisa ruang yang ada.
      */}
      <div className="w-full bg-white md:border md:border-gray-200 rounded-xl md:shadow-sm flex flex-col overflow-hidden">
        <div className="md:p-8 flex-1 flex flex-col">
          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900">
              Add New Category
            </h2>
          </div>

          {/* FORM INPUT */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSaving}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 disabled:bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter category description"
                disabled={isSaving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex justify-end gap-3 pt-6">
            <button
              onClick={() => router.push("/products/product-categori")}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="px-8 py-2.5 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}