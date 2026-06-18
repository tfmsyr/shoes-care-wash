"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ReportData, ReportPeriod } from "@/lib/report";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const periodOptions: { key: ReportPeriod; label: string }[] = [
  { key: "day", label: "Hari" },
  { key: "week", label: "Minggu" },
  { key: "month", label: "Bulan" },
  { key: "year", label: "Tahun" },
];

export default function OverviewTab({
  data,
  period,
  onPeriodChange,
}: {
  data: ReportData["overview"];
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
}) {
  const expensePie = data?.expense_breakdown || [];
  const latestChart =
    data.income_expense_chart[data.income_expense_chart.length - 1] || null;

  const summaryCards = [
    {
      label: "Total Pesanan Layanan",
      value: data.summary.total_service_order,
      color: "text-blue-500",
    },
    {
      label: "Total Penjualan Produk",
      value: data.summary.total_product_sale,
      color: "text-blue-500",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(data.summary.total_income),
      color: "text-lime-500",
    },
    {
      label: "Total Pengeluaran",
      value: formatRupiah(data.summary.total_expenses),
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-400">{card.label}</p>
            <h3 className={`mt-2 text-3xl font-black ${card.color}`}>
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h4 className="text-lg font-bold text-slate-700">
              Perbandingan Pendapatan dan Pengeluaran
            </h4>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {periodOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onPeriodChange(option.key)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-all ${
                    period === option.key
                      ? "bg-[#1E2B5F] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.income_expense_chart}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatRupiah(value) : ''} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#84CC16"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FFFFFF", stroke: "#84CC16", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#FF5A5A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FFFFFF", stroke: "#FF5A5A", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-lime-500" />
              Pendapatan
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Pengeluaran
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400">
                Pengeluaran Harian
              </p>
              <p className="mt-1 text-sm font-black text-blue-500">
                {formatRupiah(expensePie[0]?.amount || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400">
                Pengeluaran Bulanan
              </p>
              <p className="mt-1 text-sm font-black text-blue-500">
                {formatRupiah(data.summary.total_expenses || 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400">
                Laba Bersih Saat Ini
              </p>
              <p className="mt-1 text-sm font-black text-blue-500">
                {formatRupiah(
                  (latestChart?.income || 0) - (latestChart?.expense || 0),
                )}
              </p>
            </div>
          </div>

          <div className="relative mx-auto h-56 w-full max-w-65">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePie}
                  innerRadius={0}
                  outerRadius={94}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {expensePie.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            {expensePie.length > 0 ? (
              expensePie.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-3 font-bold text-slate-600">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <div className="flex min-w-32.5 items-center justify-between gap-3 font-bold">
                    <span className="text-slate-400">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-lime-500">{item.value}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Belum ada data pengeluaran.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h4 className="text-lg font-bold text-slate-700">Wawasan Pelanggan</h4>
          <div className="rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-bold text-slate-500">
            Ringkasan
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-[10px] font-semibold text-slate-400">
                  Pelanggan Baru
                </p>
                <p className="mt-2 text-2xl font-black text-blue-500">
                  {data.customer_insight.new_customer}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-[10px] font-semibold text-slate-400">
                  Pelanggan Kembali
                </p>
                <p className="mt-2 text-2xl font-black text-blue-500">
                  {data.customer_insight.returning}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-[10px] font-semibold text-slate-400">
                  Rata-rata Nilai Pesanan
                </p>
                <p className="mt-2 text-lg font-black text-blue-500">
                  {formatRupiah(data.customer_insight.avg_order)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
              Preferensi Pelanggan Teratas
            </p>
            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <div className="grid grid-cols-[1.1fr_1.8fr_1fr] bg-slate-50 px-5 py-3 text-[11px] font-bold text-slate-400">
                <span>Kategori</span>
                <span>Preferensi</span>
                <span className="text-right">Jumlah</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.8fr_1fr] items-center border-t border-slate-100 px-5 py-4 text-sm">
                <span className="font-bold text-slate-500">Layanan</span>
                <span className="font-bold text-slate-800">
                  {data.top_preferences.service.name}
                </span>
                <span className="text-right font-bold text-slate-500">
                  {data.top_preferences.service.count} Pesanan
                </span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.8fr_1fr] items-center border-t border-slate-100 px-5 py-4 text-sm">
                <span className="font-bold text-slate-500">Produk</span>
                <span className="font-bold text-slate-800">
                  {data.top_preferences.product.name}
                </span>
                <span className="text-right font-bold text-slate-500">
                  {data.top_preferences.product.count} Penjualan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
