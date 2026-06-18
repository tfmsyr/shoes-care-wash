"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Printer,
  Edit,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { serviceOrderApi } from "@/lib/service-order";
import StatusToast from "@/components/ui/StatusToast";
import { popFlashToast } from "@/lib/flash-toast";

// --- Types ---
interface Order {
  id: number; // Harus ID angka untuk API
  orderNumber: string; // Simpan string nomor order untuk tampilan
  customer: string;
  serviceSummary: string;
  itemCount: number;
  total: string | number;
  status: string;
  rawStatus: string;
}

interface ServiceDetailLike {
  price?: number | string;
  qty?: number | string;
  quantity?: number | string;
  subtotal?: number | string;
  service?: {
    name?: string;
  };
  service_name?: string;
  name?: string;
}

// --- Helpers ---
const formatStatusText = (status: string) => {
  if (!status) return "Menunggu";
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes("completed") || normalizedStatus.includes("done")) {
    return "Selesai";
  }
  if (normalizedStatus.includes("progress") || normalizedStatus.includes("processing")) {
    return "Diproses";
  }
  if (normalizedStatus.includes("received")) {
    return "Diterima";
  }
  if (normalizedStatus.includes("cancel")) {
    return "Dibatalkan";
  }
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  if (
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("done")
  ) {
    return "bg-green-100/80 text-green-600";
  }
  if (normalizedStatus.includes("progress")) {
    return "bg-yellow-100/80 text-yellow-600";
  }
  if (normalizedStatus.includes("received")) {
    return "bg-blue-100/80 text-blue-600";
  }
  if (normalizedStatus.includes("cancel")) {
    return "bg-red-100/80 text-red-600";
  }
  return "bg-gray-100 text-gray-600";
};

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const getOrderDetails = (item: any): ServiceDetailLike[] => {
  if (Array.isArray(item.details)) return item.details;
  if (Array.isArray(item.items)) return item.items;
  if (Array.isArray(item.services)) return item.services;
  return [];
};

const getServiceName = (detail: ServiceDetailLike) =>
  detail.service?.name || detail.service_name || detail.name || "Layanan";

