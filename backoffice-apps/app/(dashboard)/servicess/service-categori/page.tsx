"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
// Import fungsi API yang sudah dibuat
import {
  getServiceCategories,
  deleteServiceCategory,
} from "@/lib/service-category";

type Category = {
  id: string;
  name: string;
  description: string;
};

export default function ServiceCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // State untuk loading
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mengambil data dari API saat halaman pertama kali dimuat
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const data = await getServiceCategories();
    setCategories(data || []);
    setIsLoading(false);
  };

  // Fungsi untuk menghapus data via API
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const success = await deleteServiceCategory(deleteId);

    if (success) {
      // Jika berhasil di backend, hapus juga dari tampilan (state)
      const updated = categories.filter((c) => c.id !== deleteId);
      setCategories(updated);
    } else {
      alert("Gagal menghapus kategori. Silakan coba lagi.");
    }

    setDeleteId(null);
    setIsDeleting(false);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentData = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] p-8">
      <div className="w-full mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() =>
              router.push("/servicess/service-categori/add-service-category")
            }
            className="flex items-center gap-2 bg-[#1E2B5F] hover:bg-blue-900 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* LIST CARD */}
        <div className="w-full min-h-150 border border-gray-200 rounded-[10px] bg-white p-4 flex flex-col justify-between relative shadow-sm">
          <div className="space-y-4">
            {isLoading ? (
              // TAMPILAN SAAT LOADING
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>Loading categories...</p>
              </div>
            ) : currentData.length > 0 ? (
              // TAMPILAN JIKA ADA DATA
              currentData.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-gray-200 rounded-[10px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition"
                >
                  <div className="w-full md:w-[20%] font-bold text-gray-900">
                    {cat.name}
                  </div>
                  <div className="w-full md:flex-1 text-gray-600 text-sm">
                    {cat.description || "-"}
                  </div>
                  <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button
                      onClick={() =>
                        router.push(
                          `/servicess/service-categori/edit-service-category?id=${cat.id}`,
                        )
                      }
                      className="p-2 text-orange-400 border border-orange-200 rounded-lg hover:bg-orange-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // TAMPILAN JIKA DATA KOSONG
              <div className="text-center py-20 text-gray-500">
                No categories found.
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL DELETE */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 text-center">
              <h3 className="text-lg font-bold mb-2">Delete Category?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
