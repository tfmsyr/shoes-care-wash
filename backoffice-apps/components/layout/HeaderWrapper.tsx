"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar"; 

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Daftar path yang HARUS menyembunyikan Navbar
  // Kita tambahkan pengecekan startsWith jika perlu, 
  // tapi untuk kasusmu cukup pastikan path dasarnya tepat.
  const isDashboardHome = pathname === "/dashboard" || pathname === "/dashboard/";

  if (isDashboardHome) {
    return null; // Benar-benar tidak merender apa-apa
  }

  return <Navbar />;
}