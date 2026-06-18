"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Trash2,
  Search,
  Download,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
// Import fungsi dan interface dari lib yang sudah diperbarui
import { getCustomers, deleteCustomer, Customer } from "@/lib/customer";
import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { exportCustomersToPDF } from "@/utils/reportExport";

export default function CustomersListPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State untuk Notifikasi
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  // Fungsi untuk menampilkan notif
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- MENGAMBIL DATA DARI API ---
  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Belum ada data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadCompany = async () => {
      const companyData = await getCompanyProfile();
      setCompany(companyData);
    };

    loadCompany();
  }, []);

  // --- MENGHAPUS DATA VIA API ---
  async function handleDeleteConfirm() {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteCustomer(toDelete.id);
      if (success) {
        showToast("success", "Pelanggan berhasil dihapus.");
        setShowDelete(false);
        setToDelete(null);
        loadData(); // Tarik ulang data terbaru
      } else {
        showToast("error", "Gagal menghapus pelanggan. Silakan coba lagi.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan pada server.");
    } finally {
      setIsDeleting(false);
    }
  }

  // --- FITUR PENCARIAN (SEARCH) ---
  const filtered = customers.filter(
    (c) =>
      (c.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (c.phone || "").includes(query) ||
      (c.address?.toLowerCase() || "").includes(query.toLowerCase()),
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCustomersToPDF(filtered, company);
      showToast("success", "PDF berhasil diekspor.");
    } catch (error) {
      console.error("Customer export PDF error:", error);
      showToast("error", "Gagal mengekspor PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans relative">
      {/* --- RENDER NOTIFIKASI (Floating Toast) --- */}
      {notification.show && (
        <div
          className={`fixed top-24 right-10 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm z-50 animate-in fade-in slide-in-from-top-5 duration-300 ${
            notification.type === "success"
              ? "bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div
            className="contents"
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification((prev) => ({ ...prev, show: false }))} className="hover:opacity-60">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              placeholder="Cari berdasarkan nama, no HP, atau alamat"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleExportPDF}
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
            <Link href="/customers/add-customer" className="flex-1 md:flex-none">
              <button className="w-full inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg shadow-md hover:bg-blue-800 text-sm">
                <Plus className="w-4 h-4" /> Tambah Baru
              </button>
            </Link>
          </div>
        </div>

        {/* --- TABLE DATA --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600 font-semibold">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">No HP</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Menyinkronkan data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-20 text-center text-gray-400 italic"
                    >
                      Tidak ada pelanggan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id.toString()}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {c.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.address || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            onClick={() =>
                              router.push(`/customers/detail-customer?id=${c.id}`)
                            }
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            title="Lihat Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setToDelete(c);
                              setShowDelete(true);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- DELETE MODAL --- */}
      {showDelete && toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Hapus Pelanggan
            </h3>
            <p className="text-gray-600 mb-8">
              Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-6 py-2.5 rounded-lg bg-gray-500 text-white font-medium text-sm"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-lg bg-[#FF4D4F] text-white font-medium text-sm"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  "Menghapus..."
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
