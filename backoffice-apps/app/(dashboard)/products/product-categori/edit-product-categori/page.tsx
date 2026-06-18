"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2, X } from "lucide-react";
// Import fungsi API yang sudah kita update tadi
import { getCategoryById, updateProductCategory } from "@/lib/product-category";

function EditCategoryContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  // === STATE ===
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk mengatur notifikasi
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === LOAD DATA DETAIL ===
  useEffect(() => {
    if (!id) {
      setLoading(false); 
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getCategoryById(id);
        if (data) {
          setName(data.name);
          setDesc(data.description || "");
        }
      } catch (error) {
        console.error("Gagal mengambil detail kategori:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // === HANDLE SAVE (UPDATE) ===
  const handleSave = async () => {
    if (!id || !name.trim()) return; 

    setIsSaving(true);
    setNotification(null); // Reset notifikasi setiap kali tombol ditekan

    // Memanggil API update yang sudah menyertakan company_id di dalamnya
    const success = await updateProductCategory(id, {
      name: name,
      description: desc || "-"
    });

    if (success) {
      // Tampilkan notifikasi sukses
      setNotification({
        type: "success",
        message: "Category updated successfully!",
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
        message: "Failed to update category. Please try again.",
      });
      setIsSaving(false);
    }
  };

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/30">
        <div className="flex flex-col items-center gap-2">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
           <p className="text-gray-500 font-medium text-sm">Loading category data...</p>
        </div>
      </div>
    );
  }

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

      {/* MENGGUNAKAN w-full AGAR MENYEBAR PENUH */}
      <div className="w-full bg-white md:border md:border-gray-200 rounded-xl md:shadow-sm flex flex-col overflow-hidden">
        
        <div className="md:p-8 flex-1 flex flex-col">
          
          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900">
              Category Detail
            </h2>
          </div>

          {/* FORM */}
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

          {/* BUTTONS */}
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

// Wrapper Suspense wajib ada karena kita pakai useSearchParams
export default function EditCategoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <EditCategoryContent />
    </Suspense>
  );
}