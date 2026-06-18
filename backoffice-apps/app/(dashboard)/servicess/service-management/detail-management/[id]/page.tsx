"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, TrendingUp, CalendarDays, Wallet, Layers3 } from "lucide-react";
import { getServiceById } from "@/lib/servis-management";
import { serviceOrderApi, ServiceOrder, ServiceOrderDetail } from "@/lib/service-order";

type Service = {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category?: { name: string }; // Sesuai dengan backend ->with('category')
  price: number;
  discount: number;
  photo: string | null;
};

type RecapItem = {
  label: string;
  count: string;
  rev: number;
  icon: React.ReactNode;
  accent: string;
  tone: string;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const getServicePhoto = (photo?: string | null) =>
    photo || "https://is3.cloudhost.id/vras/shoescare/services/no_img.png";

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [res, serviceOrders] = await Promise.all([
        getServiceById(id),
        serviceOrderApi.getAll(),
      ]);
      // Backend biasanya membungkus dalam response.data.data karena Laravel Resource
      setService(res?.data || null);
      setOrders(Array.isArray(serviceOrders) ? serviceOrders : []);
    } catch (error) {
      console.error("Failed to fetch service detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  // Hitung harga setelah diskon
  const finalPrice = service 
    ? service.price - (service.price * (service.discount / 100)) 
    : 0;

  const formatRupiah = (value: number) =>
    `Rp. ${Number(value || 0).toLocaleString("id-ID")}`;

  const getOrderDetails = (order: ServiceOrder): ServiceOrderDetail[] => {
    if (Array.isArray(order.details)) return order.details;
    return [];
  };

  const getLineQuantity = (detail: ServiceOrderDetail) =>
    Number(detail.quantity ?? detail.qty ?? 1) || 1;

  const getLineRevenue = (detail: ServiceOrderDetail) => {
    const subtotal = Number(detail.subtotal || 0);
    if (subtotal > 0) return subtotal;
    return getLineQuantity(detail) * (Number(detail.price) || 0);
  };

  const isWithinPeriod = (rawDate: string | undefined, period: "day" | "week" | "month" | "year") => {
    if (!rawDate) return false;
    const targetDate = new Date(rawDate);
    if (Number.isNaN(targetDate.getTime())) return false;

    const now = new Date();

    if (period === "day") {
      return targetDate.toDateString() === now.toDateString();
    }

    if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return targetDate >= start && targetDate < end;
    }

    if (period === "month") {
      return (
        targetDate.getFullYear() === now.getFullYear() &&
        targetDate.getMonth() === now.getMonth()
      );
    }

    return targetDate.getFullYear() === now.getFullYear();
  };

  const serviceRecap = React.useMemo(() => {
    if (!service) return [] as RecapItem[];

    const periods: Array<{
      key: "day" | "week" | "month" | "year";
      label: string;
      icon: React.ReactNode;
      accent: string;
      tone: string;
    }> = [
      {
        key: "day",
        label: "Today",
        icon: <CalendarDays className="w-4 h-4" />,
        accent: "bg-blue-500",
        tone: "bg-blue-50 text-blue-600",
      },
      {
        key: "week",
        label: "Weekly",
        icon: <TrendingUp className="w-4 h-4" />,
        accent: "bg-emerald-500",
        tone: "bg-emerald-50 text-emerald-600",
      },
      {
        key: "month",
        label: "Monthly",
        icon: <Wallet className="w-4 h-4" />,
        accent: "bg-amber-500",
        tone: "bg-amber-50 text-amber-600",
      },
      {
        key: "year",
        label: "Yearly",
        icon: <Layers3 className="w-4 h-4" />,
        accent: "bg-violet-500",
        tone: "bg-violet-50 text-violet-600",
      },
    ];

    return periods.map((period) => {
      const relevantOrders = orders.filter((order) =>
        isWithinPeriod(order.created_at, period.key),
      );

      let trxCount = 0;
      let revenue = 0;

      relevantOrders.forEach((order) => {
        const matchingDetails = getOrderDetails(order).filter(
          (detail) => Number(detail.service_id) === Number(service.id),
        );

        if (matchingDetails.length === 0) return;

        trxCount += matchingDetails.reduce(
          (sum, detail) => sum + getLineQuantity(detail),
          0,
        );
        revenue += matchingDetails.reduce(
          (sum, detail) => sum + getLineRevenue(detail),
          0,
        );
      });

      return {
        label: period.label,
        count: `${trxCount} Trx`,
        rev: revenue,
        icon: period.icon,
        accent: period.accent,
        tone: period.tone,
      };
    });
  }, [orders, service]);

  const lifetimeStats = React.useMemo(() => {
    if (!service) {
      return {
        orders: 0,
        quantity: 0,
        revenue: 0,
      };
    }

    let ordersCount = 0;
    let quantity = 0;
    let revenue = 0;

    orders.forEach((order) => {
      const matchingDetails = getOrderDetails(order).filter(
        (detail) => Number(detail.service_id) === Number(service.id),
      );

      if (matchingDetails.length === 0) return;

      ordersCount += 1;
      quantity += matchingDetails.reduce(
        (sum, detail) => sum + getLineQuantity(detail),
        0,
      );
      revenue += matchingDetails.reduce(
        (sum, detail) => sum + getLineRevenue(detail),
        0,
      );
    });

    return {
      orders: ordersCount,
      quantity,
      revenue,
    };
  }, [orders, service]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat data layanan...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7FB]">
        <p className="text-red-500 font-bold">Data tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-500 underline">Kembali</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-8 px-4 md:px-6 xl:px-8">
      <div className="w-full max-w-[1600px] mx-auto">
        
        {/* MAIN CARD: Info Service */}
        <div className="bg-white rounded-[28px] border border-gray-200 p-8 mb-6 shadow-sm overflow-hidden">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* IMAGE */}
            <div className="xl:w-72">
              <div className="w-full aspect-square shrink-0 bg-gradient-to-br from-[#F8FAFF] to-[#EEF3FF] rounded-[24px] flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm p-3">
              <Image
                src={getServicePhoto(service.photo)}
                alt={service.name}
                  width={320}
                  height={320}
                  className="object-cover w-full h-full rounded-[18px]"
                  unoptimized
              />
            </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#F8FAFF] border border-blue-100 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-blue-400">Lifetime</p>
                  <p className="text-lg font-black text-[#1E2B5F]">{lifetimeStats.orders}</p>
                  <p className="text-xs text-gray-500">Pesanan</p>
                </div>
                <div className="rounded-2xl bg-[#FFFAF2] border border-amber-100 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">Qty</p>
                  <p className="text-lg font-black text-amber-600">{lifetimeStats.quantity}</p>
                  <p className="text-xs text-gray-500">Terjual</p>
                </div>
                <div className="rounded-2xl bg-[#F4FBF6] border border-emerald-100 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Pendapatan</p>
                  <p className="text-sm font-black text-emerald-600">{formatRupiah(lifetimeStats.revenue)}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                    Ringkasan Layanan
                  </p>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    {service.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-gray-800 text-sm font-mono font-bold bg-gray-100 px-3 py-1.5 rounded-full">
                      {service.code}
                    </span>
                    <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-full">
                      {service.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#F8FAFF] to-white px-5 py-4 min-w-56">
                  <p className="text-[11px] font-black uppercase tracking-wider text-blue-400 mb-2">
                    Harga Jual Aktif
                  </p>
                  {service.discount > 0 && (
                    <p className="text-sm text-red-400 line-through mb-1">
                      {formatRupiah(Number(service.price))}
                    </p>
                  )}
                  <p className="text-3xl font-black text-[#1E2B5F]">
                    {formatRupiah(Number(finalPrice))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diskon {service.discount}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Kategori</p>
                  <p className="text-base font-bold text-gray-900">{service.category?.name || "Uncategorized"}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Kode Layanan</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{service.code}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Harga Dasar</p>
                  <p className="text-base font-bold text-gray-900">{formatRupiah(Number(service.price))}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Diskon</p>
                  <p className="text-base font-bold text-red-500">{service.discount}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECAP CARD */}
        <div className="bg-white rounded-[28px] border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                Rekap Performa
              </p>
              <h3 className="text-2xl font-black text-gray-900">
                Rekap Performa Layanan
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Diambil dari data pesanan layanan yang memakai layanan ini.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Pendapatan Lifetime</p>
              <p className="text-xl font-black text-[#1E2B5F]">{formatRupiah(lifetimeStats.revenue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceRecap.map((item) => (
              <div
                key={item.label}
                className="relative flex items-center justify-between border border-gray-100 rounded-2xl px-5 py-4 bg-white hover:bg-gray-50 transition-colors shadow-sm overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${item.accent}`}></div>
                <div className="ml-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-800 font-bold">{item.count}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${item.tone}`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Pendapatan</p>
                    <p className="text-sm text-gray-800 font-bold">
                        {formatRupiah(item.rev)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-50">
            <button
              onClick={() => router.back()}
              className="px-10 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 text-sm font-bold"
            >
              Kembali
            </button>

            <button
              onClick={() =>
                router.push(
                  `/servicess/service-management/edit-management/${id}`,
                )
              }
              className="px-10 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-white text-sm font-bold"
            >
              Ubah Layanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
