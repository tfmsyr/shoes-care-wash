"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
// Import helper API yang sudah kita buat sebelumnya
import {
  getExpenseCategories,
  deleteExpenseCategory,
  ExpenseCategory,
} from "@/lib/expense-categori";

export default function ExpenseCategoriesPage() {
  const router = useRouter();

  // --- STATE ---
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Custom Modal Delete
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    id: string | number | null;
  }>({
    show: false,
    id: null,
  });

  // State untuk Notifikasi (Toast)
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // --- LOAD DATA ---
  const loadData = async (query: string = "") => {
    setIsLoading(true);
    const data = await getExpenseCategories(query);
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    // Debounce search: Tunggu user selesai mengetik (500ms) sebelum hit API
    const delayDebounceFn = setTimeout(() => {
      loadData(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- FUNGSI HELPER NOTIFIKASI ---
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000); // Hilang otomatis setelah 3 detik
  };

  // --- HANDLE DELETE ---
  // 1. Buka Modal
  const triggerDelete = (id: string | number) => {
    setDeleteModal({ show: true, id });
  };

  // 2. Eksekusi Hapus dari Modal
  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    const success = await deleteExpenseCategory(deleteModal.id);

    if (success) {
      showToast("success", "Category deleted successfully!");
      loadData(searchQuery); // Refresh data
    } else {
      showToast("error", "Failed to delete category. Please try again.");
    }

    setIsDeleting(false);
    setDeleteModal({ show: false, id: null });
  };

  // 3. Batal Hapus
  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null });
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-8">
      {/* === TOAST NOTIFICATION === */}
      {notification.show && (
        <div className="fixed top-8 right-8 z-100 animate-in fade-in slide-in-from-right-4 duration-300">
          <div
            className={`flex items-center justify-between gap-4 px-5 py-3 rounded-md shadow-sm border min-w-75 ${
              notification.type === "success"
                ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]"
                : "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]"
            }`}
          >
            <span className="font-medium text-sm">{notification.message}</span>
            <button
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* === CUSTOM DELETE MODAL === */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Delete Category
            </h3>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this category? This action cannot
              be undone and will permanently remove the category from the
              system.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center justify-center min-w-25 gap-2 px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:bg-red-400"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* === HEADER: SEARCH & ADD BUTTON === */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-gray-700 shadow-sm"
            />
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() =>
              router.push("/expenses/expense-categori/add-ex-categori/")
            }
            className="flex items-center gap-2 bg-[#1E3A8A] shrink-0 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 font-medium text-sm transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add New
          </button>
        </div>

        {/* === MAIN LAYOUT === */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm w-full">
          <div className="space-y-4">
            {isLoading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Memuat data...</p>
              </div>
            ) : categories.length > 0 ? (
              // List Data Real
              categories.map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center w-full">
                    <div className="w-1/4 min-w-50 font-bold text-gray-800 text-sm capitalize">
                      {x.name}
                    </div>
                    <div className="flex-1 text-gray-600 text-sm pr-4 italic">
                      {x.description || "Tidak ada deskripsi."}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 pl-4 shrink-0">
                    <button
                      onClick={() =>
                        router.push(
                          `/expenses/expense-categori/edit-ex-categori?id=${x.id}`,
                        )
                      }
                      className="text-orange-400 hover:text-orange-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => triggerDelete(x.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="text-center py-20 text-gray-500">
                Data kategori tidak ditemukan.
              </div>
            )}
          </div>

          {/* === PAGINATION === */}
          {!isLoading && categories.length > 0 && (
            <div className="flex justify-end items-center gap-3 mt-8 text-sm font-medium text-gray-600">
              <button className="p-2 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed">
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button className="px-3.5 py-1.5 border border-[#1E3A8A] text-[#1E3A8A] rounded-md bg-blue-50/50">
                1
              </button>
              <button className="p-2 border border-[#1E3A8A] rounded-md text-[#1E3A8A] hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
