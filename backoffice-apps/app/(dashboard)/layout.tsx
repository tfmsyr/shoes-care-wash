"use client";

import React, { useState } from 'react';

// PENTING: Import dari folder _components di sebelah file ini
import Sidebar from '../../components/layout/Sidebar';
import HeaderWrapper from '../../components/layout/HeaderWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = isSidebarOpen ? "18rem" : "5rem";

  return (
    // PERBAIKAN 1: Ganti 'min-h-screen' jadi 'h-screen overflow-hidden'
    // Ini mengunci tinggi layar browser supaya Sidebar diam di tempat (fixed)
    <div
      className="flex h-screen overflow-hidden bg-[#F7F8FA] text-gray-800"
      style={{ ["--sidebar-width" as string]: sidebarWidth }}
    >
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Wrapper Konten Kanan */}
      <div 
        className="flex min-w-0 flex-1 flex-col h-full transition-all duration-300 ease-in-out pl-[var(--sidebar-width)]"
      >
        <HeaderWrapper />

        {/* PERBAIKAN 2: overflow-y-auto ditaruh di sini
            Artinya: Jika konten panjang, hanya area 'main' ini yang akan muncul scrollbar */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
