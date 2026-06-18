"use client";

import React, { useEffect, useState } from "react";
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

import { productOrderApi, ProductOrder } from "@/lib/product-order";
import StatusToast from "@/components/ui/StatusToast";
import { popFlashToast } from "@/lib/flash-toast";

interface OrderRow {
  id: number;
  orderNumber: string;
  customer: string;
  phone: string;
  productSummary: string;
  total: string;
  status: string;
  rawStatus: string;
}

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

  if (normalizedStatus.includes("completed")) {
    return "bg-green-100/80 text-green-600";
  }
  if (normalizedStatus.includes("progress") || normalizedStatus.includes("processing")) {
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

const formatRupiah = (number: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

export default function ProductOrderPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

        const responseData = await productOrderApi.getAll();
        const rawArray = Array.isArray(responseData)
          ? responseData
          : (responseData as any)?.data || [];

        const formattedData: OrderRow[] = rawArray.map((item: ProductOrder) => {
          const products =
            item.items?.map((detail) => detail.product?.name).filter(Boolean) || [];

          return {
            id: Number(item.id),
            orderNumber: item.order_number || "-",
            customer: item.customer_name || "Tanpa Nama",
            phone: item.whatsapp_number || "",
            productSummary: products.length > 0 ? products.join(", ") : "-",
            total: formatRupiah(Number(item.total_amount) || 0),
            status: formatStatusText(item.status || ""),
            rawStatus: item.status || "",
          };
        });

        setOrders(formattedData);
      } catch (err: any) {
        console.error("Gagal load product order:", err);
        setError(err.response?.data?.message || err.message || "Gagal mengambil data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      order.customer.toLowerCase().includes(normalizedSearch) ||
      order.orderNumber.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      selectedStatus === "Semua Status" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statuses = ["Semua Status", "Selesai", "Diproses", "Diterima", "Dibatalkan"];

  return (
    <div
      className="p-6 md:p-8 bg-gray-50/50 min-h-screen font-sans w-full transition-all duration-300"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      <StatusToast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 w-full">
        <div className="relative w-full md:w-1/3 flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E2B5F]/20 text-sm bg-white shadow-sm transition-all"
          />
          <Search className="absolute right-4 top-3.5 text-gray-400" size={18} />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 min-w-35 px-5 py-3 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
            >
              {selectedStatus}
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors ${
                      selectedStatus === status ? "text-[#1E2B5F] bg-blue-50/50" : "text-gray-500"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/products-order/add-product" className="w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E2B5F] text-white rounded-xl text-sm font-semibold hover:bg-[#15204d] shadow-md w-full whitespace-nowrap transition-all">
              <Plus size={18} strokeWidth={2.5} /> Tambah Baru
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-225">
            <thead>
              <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                <th className="px-6 py-2">No. Pesanan</th>
                <th className="px-6 py-2">Nama Pelanggan</th>
                <th className="px-6 py-2">Nama Produk</th>
                <th className="px-6 py-2">Total</th>
                <th className="px-6 py-2 text-center">Status</th>
                <th className="px-6 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-gray-400 font-medium">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((row) => (
                  <tr key={row.id} className="group transition-all">
                    <td className="px-6 py-5 border-y border-l border-gray-100 rounded-l-2xl bg-white text-sm font-medium text-gray-600">
                      {row.orderNumber}
                    </td>
                    <td className="px-6 py-5 border-y border-gray-100 bg-white text-sm font-bold text-gray-900">
                      {row.customer}
                    </td>
                    <td className="px-6 py-5 border-y border-gray-100 bg-white text-sm text-gray-500 font-medium">
                      {row.productSummary}
                    </td>
                    <td className="px-6 py-5 border-y border-gray-100 bg-white text-sm font-extrabold text-[#1E2B5F]">
                      {row.total}
                    </td>
                    <td className="px-6 py-5 border-y border-gray-100 bg-white text-center">
                      <span
                        className={`inline-block px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-tight ${getStatusStyles(
                          row.rawStatus
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-y border-r border-gray-100 rounded-r-2xl bg-white">
                      <div className="flex items-center justify-center gap-4">
                        <Link
                          href={`/products-order/invoice?id=${row.id}&name=${encodeURIComponent(
                            row.customer
                          )}&phone=${row.phone}`}
                          className="text-blue-500 hover:scale-110 transition-transform p-1"
                        >
                          <Printer size={18} />
                        </Link>
                        <Link
                          href={`/products-order/edit-product?id=${row.id}`}
                          className="text-amber-500 hover:scale-110 transition-transform p-1"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          className="text-red-500 hover:scale-110 transition-transform p-1"
                          onClick={async () => {
                            if (!confirm("Yakin hapus order ini?")) return;

                            try {
                              await productOrderApi.delete(row.id);
                              setOrders((prev) => prev.filter((item) => item.id !== row.id));
                              setToast({
                                type: "success",
                                text: `Pesanan produk #${row.orderNumber} berhasil dihapus.`,
                              });
                            } catch (deleteError: any) {
                              setToast({
                                type: "error",
                                text:
                                  deleteError?.response?.data?.message ||
                                  deleteError?.message ||
                                  "Gagal menghapus pesanan produk.",
                              });
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-gray-400 font-medium">
                    Tidak ada pesanan dengan status "{selectedStatus}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end items-center mt-6 gap-2">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1">
            <span className="w-8 h-8 flex items-center justify-center border border-[#1E2B5F] text-[#1E2B5F] rounded-lg text-sm font-bold shadow-sm">
              1
            </span>
            <span className="text-gray-400 text-sm px-2">/ 1</span>
          </div>
          <button className="p-2 border border-[#1E2B5F] rounded-lg text-[#1E2B5F] hover:bg-gray-50 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
