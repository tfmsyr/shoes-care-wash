"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Box,
  Settings,
  Users,
  IdCard,
  Building2,
  BarChart3,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getCompanyProfile, getProfile, CompanyData, UserProfile } from "@/lib/auth";

const iconProps = { size: 20, strokeWidth: 2.5 };
const toggleIconProps = { size: 18, strokeWidth: 3 };

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadSidebarData = async () => {
      const [companyData, userData] = await Promise.all([
        getCompanyProfile(),
        getProfile(),
      ]);

      if (companyData) {
        setCompany(companyData);
      }
      if (userData) {
        setUser(userData);
      }
    };

    loadSidebarData();
  }, []);

  const displayUserName = user?.name || "User";
  const displayUserRole = "Owner";
  const displayUserAvatar = user?.photo;
  const displayInitial = displayUserName.charAt(0).toUpperCase();

  return (
    <aside
      className={`${
        isOpen ? "w-72" : "w-20"
      } bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out rounded-r-4xl shadow-xl overflow-visible`}
    >
      {/* === TOMBOL TOGGLE === */}
      <button
        onClick={toggle}
        className="absolute -right-4 top-28 bg-white border border-gray-200 rounded-lg p-1 shadow-md text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all z-50 flex items-center justify-center w-8 h-8 hover:scale-110"
      >
        {isOpen ? (
          <ChevronLeft {...toggleIconProps} />
        ) : (
          <ChevronRight {...toggleIconProps} />
        )}
      </button>

      {/* === LOGO AREA === */}
      <div
        className={`h-16 flex items-center ${isOpen ? "px-6" : "justify-center"} bg-blue-900 transition-all duration-300 shrink-0 rounded-tr-3xl`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={company?.logo || "/images/logo.png"}
              alt={company?.name || "Logo"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <span
          className={`text-xl font-semibold text-white tracking-tight ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${!isOpen && "w-0 opacity-0 hidden"}`}
        >
          {company?.name || "shoes care wash"}
        </span>
      </div>

      {/* === MENU NAVIGASI === */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {/* Section 1: MAIN */}
        <div className="space-y-1 mb-6">
          <SidebarItem
            href="/dashboard"
            icon={<Home {...iconProps} />}
            label="Dashboard"
            active={pathname === "/dashboard"}
            isOpen={isOpen}
          />
          <SidebarItem
            href="/service-order"
            icon={<ShoppingBag {...iconProps} />}
            label="Pesanan Layanan"
            active={pathname.startsWith("/service-order")}
            isOpen={isOpen}
          />
          <SidebarItem
            href="/products-order"
            icon={<Box {...iconProps} />}
            label="Pesanan Produk"
            active={pathname.startsWith("/products-order")}
            isOpen={isOpen}
          />
        </div>

        <div className="border-b border-gray-100/80 mb-6 mx-2"></div>

        {/* Section 2: MANAGEMENT */}
        <div className="mb-6 space-y-1">
          {isOpen && (
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-3 tracking-[0.15em]">
              Manajemen
            </p>
          )}

          <SidebarItemDropdown
            icon={<Settings {...iconProps} />}
            label="Layanan"
            isOpen={isOpen}
            active={pathname.startsWith("/servicess")}
          >
            <SidebarSubItem
              href="/servicess/service-categori"
              label="Kategori Layanan"
              active={pathname.includes("/service-categori")}
            />
            <SidebarSubItem
              href="/servicess/service-management"
              label="Manajemen Layanan"
              active={pathname.includes("/service-management")}
            />
          </SidebarItemDropdown>

          <SidebarItemDropdown
            icon={<Box {...iconProps} />}
            label="Produk"
            isOpen={isOpen}
            active={
              pathname.startsWith("/products") &&
              !pathname.startsWith("/products-order")
            }
          >
            <SidebarSubItem
              href="/products/product-categori"
              label="Kategori Produk"
              active={pathname.includes("/product-categori")}
            />
            <SidebarSubItem
              href="/products/product-management"
              label="Manajemen Produk"
              active={pathname.includes("/product-management")}
            />
          </SidebarItemDropdown>

          <SidebarItem
            href="/customers"
            icon={<Users {...iconProps} />}
            label="Pelanggan"
            active={pathname.startsWith("/customers")}
            isOpen={isOpen}
          />
          <SidebarItem
            href="/employees"
            icon={<IdCard {...iconProps} />}
            label="Karyawan"
            active={pathname.startsWith("/employees")}
            isOpen={isOpen}
          />
          <SidebarItem
            href="/company"
            icon={<Building2 {...iconProps} />}
            label="Perusahaan"
            active={pathname.startsWith("/company")}
            isOpen={isOpen}
          />
        </div>

        <div className="border-b border-gray-100/80 mb-6 mx-2"></div>

        {/* Section 3: REPORTS */}
        <div className="space-y-1">
          {isOpen && (
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-3 tracking-[0.15em]">
              Laporan
            </p>
          )}

          {/* UPDATE: Mengarahkan ke rute tunggal /report dan menggunakan startsWith untuk active state */}
          <SidebarItem
            href="/report"
            icon={<BarChart3 {...iconProps} />}
            label="Laporan"
            active={pathname.startsWith("/report")}
            isOpen={isOpen}
          />

          <SidebarItemDropdown
            icon={<Calculator {...iconProps} />}
            label="Pengeluaran"
            isOpen={isOpen}
            active={pathname.startsWith("/expenses")}
          >
            <SidebarSubItem
              href="/expenses/expense-categori"
              label="Kategori Pengeluaran"
              active={pathname.includes("/expense-categori")}
            />
            <SidebarSubItem
              href="/expenses/expense-management"
              label="Manajemen Pengeluaran"
              active={pathname.includes("/expense-management")}
            />
          </SidebarItemDropdown>
        </div>
      </nav>

      {/* FOOTER USER */}
      <div
        className={`p-4 border-t border-gray-50 bg-gray-50/50 rounded-br-4xl`}
      >
        <div
          className={`flex items-center ${isOpen ? "gap-3" : "justify-center"} p-1`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-white shadow-sm shrink-0 overflow-hidden">
            {displayUserAvatar ? (
              <img
                src={displayUserAvatar}
                alt={displayUserName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1E2B5F] text-white flex items-center justify-center text-xs font-bold">
                {displayInitial}
              </div>
            )}
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {displayUserName}
              </p>
              <p className="text-[10px] text-gray-500 font-medium">{displayUserRole}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// === COMPONENT ITEMS HELPER ===

function SidebarItem({ href, icon, label, active, isOpen }: any) {
  return (
    <Link
      href={href}
      className={`
        flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all group relative
        ${
          active
            ? "bg-blue-50 text-[#1E2B5F]"
            : "text-gray-500 hover:bg-gray-400/5 hover:text-gray-900"
        }
        ${!isOpen && "justify-center"}
      `}
    >
      <div
        className={`${active ? "text-[#1E2B5F]" : "text-gray-400 group-hover:text-gray-900"} transition-colors`}
      >
        {icon}
      </div>
      <span
        className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${!isOpen ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}
      >
        {label}
      </span>
      {!isOpen && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-gray-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-60 transition-opacity shadow-lg">
          {label}
        </div>
      )}
    </Link>
  );
}

function SidebarItemDropdown({ icon, label, isOpen, children, active }: any) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(active || false);

  useEffect(() => {
    if (active && isOpen) setIsDropdownOpen(true);
  }, [active, isOpen]);

  const handleToggle = () => {
    if (!isOpen) return;
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all group relative
          ${active ? "text-[#1E2B5F]" : "text-gray-500 hover:bg-gray-400/5 hover:text-gray-900"}
          ${!isOpen ? "justify-center" : "justify-between"}
        `}
      >
        <div className="flex items-center">
          <div
            className={`${active ? "text-[#1E2B5F]" : "text-gray-400 group-hover:text-gray-900"} transition-colors`}
          >
            {icon}
          </div>
          {isOpen && <span className="ml-3 whitespace-nowrap">{label}</span>}
        </div>
        {isOpen && (
          <ChevronDown
            size={14}
            strokeWidth={3}
            className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""} text-gray-400 group-hover:text-gray-600`}
          />
        )}
        {!isOpen && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-gray-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-60 transition-opacity shadow-lg">
            {label}
          </div>
        )}
      </button>

      {isOpen && isDropdownOpen && (
        <div className="pl-11 pr-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarSubItem({ href, label, active }: any) {
  return (
    <Link
      href={href}
      className={`
        block py-2 text-xs font-medium transition-all rounded-lg px-2
        ${
          active
            ? "text-[#1E2B5F] bg-blue-50/50 font-bold"
            : "text-gray-400 hover:text-[#1E2B5F] hover:bg-gray-50"
        }
      `}
    >
      {label}
    </Link>
  );
}
