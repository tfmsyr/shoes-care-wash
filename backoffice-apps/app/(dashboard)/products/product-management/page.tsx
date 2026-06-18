"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts, deleteProduct } from "@/lib/product-management";
import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { exportProductsToPDF } from "@/utils/reportExport";
import StatusToast from "@/components/ui/StatusToast";
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const DownloadIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const ChevronLeft = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
const ChevronRight = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5l7 7-7 7"
    />
  </svg>
);
export default function ProductManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Menyesuaikan grid agar pas 4 kolom (12 item per halaman)
  const PER_PAGE = 12;
  const lowStockOnly = searchParams.get("lowStock") === "1";

  // --- 1. GET DATA (Sudah pakai getProducts dari lib) ---
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();

      if (data) {
        setProducts(data);
      } else {
        showToast("error", "Gagal mengambil data dari server");
      }
    } catch (error) {
      console.error("Load Error:", error);
      showToast("error", "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const loadCompany = async () => {
      const companyData = await getCompanyProfile();
      setCompany(companyData);
    };

    loadCompany();
  }, []);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  // --- 2. DELETE DATA (Sudah pakai deleteProduct dari lib) ---
  async function doDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget);

      setProducts(
        products.filter((p) => String(p.id) !== String(deleteTarget)),
      );
      setDeleteTarget(null);
      showToast("success", "Produk berhasil dihapus.");
    } catch (error: any) {
      console.error("Delete Error:", error);
      const msg =
        error.response?.data?.message ||
        "Gagal menghapus produk. Silakan coba lagi.";
      showToast("error", msg);
    } finally {
      setIsDeleting(false);
    }
  }

  // --- 3. FILTERING PENCARIAN ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q);

      const matchesLowStock = !lowStockOnly || Number(p.stock || 0) <= 5;

      return matchesSearch && matchesLowStock;
    });
  }, [products, query, lowStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportProductsToPDF(filtered, company);
      showToast("success", "PDF berhasil diekspor.");
    } catch (error) {
      console.error("Product export PDF error:", error);
      showToast("error", "Gagal mengekspor PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      <StatusToast toast={toast} onClose={() => setToast(null)} />

      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Name or Code"
            className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </div>
        </div>

        {lowStockOnly && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-sm shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Menampilkan produk dengan stok menipis</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/products/product-management")}
              className="ml-auto px-3 py-1 rounded-lg bg-white border border-amber-200 text-amber-700 font-medium hover:bg-amber-100 transition-colors"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition shadow-sm disabled:opacity-70"
          >
            <DownloadIcon /> {isExporting ? "Mengekspor..." : "Ekspor PDF"}
          </button>
          <button
            onClick={() =>
              router.push("/products/product-management/add-product-management")
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition shadow-sm"
          >
            <PlusIcon /> Tambah Baru
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-150 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">
              Memuat data produk...
            </p>
          </div>
        ) : visible.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {visible.map((p) => {
              const price = p.selling_price || p.price || 0;
              const discount = p.discount || 0;
              const discountedPrice =
                discount > 0
                  ? Math.round((price * (100 - discount)) / 100)
                  : price;

              return (
                <div
                  key={p.id}
                  className="group flex flex-row items-center border border-gray-200 rounded-2xl p-3 bg-white hover:shadow-md transition-all duration-300"
                >
                  {/* Image & Code Badge */}
                  <div className="relative w-28 h-28 bg-[#f5f5f5] rounded-xl shrink-0 flex items-center justify-center p-2 mr-4">
                    <img
                      src={
                        p.photo || "https://placehold.co/400x400?text=No+Image"
                      }
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    <div className="absolute -bottom-2 -left-2 bg-white text-[#4285F4] border border-gray-100 shadow-sm text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap z-10">
                      {p.code || "N/A"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-1 h-full">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-1 pr-2">
                          {p.name}
                        </h3>
                        <span className="text-[10px] text-blue-500 font-medium">
                          {p.category?.name || "Cleaning"}
                        </span>
                      </div>

                      <div className="mt-1">
                        <p className="text-[15px] font-bold text-gray-900">
                          Rp {discountedPrice.toLocaleString("id-ID")}
                        </p>
                        {discount > 0 ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-red-500 font-bold">
                              {discount}%
                            </span>
                            <span className="text-[11px] text-gray-400 line-through">
                              Rp {price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : (
                          // Placeholder agar tinggi sama jika tidak ada diskon
                          <div className="h-4.5"></div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                        {p.stock} Stocks Left
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/products/product-management/edit-product-management/${p.id}`,
                          );
                        }}
                        className="flex-1 py-1 text-[11px] font-medium border border-gray-200 rounded text-blue-500 hover:bg-gray-50 transition"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(p.id);
                        }}
                        className="flex-1 py-1 text-[11px] font-medium border border-gray-200 rounded text-red-500 hover:bg-red-50 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p>Tidak ada produk yang ditemukan.</p>
          </div>
        )}

        {/* --- PAGINATION --- */}
        <div className="mt-auto flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center border border-blue-800 rounded text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition"
          >
            <ChevronLeft />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-800 font-semibold">{page}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-8 h-8 flex items-center justify-center border border-blue-800 rounded text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* --- DELETE MODAL --- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Hapus Produk?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Aksi ini tidak dapat dibatalkan. Data akan dihapus secara permanen
              .
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={doDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
