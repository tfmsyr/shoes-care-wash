"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Building,
  ClipboardList,
  ShoppingCart,
  Users,
  Package,
  BarChart,
  FileText,
  UserCircle,
  Pencil,
  ChevronRight,
  LogOut,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getProfile, UserProfile } from "@/lib/auth";

const routeConfig: Record<string, { title: string; icon: React.ReactNode }> = {
  "/dashboard": { title: "Dashboard", icon: <Home className="w-4 h-4" /> },
  "/company": { title: "Perusahaan", icon: <Building className="w-4 h-4" /> },
  "/company/edit": { title: "Ubah Perusahaan", icon: <Pencil className="w-4 h-4" /> },
  "/servicess": { title: "Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-categori": { title: "Kategori Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-categori/add-service-category": { title: "Tambah Kategori Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-categori/edit-service-category": { title: "Ubah Kategori Layanan", icon: <Pencil className="w-4 h-4" /> },
  "/servicess/service-management": { title: "Manajemen Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-management/add-management": { title: "Tambah Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-management/detail-management": { title: "Detail Layanan", icon: <Package className="w-4 h-4" /> },
  "/servicess/service-management/edit-management": { title: "Ubah Layanan", icon: <Pencil className="w-4 h-4" /> },
  "/products": { title: "Produk", icon: <Package className="w-4 h-4" /> },
  "/products/product-categori": { title: "Kategori Produk", icon: <Package className="w-4 h-4" /> },
  "/products/product-management": { title: "Manajemen Produk", icon: <Package className="w-4 h-4" /> },
  "/service-order": { title: "Pesanan Layanan", icon: <ClipboardList className="w-4 h-4" /> },
  "/products-order": { title: "Pesanan Produk", icon: <ShoppingCart className="w-4 h-4" /> },
  "/customers": { title: "Pelanggan", icon: <Users className="w-4 h-4" /> },
  "/employees": { title: "Karyawan", icon: <Users className="w-4 h-4" /> },
  "/expenses": { title: "Pengeluaran", icon: <FileText className="w-4 h-4" /> },
  "/expenses/expense-categori": { title: "Kategori Pengeluaran", icon: <FileText className="w-4 h-4" /> },
  "/expenses/expense-management": { title: "Manajemen Pengeluaran", icon: <FileText className="w-4 h-4" /> },
  "/report": { title: "Laporan", icon: <BarChart className="w-4 h-4" /> },
  "/my-profile": { title: "Profil Saya", icon: <UserCircle className="w-4 h-4" /> },
};

interface NavbarUser extends UserProfile {
  role?: {
    id?: number;
    name?: string;
  };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = (await getProfile()) as NavbarUser | null;
      if (profile) {
        setUser(profile);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    router.push("/login");
    router.refresh();
  };

  const formatSegmentTitle = (part: string) => {
    return part
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const breadcrumbParts = pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => !/^\d+$/.test(part));

  const breadcrumbs = breadcrumbParts.map((part, index) => {
    const url = "/" + breadcrumbParts.slice(0, index + 1).join("/");
    const route = routeConfig[url];
    return {
      href: url,
      title: route ? route.title : formatSegmentTitle(part),
      icon: route ? route.icon : null,
    };
  });

  const displayName = user?.name || "Admin";
  const displayRole = user?.role?.name || "Pengguna";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md">
      
      {/* 🔹 Breadcrumbs Area */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link 
          href="/dashboard" 
          className="flex items-center text-gray-400 hover:text-[#1E2B5F] transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        {breadcrumbs.length > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              <Link
                href={crumb.href}
                className={`flex items-center space-x-2 transition-colors ${
                  isLast ? "font-bold text-[#1E2B5F]" : "text-gray-500 hover:text-[#1E2B5F]"
                }`}
              >
                {crumb.title}
              </Link>
              {!isLast && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* 🔹 User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="group flex items-center space-x-3 rounded-full border border-gray-100 bg-gray-50/50 p-1.5 pr-4 transition-all hover:bg-white hover:shadow-md active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E2B5F] text-white shadow-inner overflow-hidden">
            {user?.photo ? (
              <img
                src={user.photo}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold uppercase">{displayInitial}</span>
            )}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-gray-900">{displayName}</span>
            <span className="text-[10px] font-medium text-gray-500">{displayRole}</span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 mb-1">
               <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Akun</p>
            </div>
            
            <button
              onClick={() => { setOpen(false); router.push("/my-profile"); }}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#1E2B5F]"
            >
              <UserCircle className="mr-3 h-4 w-4 text-gray-400" />
              Profil Saya
            </button>

            <div className="my-1 border-t border-gray-50"></div>

            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
