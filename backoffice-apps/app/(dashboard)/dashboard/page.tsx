"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie"; // Gunakan js-cookie agar sinkron dengan file auth.ts Anda
import {
  ArrowUpRight,
  ChevronDown,
  Package,
  Droplets,
  User,
  LogOut,
  Loader2,
} from "lucide-react";

import { dashboardService, DashboardData } from "@/lib/dhasboard";
import { getProfile, UserProfile } from "@/lib/auth";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tab, setTab] = useState<"today" | "week" | "month">("today");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    Cookies.remove("token"); // Hapus juga token di cookie
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDashboardData(tab);
        setData(res);
      } catch (error) {
        console.error("API Error:", error);
        setData({
          user: { id: 0, name: "Admin", email: "" },
          stats: { revenue: 0, active_orders: 0, new_orders: 0, low_stock: 0 },
          revenue_total: 0,
          period_total: 0,
          breakdown: { services: 0, products: 0 },
          recent_services: [],
          recent_products: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tab]);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };

    loadProfile();
  }, []);

  // --- SISA KODE FRONT-END DIBAWAH SAMA PERSIS (TIDAK DIGANTI) ---
  const cardStyle = "bg-white p-6 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50";
  const smallCardStyle = "bg-white p-5 rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-200";
  const displayUserName = userProfile?.name || data?.user?.name || "Admin";
  const displayUserPhoto = userProfile?.photo;
  const displayInitial = displayUserName.substring(0, 2).toUpperCase();

  if (loading && !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Fetching real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen p-6 space-y-6 pb-10 font-sans text-gray-900 relative w-full">
      {/* Konten UI Anda tetap disini... */}
      <div className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardStyle} p-6 rounded-[10px] relative z-20`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor your store performance in real-time.</p>
        </div>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-4 outline-none group p-2 hover:bg-gray-50 rounded-xl transition-colors text-left">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{displayUserName}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              {displayUserPhoto ? (
                <img
                  src={displayUserPhoto}
                  alt={displayUserName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-blue-600 group-hover:text-white text-xs font-bold uppercase">{displayInitial}</span>
              )}
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
              <Link href="/my-profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"><User size={16} /> My Profile</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left mt-1"><LogOut size={16} /> Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative z-10">
        <StatCard title="Today's Revenue" value={`Rp ${data?.stats?.revenue?.toLocaleString() || "0"}`} isTrend />
        <StatCard title="Active Orders" value={data?.stats?.active_orders || "0"} />
        <StatCard title="New Orders" value={`+ ${data?.stats?.new_orders || "0"}`} />
        <div className={`${smallCardStyle} flex flex-col justify-between`}>
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-600">Low Stock</p>
            <Link href="/products/product-management?lowStock=1" className="text-[10px] bg-[#1E2B5F] text-white px-3 py-1 rounded-full">view</Link>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data?.stats?.low_stock || "0"}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className={`lg:col-span-2 flex flex-col ${cardStyle}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Analysis</h3>
          <div className="bg-gray-100 rounded-xl p-1.5 mb-8 w-full grid grid-cols-3 gap-1">
            {(["today", "week", "month"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`text-sm font-bold py-2.5 rounded-lg transition-all text-center capitalize ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mt-2">
            <div>
              <h2 className="text-[40px] font-bold text-gray-900 leading-tight">Rp {data?.revenue_total?.toLocaleString() || "0"}</h2>
              <p className="text-gray-500 text-sm mt-2">Overall total revenue recorded</p>
            </div>
            <div className="w-full md:w-[320px] p-5 bg-blue-50/50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">{tab} accumulation</p>
              <p className="text-2xl font-bold text-gray-900">Rp {data?.period_total?.toLocaleString() || "0"}</p>
            </div>
          </div>
        </div>
        <div className={cardStyle}>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Breakdown</h3>
          <p className="text-xs text-gray-400 mb-8">Income sources</p>
          <div className="space-y-8 flex-1">
            <BreakdownItem icon={<Droplets className="text-blue-500" />} label="Services" value={data?.breakdown?.services} />
            <BreakdownItem icon={<Package className="text-orange-500" />} label="Products" value={data?.breakdown?.products} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <OrderList title="Recent Services" items={data?.recent_services} />
        <OrderList title="Recent Products" items={data?.recent_products} highlight />
      </div>
    </div>
  );
}

// === COMPONENT PARTS (Sama persis) ===
function StatCard({ title, value, isTrend }: any) { return ( <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50"> <p className="text-sm font-semibold text-gray-600">{title}</p> <h3 className="text-2xl font-bold text-gray-900 mt-3">{value}</h3> {isTrend && ( <div className="mt-2 flex items-center text-xs font-bold text-green-500"> <ArrowUpRight size={14} className="mr-1" /> Live </div> )} </div> ); }
function BreakdownItem({ icon, label, value }: any) { return ( <div className="flex items-center justify-between"> <div className="flex items-center gap-4"> {icon} <span className="text-sm font-medium text-gray-600">{label}</span> </div> <span className="text-sm font-bold text-gray-900"> Rp {value?.toLocaleString() || "0"} </span> </div> ); }
function OrderList({ title, items, highlight }: any) { return ( <div className={`p-6 rounded-2xl border ${highlight ? "border-2 border-blue-500 shadow-blue-50" : "border-gray-200"} bg-white`} > <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3> <div className="space-y-4"> {items && items.length > 0 ? ( items.map((item: any, idx: number) => ( <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl" > <div className="overflow-hidden"> <p className="text-sm font-bold text-gray-900 truncate"> {item.customer_name} </p> <p className="text-xs text-gray-500 truncate"> {item.items_summary || "-"} </p> </div> <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white uppercase ml-2"> {item.status} </span> </div> )) ) : ( <p className="text-sm text-gray-400 italic"> No recent transactions. </p> )} </div> </div> ); }
