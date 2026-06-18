import Image from 'next/image';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* === BAGIAN KIRI (DESKTOP ONLY) === 
          - Hidden di HP (md:flex)
          - Lebar 50% di Laptop
          - Background Biru & Logo Besar
      */}
      <div className="hidden md:flex w-1/2 bg-[#0A2686] relative flex-col items-center justify-center rounded-br-[80px] z-20 shadow-2xl">
         <div className="relative w-full max-w-md flex items-center justify-center p-10 animate-fade-in">
            {/* Logo Besar untuk Desktop */}
            <Image 
                src="/images/logo.png" 
                alt="Shoes Care Illustration" 
                width={450} 
                height={450} 
                className="object-contain drop-shadow-2xl"
                priority 
            />
         </div>
         
      </div>

      {/* === BAGIAN KANAN (FORM) === 
          - Full width di HP, 50% di Desktop
          - Scrollable (overflow-y-auto) agar aman di HP kecil/Landscape
      */}
      <div className="w-full md:w-1/2 relative flex flex-col h-screen overflow-y-auto bg-gray-50 md:bg-white">
        
        {/* Hiasan Biru Background (Hanya muncul di Desktop sebagai underlay) */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-full bg-[#0A2686] z-0"></div>

        {/* Container Form Utama */}
        <div className="relative flex-1 flex flex-col justify-center min-h-full w-full bg-white md:rounded-tl-[80px] z-10 px-6 py-10 sm:px-12 md:px-16 lg:px-24 transition-all duration-300">
            
            {/* === LOGO KHUSUS MOBILE === 
                Hanya muncul di HP (md:hidden). 
                Penting agar user di HP tahu ini aplikasi apa.
            */}
            <div className="md:hidden flex flex-col items-center mb-8">
                <Image 
                    src="/images/logo.png" // Pastikan pakai logo yang kontras (atau logo berwarna)
                    alt="Shoes Care Logo" 
                    width={120} 
                    height={120} 
                    className="object-contain"
                />
            </div>

            {/* Area Konten (Children dari Page) */}
            <div className="w-full max-w-md mx-auto">
                {children}
            </div>

            {/* Footer Kecil Khusus Mobile */}
            <div className="mt-8 text-center md:hidden">
                <p className="text-xs text-gray-400">© 2025 Shoes Care System</p>
            </div>
        </div>
      </div>
    </div>
  );
}