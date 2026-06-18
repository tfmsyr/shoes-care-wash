"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, FileText, Share2, X, Loader2 } from "lucide-react";
import { productOrderApi, ProductOrder } from "@/lib/product-order";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const normalizePhoneToWhatsApp = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("0")) return `62${cleaned.slice(1)}`;
  if (cleaned.startsWith("62")) return cleaned;
  return cleaned;
};

export default function InvoiceOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get("id") || "";
  const [orderData, setOrderData] = useState<ProductOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productOrderApi.getById(orderId);
        setOrderData(response);
      } catch (error) {
        console.error("Gagal memuat invoice product order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!orderData?.whatsapp_number) {
      window.alert("Nomor WhatsApp tidak tersedia untuk pelanggan ini.");
      return;
    }

    const cleanPhone = normalizePhoneToWhatsApp(orderData.whatsapp_number);
    if (!cleanPhone) {
      window.alert("Nomor WhatsApp pelanggan tidak valid.");
      return;
    }

    const itemLines =
      orderData.items?.map((item) => {
        const itemName = item.product?.name || `Produk #${item.product_id}`;
        return `- ${itemName} x${item.qty} (${formatRupiah(item.subtotal)})`;
      }) || [];

    const message = [
      `Halo ${orderData.customer_name || "Customer"},`,
      "",
      "Terima kasih sudah berbelanja bersama kami. Berikut detail invoice pesanan Anda:",
      "",
      "*INVOICE PEMBELIAN*",
      `No. Order: *${orderData.order_number}*`,
      "",
      "*Detail Produk*",
      ...itemLines,
      "",
      ...(Number(orderData.discount_amount || 0) > 0
        ? [`*Diskon: ${formatRupiah(Number(orderData.discount_amount) || 0)}*`, ""]
        : []),
      `*Total Pembayaran: ${formatRupiah(Number(orderData.total_amount) || 0)}*`,
      "",
      "Jika ada pertanyaan terkait pesanan ini, silakan balas pesan ini.",
      "",
      "Terima kasih.",
    ].join("\n");

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
      >
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-10 shadow-xl">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-sm font-medium text-gray-500">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
      >
        <div className="rounded-3xl bg-white px-8 py-10 shadow-xl text-center">
          <p className="text-base font-semibold text-gray-800">
            Data invoice tidak ditemukan.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const invoiceData = {
    orderNumber: orderData.order_number || orderId,
    date: orderData.created_at
      ? new Date(orderData.created_at).toLocaleDateString("id-ID")
      : new Date().toLocaleDateString("id-ID"),
    customer: orderData.customer_name || "Customer",
    phone: orderData.whatsapp_number || "",
    items:
      orderData.items?.map((item) => ({
        name: item.product?.name || `Produk #${item.product_id}`,
        qty: Number(item.qty) || 0,
        discount: 0,
        price: Number(item.price) || 0,
        subtotal: Number(item.subtotal) || 0,
      })) || [],
    subtotal: Number(orderData.subtotal) || 0,
    totalDiscount: Number(orderData.discount_amount) || 0,
    total: Number(orderData.total_amount) || 0,
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
      >
        <div
          ref={invoiceRef}
          className="printable-area bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden font-sans"
          style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
        >
          <div className="p-8 border-b border-gray-50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Invoice Order #{invoiceData.orderNumber}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Shoes Care Services</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-800">
                  {invoiceData.date}
                </p>
                <button
                  onClick={() => router.back()}
                  className="no-print mt-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Billed To
              </p>
              <p className="text-sm font-bold text-gray-800">
                {invoiceData.customer}
              </p>
              {invoiceData.phone && (
                <p className="text-xs text-gray-500">{invoiceData.phone}</p>
              )}
            </div>
          </div>

          <div className="p-8 py-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[11px] font-bold text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="py-3 text-[11px] font-bold text-gray-400 uppercase text-center">
                    Qty
                  </th>
                  <th className="py-3 text-[11px] font-bold text-gray-400 uppercase text-right">
                    Subtotal
                  </th>
                  <th className="py-3 text-[11px] font-bold text-gray-400 uppercase text-right">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoiceData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-xs font-bold text-gray-800">
                      {item.name}
                    </td>
                    <td className="py-4 text-xs font-medium text-gray-600 text-center">
                      {item.qty}
                    </td>
                    <td className="py-4 text-xs font-medium text-gray-500 text-right">
                      {formatRupiah(item.subtotal)}
                    </td>
                    <td className="py-4 text-xs font-bold text-gray-800 text-right">
                      {formatRupiah(item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-gray-50/50 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-800">
                {formatRupiah(invoiceData.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500">Diskon</span>
              <span className="font-bold text-gray-800">
                {formatRupiah(invoiceData.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-blue-600 uppercase">
                Total
              </span>
              <span className="text-lg font-black text-blue-600">
                {formatRupiah(invoiceData.total)}
              </span>
            </div>
          </div>

          <div className="no-print p-8 grid grid-cols-3 gap-3 bg-white border-t border-gray-50">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <FileText size={16} /> PDF
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Share2 size={16} /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
