"use client";

import { useRouter } from "next/navigation";
import {
  Pencil,
  User,
  Phone,
  IdCard,
  Briefcase,
  Camera,
  ChevronRight,
  Mail,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
// Import fungsi getProfile dan interface UserProfile dari lib/auth
import { getProfile, UserProfile } from "@/lib/auth";

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- LOGIC UPDATE: Mengambil data dari API ---
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const data = await getProfile();
      if (data) {
        setUser(data);
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500 font-medium">Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        Gagal memuat profil. Pastikan TOKEN di file .env sudah benar.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sisi Kiri: Foto & Identitas Singkat */}
        <div className="flex flex-col items-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
          <h2 className="font-semibold text-gray-700 mb-4">Foto Profil</h2>
          <div className="relative w-40 h-40">
            {user.photo ? (
              <Image 
                src={user.photo} 
                alt={user.name || "Profile"} 
                fill
                className="rounded-full object-cover border-4 border-gray-50 shadow-sm" 
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-gray-50 shadow-sm bg-blue-50 flex items-center justify-center">
                 <span className="text-5xl font-extrabold text-blue-500">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                 </span>
              </div>
            )}
          </div>
          
          <h3 className="mt-5 text-xl font-bold text-gray-900 text-center">{user.name}</h3>
          <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mt-2">
            Staff Backoffice
          </p>

          <button
            onClick={() => router.push("/my-profile/edit-profile")}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Ubah Profil
          </button>
        </div>

        {/* Sisi Kanan: Informasi Detail */}
        <div className="flex-1 space-y-5">
          <h2 className="font-semibold text-gray-700 mb-2">Informasi Personal</h2>
          
          <div className="space-y-4">
            <InfoRow 
              icon={<User size={18} className="text-blue-500" />} 
              label="Nama Lengkap" 
              value={user.name} 
            />
            <InfoRow 
              icon={<IdCard size={18} className="text-indigo-500" />} 
              label="NIK" 
              value={user.nik || ""} 
            />
            <InfoRow 
              icon={<Mail size={18} className="text-pink-500" />} 
              label="Email" 
              value={user.email || ""} 
            />
            <InfoRow 
              icon={<Phone size={18} className="text-emerald-500" />} 
              label="No. HP" 
              value={user.phone} 
            />
          </div>

          {/* Bagian Keamanan */}
          <div className="mt-8 pt-6 border-t border-gray-50">
            <h2 className="font-semibold text-gray-700 mb-4">Keamanan Akun</h2>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => router.push("/my-profile/change-password")}
                className="w-full flex items-center justify-between px-2 py-1 text-gray-700 hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-blue-100 transition-colors">
                    <Briefcase size={18} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block">Ubah Kata Sandi</span>
                    <span className="text-xs text-gray-500 font-medium">Perbarui keamanan akun Anda</span>
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-full shadow-sm">
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---

function InfoRow({ 
  icon, label, value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wide">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 bg-gray-50/50">
        <div className="text-gray-400 p-1.5 bg-white rounded-md shadow-sm border border-gray-100">{icon}</div>
        <div className="w-full text-sm font-medium text-gray-800">
          {value || <span className="text-gray-400 italic font-normal">Belum diatur</span>}
        </div>
      </div>
    </div>
  );
}
