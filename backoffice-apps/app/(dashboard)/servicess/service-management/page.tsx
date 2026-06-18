/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { searchServices, deleteService } from "@/lib/servis-management";
import { exportServicesToPDF, ServiceExportData } from "@/utils/reportExport";
import { CompanyData, getCompanyProfile } from "@/lib/auth";

// Sesuaikan interface dengan struktur data asli dari API
interface ServiceItem {
  category: any;
  id: number;
  name: string;
  code: string;
  price: number;
  discount?: number;
  photo?: string | null;
  service_category?: {
    id: number;
    name: string;
  } | null;
}

export default function ServiceManagementPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);

  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Sekarang kita tidak mengirim company_id lagi di sini
      // Karena lib/servis-management.ts sudah menghandelnya via token
      const response = await searchServices({
        page: currentPage,
        size: 6,
        search: searchTerm,
      });

      if (response && response.data) {
        setServices(response.data);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchServices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const fetchCompany = async () => {
      const companyData = await getCompanyProfile();
      setCompany(companyData);
    };

    fetchCompany();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ visible: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
  };

  const confirmDelete = async () => {
    if (serviceToDelete === null) return;

    try {
      // Memanggil fungsi delete dari lib yang sudah diperbaiki
      const success = await deleteService(serviceToDelete);
      if (success) {
        showToast("success", "Layanan berhasil dihapus.");
        // Jika hapus data terakhir di sebuah halaman, kembali ke halaman sebelumnya
        if (services.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchServices();
        }
      } else {
        showToast("error", "Gagal menghapus layanan.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan saat menghapus.");
    } finally {
      setServiceToDelete(null);
    }
  };

  const getFinalPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  const getServicePhoto = (photo?: string | null) =>
    photo || "https://is3.cloudhost.id/vras/shoescare/services/no_img.png";

  // Fetch all services for export (without pagination)
  const fetchAllServicesForExport = async (): Promise<ServiceExportData[]> => {
    try {
      const response = await searchServices({
        page: 1,
        size: 1000, // Get all services
        search: searchTerm,
      });
      return response?.data || [];
    } catch (error) {
      console.error("Fetch Error:", error);
      return [];
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const allServices = await fetchAllServicesForExport();
      await exportServicesToPDF(allServices, company);
      showToast("success", "PDF berhasil diekspor.");
    } catch (error) {
      console.error("Export Error:", error);
      showToast("error", "Gagal mengekspor PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="p-6 bg-[#F9FAFB] min-h-screen relative"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 z-100 flex items-center justify-between min-w-[320px] px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4 transition-all ${
            toast.type === "success"
              ? "bg-[#E2F7E3] text-[#218F3B] border border-green-200"
              : "bg-[#FDECEC] text-[#D32F2F] border border-red-200"
          }`}
        >
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="ml-4 hover:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Modal Delete */}
      {serviceToDelete !== null && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Hapus Layanan
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Apakah Anda yakin? Tindakan ini akan menghapus layanan ini
              secara permanen dari sistem.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filter */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kode..."
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset ke hal 1 saat cari
              }}
            />
            <Search
              className="absolute right-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition shadow-sm disabled:opacity-70"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{isExporting ? "Mengekspor..." : "Ekspor PDF"}</span>
            </button>
            <button
              onClick={() =>
                router.push("/servicess/service-management/add-management")
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2E72] hover:bg-[#132255] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-900/20"
            >
              <Plus size={16} />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2E72]"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Search className="h-12 w-12 text-gray-200 mb-4" />
            <p className="font-medium text-gray-400">Tidak ada layanan yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {services.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-5 transition-all hover:border-blue-200 hover:shadow-lg"
              >
                <div className="relative w-full sm:w-40 h-40 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <img
                    src={getServicePhoto(item.photo)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-blue-600 shadow-sm border border-blue-50">
                    {item.code}
                  </div>
                </div>

                <div className="flex flex-col flex-1 py-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="text-[#1A2E72] font-bold text-lg">
                    Rp{" "}
                    {getFinalPrice(item.price, item.discount).toLocaleString(
                      "id-ID",
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 h-5">
                    {item.discount && item.discount > 0 ? (
                      <>
                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-[10px] font-black border border-red-100">
                          -{item.discount}%
                        </span>
                        <span className="text-gray-400 line-through text-xs font-medium">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <span className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1 rounded-lg font-bold border border-blue-100 uppercase tracking-wider">
                      {item.category?.name || "Uncategorized"}
                    </span>
                  </div>

                  <div className="flex-1 min-h-4"></div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/servicess/service-management/detail-management/${item.id}`,
                        )
                      }
                      className="flex-1 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && services.length > 0 && (
          <div className="flex items-center justify-end mt-10 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-20 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="text-blue-600">{currentPage}</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">{totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-20 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
