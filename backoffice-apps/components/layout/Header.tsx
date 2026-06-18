"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { 
  ShoppingBag, 
  User, 
  ChevronDown, 
  ChevronUp, 
  LogOut 
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export default function DashboardHeader({ title = "Page" }: HeaderProps) {
  const router = useRouter(); // 2. Inisialisasi Router
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data Dummy User
  const userData = {
    name: "Budi Santoso",
    role: "Owner",
    avatar: null 
  };

  // Logic: Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Logic Logout
  const handleLogout = () => {
    // A. Hapus data sesi (Sesuaikan dengan key yang kamu pakai saat login)
    localStorage.removeItem("token"); 
    localStorage.removeItem("user");
    
    // Jika pakai Cookies (library js-cookie):
    // Cookies.remove("token");

    // B. Tutup dropdown (opsional, biar bersih)
    setIsDropdownOpen(false);

    // C. Redirect ke halaman Login
    router.push("/login"); 
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      
      {/* Bagian Kiri: Judul Halaman */}
      <div className="flex items-center gap-3">
        <div className="text-gray-900">
           <ShoppingBag size={20} strokeWidth={2} />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      {/* Bagian Kanan: Profil User */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors outline-none"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 text-gray-500 overflow-hidden">
             {userData.avatar ? (
               <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <User size={20} strokeWidth={2.5} />
             )}
          </div>

          {/* Nama & Role */}
          <div className="hidden md:flex flex-col items-start text-sm">
            <span className="font-semibold text-gray-900 leading-tight">
                {userData.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">
                {userData.role}
            </span>
          </div>

          {/* Chevron */}
          <div className="text-gray-500 ml-1">
             {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            
            <div className="md:hidden px-4 py-3 border-b border-gray-100 mb-1">
                <p className="font-semibold text-gray-900">{userData.name}</p>
                <p className="text-xs text-gray-500">{userData.role}</p>
            </div>

            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User size={16} />
              My Profile
            </Link>
            
            {/* 4. Panggil handleLogout di sini */}
            <button 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              onClick={handleLogout} 
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}