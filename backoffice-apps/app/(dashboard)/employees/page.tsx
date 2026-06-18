"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Import service yang baru kita buat
import { employeeService } from "@/lib/employe";
import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { exportEmployeesToPDF } from "@/utils/reportExport";

export default function EmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<any[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- FUNGSI AMBIL DATA (Jauh lebih ringkas) ---
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Menggunakan fungsi terpusat dari lib/employees.ts
      const response = await employeeService.getAllEmployees();

      // Mengambil data dari response (Laravel biasanya membungkus data dalam properti 'data')
      setEmployees(response?.data || []);
    } catch (error: any) {
      console.error("Gagal sinkronisasi:", error);
      showToast("error", "Gagal sinkronisasi data dengan server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    const checkSuccess = localStorage.getItem("showSuccessToast");
    if (checkSuccess === "true") {
      showToast("success", "Karyawan berhasil ditambahkan.");
      localStorage.removeItem("showSuccessToast");
    }
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      const companyData = await getCompanyProfile();
      setCompany(companyData);
    };

    fetchCompany();
  }, []);

  const confirmDelete = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);

      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setDeleteTarget(null);
      showToast("success", "Karyawan berhasil dihapus.");
    } catch (error) {
      showToast("error", "Gagal menghapus karyawan.");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return (
      (emp.name?.toLowerCase() || "").includes(q) ||
      (emp.email?.toLowerCase() || "").includes(q) ||
      (emp.nik || "").toLowerCase().includes(q)
    );
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportEmployeesToPDF(filteredEmployees, company);
      showToast("success", "PDF berhasil diekspor.");
    } catch (error) {
      console.error("Employee export PDF error:", error);
      showToast("error", "Gagal mengekspor PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans relative">
      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div
          className={`fixed top-24 right-10 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm z-50 animate-in fade-in slide-in-from-top-5 duration-300 ${
            toast.type === "success"
              ? "bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="hover:opacity-60">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* --- HEADER ACTIONS --- */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau NIK"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
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
            <button
              onClick={() => router.push("/employees/add-employee")}
              className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg shadow-md hover:bg-blue-800 text-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Baru
            </button>
          </div>
        </div>

        {/* --- TABLE DATA --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600 font-semibold">
                  <th className="px-6 py-4">Profil</th>
                  <th className="px-6 py-4">NIK</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Menyinkronkan data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center text-gray-400 italic"
                    >
                      Tidak ada karyawan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 relative">
                          <Image
                            src={emp.photo || "/avatar.png"}
                            alt="Profile"
                            fill
                            className="rounded-full object-cover border border-gray-200"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {emp.nik || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {emp.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/employees/detail-employee?id=${emp.id}`,
                              )
                            }
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/employees/edit-employee?id=${emp.id}`,
                              )
                            }
                            className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(emp.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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

      {/* --- MODAL DELETE --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Hapus Karyawan
            </h3>
            <p className="text-gray-600 mb-8">
              Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-2.5 rounded-lg bg-gray-500 text-white font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => confirmDelete(deleteTarget)}
                className="px-6 py-2.5 rounded-lg bg-[#FF4D4F] text-white font-medium text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
