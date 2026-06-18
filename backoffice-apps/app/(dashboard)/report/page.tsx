"use client";

import React, { useEffect, useState } from "react";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import OverviewTab from "./OverviewTab";
import ServicesTab from "./ServicesTab";
import { reportApi, ReportData, ReportPeriod, ReportRow } from "@/lib/report";
import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { Expense, getAllExpenses } from "@/lib/expense-management";
import { ProductOrder, productOrderApi } from "@/lib/product-order";
import { getProducts, Product } from "@/lib/product-management";
import { exportReportToExcel, exportReportToPdf } from "@/utils/reportExport";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [data, setData] = useState<ReportData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [overviewPeriod, setOverviewPeriod] = useState<ReportPeriod>("year");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const [response, companyData, expenseData, productOrderData, productData] = await Promise.all([
          reportApi.getReport(undefined, overviewPeriod),
          getCompanyProfile(),
          getAllExpenses(),
          productOrderApi.getAll(),
          getProducts(),
        ]);
        setData(response);
        setCompany(companyData);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
        setProductOrders(Array.isArray(productOrderData) ? productOrderData : []);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err: any) {
        console.error("Report fetch error:", err);
        setError(err.response?.data?.message || "Gagal mengambil data report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [overviewPeriod]);

  const getExportRows = (): ReportRow[] => {
    if (!data) return [];
    if (activeTab === "Pesanan Layanan") return data.exports.services;
    if (activeTab === "Penjualan Produk") return data.exports.products;
    return data.exports.overview;
  };

  const getExportMeta = () => {
    const rows = getExportRows();
    const generatedAt = new Date();
    const overviewSummary = data?.overview.summary;
    const productMap = new Map(
      products.map((product) => [String(product.id), product]),
    );

    const isWithinPeriod = (rawDate?: string | null) => {
      const recordDate = rawDate ? new Date(rawDate) : null;
      if (!recordDate || Number.isNaN(recordDate.getTime())) return true;

      if (overviewPeriod === "day") {
        return recordDate.toDateString() === generatedAt.toDateString();
      }

      if (overviewPeriod === "week") {
        const startOfWeek = new Date(generatedAt);
        startOfWeek.setDate(generatedAt.getDate() - generatedAt.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return recordDate >= startOfWeek && recordDate < endOfWeek;
      }

      if (overviewPeriod === "month") {
        return (
          recordDate.getFullYear() === generatedAt.getFullYear() &&
          recordDate.getMonth() === generatedAt.getMonth()
        );
      }

      return recordDate.getFullYear() === generatedAt.getFullYear();
    };

    const filteredProductOrders = productOrders.filter((order) =>
      isWithinPeriod(order.created_at),
    );

    const productCapital = filteredProductOrders.reduce((sum, order) => {
      const items = Array.isArray(order.items) ? order.items : [];

      return sum + items.reduce((itemSum, item) => {
        const product =
          productMap.get(String(item.product_id)) ||
          (item.product as (Product & { purchase_price?: number }) | undefined);
        const purchasePrice = Number(product?.purchase_price || 0);
        const quantity = Number(item.qty || 0);
        return itemSum + purchasePrice * quantity;
      }, 0);
    }, 0);

    const gross =
      activeTab === "Penjualan Produk"
        ? data?.products.summary.total_sales || 0
        : activeTab === "Pesanan Layanan"
          ? data?.services.summary.total_income || 0
          : overviewSummary?.total_income || 0;
    const totalExpenses = overviewSummary?.total_expenses || 0;
    const capital = activeTab === "Pesanan Layanan" ? 0 : productCapital;
    const net =
      activeTab === "Penjualan Produk"
        ? Math.max(gross - capital - totalExpenses, 0)
        : Math.max(gross - capital - totalExpenses, 0);
    const expenseList = Array.isArray(expenses) ? expenses : [];
    const filteredExpenseRows = expenseList.filter((expense) => {
      const rawDate = expense.date || expense.created_at;
      return isWithinPeriod(rawDate ? String(rawDate) : null);
    });

    return {
      activeTab,
      period: overviewPeriod,
      generatedAt,
      totals: {
        rows: rows.length,
        amount: rows.reduce((sum, item) => sum + Number(item.total || 0), 0),
      },
      financials: {
        gross,
        capital,
        expenses: totalExpenses,
        net,
      },
      expenseBreakdown: data?.overview.expense_breakdown?.map((item) => ({
        name: item.name,
        amount: item.amount,
        percentage: item.value,
      })) || [],
      expenseRows: filteredExpenseRows.map((expense) => ({
        code: expense.code || `EXP-${expense.id}`,
        name: expense.name || "-",
        category: expense.category?.name || "General",
        amount: Number(expense.amount || 0),
        date: expense.date || expense.created_at || "-",
        description: expense.description || "-",
      })),
    } as const;
  };

  const exportToExcel = () => {
    exportReportToExcel(getExportRows(), company, getExportMeta());
  };

  const exportToPdf = async () => {
    await exportReportToPdf(getExportRows(), company, getExportMeta());
  };

  const ProductSalesTab = () => {
    const productData = data?.products;

    if (!productData) return null;

    const maxValue = Math.max(...productData.performance_data.map((item) => item.value), 1);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Penjualan</p>
            <h3 className="text-2xl font-black text-blue-600">{formatRupiah(productData.summary.total_sales)}</h3>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Penjualan Bersih</p>
            <h3 className="text-2xl font-black text-blue-500">{formatRupiah(productData.summary.net_sales)}</h3>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Penjualan Produk</p>
              <h3 className="text-2xl font-black text-blue-400">{productData.summary.product_sales}</h3>
            </div>
            <div className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400">Waktu Nyata</div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm">
          <h4 className="text-lg font-black text-gray-700 mb-10">Laporan Penjualan Produk</h4>
          <div className="space-y-8">
            {productData.performance_data.length > 0 ? productData.performance_data.map((prod, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">{prod.name}</span>
                  {prod.highlight && (
                    <span className="bg-[#1E2B5F] text-white text-[10px] px-3 py-1 rounded-full font-black">{prod.value} Terjual</span>
                  )}
                </div>
                <div className="w-full bg-gray-50 h-5 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${prod.highlight ? 'bg-blue-600' : 'bg-blue-100'}`}
                    style={{ width: `${(prod.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">Belum ada data penjualan produk.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
            <h5 className="text-sm font-black text-blue-600 uppercase mb-6">Produk Terlaris</h5>
            <div className="space-y-4">
              {productData.best_selling.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xs font-bold text-gray-700">{item.name}</span>
                  <span className="text-xs font-black text-blue-600">{item.sales} Penjualan</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
            <h5 className="text-sm font-black text-red-500 uppercase mb-6">Produk Kurang Laku</h5>
            <div className="space-y-4">
              {productData.low_performing.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xs font-bold text-gray-700">{item.name}</span>
                  <span className="text-xs font-black text-red-500">{item.sales} Penjualan</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6">
        <p className="text-red-500 font-semibold">{error || "Data report tidak tersedia."}</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-[#F8FAFC] min-h-screen"
      style={{ fontFamily: "var(--font-plus-jakarta-sans), Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-gray-100 w-full md:w-auto">
          {["Ringkasan", "Pesanan Layanan", "Penjualan Produk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-8 py-3 rounded-[20px] text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === tab 
                  ? "bg-[#1E2B5F] text-white shadow-lg shadow-blue-900/20" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={exportToPdf}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-[20px] text-[10px] font-black text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all uppercase tracking-widest"
          >
            <FileText size={14} className="text-blue-600"/> PDF
          </button>
          <button 
            onClick={exportToExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-[20px] text-[10px] font-black text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all uppercase tracking-widest"
          >
            <FileSpreadsheet size={14} className="text-green-600"/> Excel
          </button>
        </div>
      </div>

      <div className="transition-all duration-300 ease-in-out">
        {activeTab === "Ringkasan" && (
          <OverviewTab
            data={data.overview}
            period={overviewPeriod}
            onPeriodChange={setOverviewPeriod}
          />
        )}
        {activeTab === "Pesanan Layanan" && <ServicesTab data={data.services} />}
        {activeTab === "Penjualan Produk" && <ProductSalesTab />}
      </div>
    </div>
  );
}