export default function ServiceOrderPage() {
  const [tableData, setTableData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const flashToast = popFlashToast();
    if (flashToast) {
      setToast(flashToast);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const responseData: any = await serviceOrderApi.getAll();
        const rawArray = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        const formattedData: Order[] = rawArray.map((item: any) => {
          const details = getOrderDetails(item);
          let subtotal = 0;
          let serviceNames: string[] = [];

          details.forEach((detail: ServiceDetailLike) => {
            const price = Number(detail.price) || 0;
            const quantity = Number(detail.quantity ?? detail.qty) || 1;
            const lineSubtotal = Number(detail.subtotal) || price * quantity;
            subtotal += lineSubtotal;

            const name = getServiceName(detail);
            serviceNames.push(name);
          });

          const discountPercent = Number(item.discount) || 0;
          const discountAmount = (subtotal * discountPercent) / 100;
          const apiTotal =
            Number(item.total_amount ?? item.total ?? item.grand_total) || 0;
          const calculatedTotal =
            apiTotal > 0 ? apiTotal : subtotal - discountAmount;

          const summary =
            serviceNames.length > 0 ? serviceNames.join(", ") : "-";

          return {
            id: item.id, // KUNCI: Gunakan ID database (angka) untuk routing
            orderNumber: item.order_number || "-", // Gunakan string untuk tampilan
            customer: item.customer?.name || "Tanpa Nama",
            serviceSummary: summary,
            itemCount: details.length,
            total: formatRupiah(calculatedTotal),
            status: formatStatusText(item.status),
            rawStatus: item.status || "",
          };
        });

        setTableData(formattedData);
      } catch (err: any) {
        console.error("Gagal load data:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div
      className="p-6 md:p-8 bg-gray-50/50 min-h-screen font-sans w-full transition-all duration-300"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      <StatusToast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 w-full">
        <div className="relative w-full md:w-112.5 flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan"
            className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E2B5F]/20 focus:border-[#1E2B5F] text-sm bg-white shadow-sm transition-all text-gray-700"
          />
          <Search
            className="absolute right-4 top-3.5 text-gray-400"
            size={18}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="flex items-center justify-between gap-2 px-5 py-3 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all w-full md:w-auto min-w-32.5">
            Semua Status{" "}
            <ChevronDown
              size={16}
              className="text-gray-400"
              strokeWidth={2.5}
            />
          </button>

          <Link
            href="/service-order/add-service-order"
            className="w-full md:w-auto"
          >
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E2B5F] text-white rounded-xl text-sm font-semibold hover:bg-[#15204d] shadow-md hover:shadow-lg transition-all w-full whitespace-nowrap">
              <Plus size={18} strokeWidth={2.5} /> Tambah Baru
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-gray-100 w-full transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-225">
            <thead>
              <tr className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-2">No. Pesanan</th>
                <th className="px-6 py-2">Nama Pelanggan</th>
                <th className="px-6 py-2">Layanan (Item)</th>
                <th className="px-6 py-2">Total</th>
                <th className="px-6 py-2 text-center">Status</th>
                <th className="px-6 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#1E2B5F] border-t-transparent rounded-full animate-spin"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-red-500 font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 font-medium"
                  >
                    Belum ada data pesanan layanan.
                  </td>
                </tr>
              ) : (
                tableData.map((row, index) => (
                  <tr key={row.id || index} className="group">
                    <td className="px-6 py-4 border-y border-l border-gray-100 rounded-l-2xl bg-white group-hover:bg-gray-50/50 transition-colors text-sm font-medium text-gray-700">
                      {/* TAMPILAN: Pakai orderNumber string */}#
                      {row.orderNumber}
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors text-sm font-semibold text-gray-900">
                      {row.customer}
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col max-w-75">
                        <span className="text-sm font-semibold text-gray-800 wrap-break-word leading-relaxed">
                          {row.serviceSummary}
                        </span>
                        {row.itemCount > 0 && (
                          <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {row.itemCount} Item terpilih
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors text-sm font-bold text-[#1E2B5F]">
                      {row.total}
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors text-center">
                      <span
                        className={`inline-block px-4 py-1.5 text-[11px] font-bold rounded-full tracking-wide ${getStatusStyles(row.rawStatus)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-y border-r border-gray-100 rounded-r-2xl bg-white group-hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-center gap-4">
                        {/* AKSI: Link menggunakan row.id (ANGKA) */}
                        <Link href={`/service-order/invoice?id=${row.id}`}>
                          <button
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                            title="Lihat Invoice"
                          >
                            <Printer size={18} strokeWidth={2} />
                          </button>
                        </Link>

                        <Link href={`/service-order/edit-order?id=${row.id}`}>
                          <button
                            className="text-amber-500 hover:text-amber-600 transition-colors p-1"
                            title="Ubah Pesanan"
                          >
                            <Edit size={18} strokeWidth={2} />
                          </button>
                        </Link>

                        <button
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Hapus Pesanan"
                          onClick={async () => {
                            if (confirm("Yakin hapus order ini?")) {
                              try {
                                await serviceOrderApi.delete(row.id);
                                setTableData((prev) =>
                                  prev.filter((item) => item.id !== row.id),
                                );
                                setToast({
                                  type: "success",
                                  text: `Pesanan layanan #${row.orderNumber} berhasil dihapus.`,
                                });
                              } catch (e: any) {
                                setToast({
                                  type: "error",
                                  text:
                                    e?.response?.data?.message ||
                                    e?.message ||
                                    "Gagal menghapus pesanan layanan.",
                                });
                              }
                            }
                          }}
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end items-center mt-6 gap-3 pt-2">
          <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-400 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mx-1">
            <input
              type="text"
              value="1"
              readOnly
              className="w-9 h-9 flex items-center justify-center text-center border-2 border-[#1E2B5F] bg-white rounded-lg text-[#1E2B5F] font-bold outline-none shadow-sm"
            />
            <span className="text-gray-400">/ 1</span>
          </div>
          <button className="p-2 border-2 border-[#1E2B5F] rounded-lg bg-white hover:bg-gray-50 text-[#1E2B5F] transition-colors shadow-sm">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
