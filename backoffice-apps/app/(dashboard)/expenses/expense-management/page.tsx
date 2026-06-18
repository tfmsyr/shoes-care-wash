"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Plus,
  Paperclip,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

// Import fungsi dari library
import {
  getExpenses,
  deleteExpense,
  Expense,
} from "@/lib/expense-management";
import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { exportExpensesToPDF } from "@/utils/reportExport";

export default function ExpenseManagementPage() {
  const router = useRouter();

  // === STATES ===
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // States untuk Hapus Data & Notifikasi
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // === STATE BARU UNTUK PREVIEW GAMBAR ===
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // === FUNGSI LOAD DATA ===
  const loadData = useCallback(async (query: string = "") => {
    setIsLoading(true);
    try {
      console.log("Fetching data with query:", query);
      const data = await getExpenses(query);
      console.log("Data received in Page.tsx:", data);

      setExpenses(data || []);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      showToast("error", "Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect 1: Load data pertama kali saat halaman dibuka
  useEffect(() => {
    loadData("");
  }, [loadData]);

  useEffect(() => {
    const loadCompany = async () => {
      const companyData = await getCompanyProfile();
      setCompany(companyData);
    };

    loadCompany();
  }, []);

  // Effect 2: Handle Search dengan Debounce
  useEffect(() => {
    if (searchQuery === "") return;

    const delayDebounceFn = setTimeout(() => {
      loadData(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadData]);

  // === FUNGSI EXPORT ===
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExpensesToPDF(expenses, company);
      showToast("success", "PDF berhasil diekspor.");
    } catch (error) {
      showToast("error", "Terjadi kesalahan saat mengekspor.");
    } finally {
      setIsExporting(false);
    }
  };

  // === FUNGSI DELETE ===
  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    const success = await deleteExpense(toDelete.id);
    if (success) {
      showToast("success", "Pengeluaran berhasil dihapus.");
      setShowDelete(false);
      setToDelete(null);
      loadData(searchQuery);
    } else {
      showToast("error", "Gagal menghapus pengeluaran.");
    }
    setIsDeleting(false);
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      3000,
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-6 md:p-10 w-full grow">
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

      {/* === HEADER ACTIONS === */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === "") loadData("");
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-black bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition shadow-sm disabled:opacity-70"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Mengekspor..." : "Ekspor PDF"}
          </button>
          <button
            onClick={() =>
              router.push("/expenses/expense-management/add-ex-management")
            }
            className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg shadow-md hover:bg-blue-800 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Baru
          </button>
        </div>
      </div>

      {/* === MAIN CONTAINER === */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Expense List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Memuat data pengeluaran...</p>
            </div>
          ) : expenses.length > 0 ? (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    {expense.date ||
                      (expense.created_at
                        ? new Date(expense.created_at).toLocaleDateString(
                            "id-ID",
                          )
                        : "-")}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        router.push(
                          `/expenses/expense-management/edit-ex-management?id=${expense.id}`,
                        )
                      }
                      className="text-orange-500 hover:text-orange-700 transition p-1"
                        title="Ubah"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setToDelete(expense);
                        setShowDelete(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition p-1"
                        title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center px-5 py-4 bg-white text-sm">
                  <div className="text-gray-900 font-bold">
                    {expense.name}
                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                      {expense.code || `#EXP-${expense.id}`}
                    </div>
                  </div>
                  <div
                    className="text-gray-600 truncate pr-2"
                    title={expense.description}
                  >
                    {expense.description || "-"}
                  </div>
                  <div className="text-[#1e3a8a] font-bold text-base">
                    Rp {Number(expense.amount).toLocaleString("id-ID")}
                  </div>

                  {/* === BAGIAN GAMBAR / FOTO THUMBNAIL === */}
                  <div className="flex items-center">
                    {expense.proof ? (
                      <div
                        onClick={() => setPreviewImage(expense.proof || null)}
                        className="w-14 h-14 rounded-md border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shadow-sm"
                        title="Klik untuk memperbesar gambar"
                      >
                        <img
                          src={expense.proof}
                          alt="Thumbnail Bukti"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 italic">
                        <Paperclip size={14} />
                          <span className="text-xs">Tidak ada file</span>
                      </div>
                    )}
                  </div>
                  {/* ========================================= */}

                  <div className="flex md:justify-end">
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">
                      {expense.category?.name || "General"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-xl">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <AlertCircle size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada pengeluaran yang ditemukan.</p>
              <p className="text-gray-400 text-sm">
                Coba ubah pencarian atau tambahkan data baru.
              </p>
            </div>
          )}
        </div>

        {/* === PAGINATION (Static) === */}
        <div className="flex justify-end items-center mt-8 gap-3">
          <button className="p-1.5 border border-gray-200 text-gray-400 rounded-md hover:bg-gray-50 transition cursor-not-allowed">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 flex items-center justify-center bg-[#1e3a8a] text-white rounded-md font-bold shadow-sm">
              1
            </div>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">1</span>
          </div>
          <button className="p-1.5 border border-gray-200 text-gray-400 rounded-md hover:bg-gray-50 transition cursor-not-allowed">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* === MODAL PREVIEW GAMBAR (POPUP) === */}
      {previewImage && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)} // Menutup modal jika area gelap diklik
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center p-2">
            {/* Tombol Close */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Mencegah klik tembus ke div parent
                setPreviewImage(null);
              }}
              className="absolute -top-12 right-0 md:-top-4 md:-right-12 bg-white text-gray-900 rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors z-10"
              title="Tutup"
            >
              <X size={24} />
            </button>

            {/* Gambar Original */}
            <img
              src={previewImage}
              alt="Receipt Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Supaya tidak tertutup saat gambarnya sendiri yang diklik
            />
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      {showDelete && toDelete && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hapus Pengeluaran
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-bold text-gray-900">"{toDelete.name}"</span>
              ? Tindakan ini akan menghapus data secara permanen dari sistem.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
