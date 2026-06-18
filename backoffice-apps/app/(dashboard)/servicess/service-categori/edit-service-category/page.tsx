"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  getServiceCategoryById,
  updateServiceCategory,
} from "@/lib/service-category";

export default function EditServiceCategoryPage() {
  const router = useRouter();

  // Menggunakan useSearchParams untuk menangkap ?id= dari URL
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true); // Loading saat ambil data awal
  const [isSaving, setIsSaving] = useState(false); // Loading saat simpan data
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss alert
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  // Fetch data lama saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchExistingData = async () => {
      // Cegah fetch jika URL tidak memiliki ID
      if (!categoryId) {
        setAlert({ type: "error", message: "Category ID is missing in URL." });
        setIsLoading(false);
        return;
      }

      try {
        const data = await getServiceCategoryById(categoryId);
        if (data) {
          setName(data.name);
          setDescription(data.description || "");
        } else {
          setAlert({ type: "error", message: "Category not found." });
        }
      } catch (error) {
        setAlert({ type: "error", message: "Failed to load category data." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [categoryId]);

  // Update Data ke API
  const handleSave = async () => {
    if (!name.trim()) {
      setAlert({ type: "error", message: "Category Name is required." });
      return;
    }

    if (!categoryId) return; // Mencegah proses jalan kalau ID kosong

    setIsSaving(true);
    setAlert(null);

    try {
      // Memanggil API Update Backend
      const success = await updateServiceCategory(categoryId, {
        name: name.trim(),
        description: description.trim(),
      });

      if (success) {
        setAlert({
          type: "success",
          message: "Category updated successfully!",
        });

        setTimeout(() => {
          router.push("/servicess/service-categori");
          router.refresh();
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: "Failed to update category. Please try again.",
        });
        setIsSaving(false);
      }
    } catch (error) {
      setAlert({ type: "error", message: "An error occurred while updating." });
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] p-8 flex flex-col transition-all duration-300 ease-in-out relative">
      {/* Toast Notification Mengambang */}
      {alert && (
        <div
          className={`fixed top-8 right-8 z-100 min-w-75 shadow-lg rounded-lg px-5 py-4 text-[15px] font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-4 ${
            alert.type === "success"
              ? "bg-[#E6F6EC] text-[#2A7E4B]"
              : "bg-[#FDF0F0] text-[#8C3A3A]"
          }`}
        >
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            className="focus:outline-none hover:opacity-70 transition-opacity ml-4"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className="w-full bg-white border border-gray-200 rounded-xl p-8 flex flex-col shadow-sm relative">
        {/* Judul Berubah menjadi Edit */}
        <h2 className="text-[18px] font-bold text-gray-900 mb-8">
          Edit Service Category
        </h2>

        {isLoading ? (
          // Loading State saat mengambil data lama
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-500 text-sm">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Form Inputs */}
            <div className="space-y-6">
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  disabled={isSaving}
                  placeholder="Enter service category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400 disabled:bg-gray-50"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={6}
                  disabled={isSaving}
                  placeholder="Enter service category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400 resize-none disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-10 pt-4">
              <button
                onClick={() => router.push("/servicess/service-categori")}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Updating..." : "Update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
