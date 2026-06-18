"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

// Import Fungsi API dan Tipe DataA
import {
  getProductCategories,
  deleteProductCategory,
  Category,
} from "@/lib/product-category";

export default function ProductCategoriesPage() {
  const router = useRouter();

  // === STATE ===
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === LOAD DATA DARI API ===
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProductCategories();
      // Data dummy dihilangkan, langsung menggunakan hasil API
      setCategories(data || []);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      showToast("error", "Failed to fetch categories from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === LOGIC FILTER & PAGINATION ===
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // === HANDLERS ===
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const success = await deleteProductCategory(deleteTarget);

    if (success) {
      showToast("success", "Category deleted successfully!");
      fetchData(); // Refresh data dari server
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      showToast("error", "Failed to delete category.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 md:p-8 font-sans text-gray-800 bg-gray-50/30 min-h-screen">
      {/* === HEADER CONTROLS === */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        <button
          onClick={() =>
            router.push("/products/product-categori/add-product-categori")
          }
          className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E2B5F] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[#151e42] transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add New
        </button>
      </div>

      {/* === MAIN CARD CONTAINER === */}
      <div className="w-full min-h-100 bg-white border border-gray-200 rounded-[10px] p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-500 text-sm">
                Synchronizing with server...
              </p>
            </div>
          ) : currentItems.length > 0 ? (
            currentItems.map((cat) => (
              <div
                key={cat.id}
                className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className="w-full md:w-1/4">
                  <h3 className="text-sm font-bold text-gray-900">
                    {cat.name}
                  </h3>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:ml-auto shrink-0 mt-2 md:mt-0">
                  <button
                    onClick={() =>
                      router.push(
                        `/products/product-categori/edit-product-categori?id=${cat.id}`,
                      )
                    }
                    className="p-2 rounded-lg border border-orange-200 text-orange-400 hover:text-white hover:bg-orange-400 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                No categories found in database
              </p>
            </div>
          )}
        </div>

        {/* === PAGINATION === */}
        {!loading && filteredCategories.length > itemsPerPage && (
          <div className="flex justify-end items-center gap-3 pt-8 mt-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-2 font-medium text-sm text-gray-600">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* === MODAL DELETE === */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete Category?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TOAST === */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white ${toast.type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-700"}`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
