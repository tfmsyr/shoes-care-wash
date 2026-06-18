"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Lock,
  User,
  IdCard,
  Mail,
  Eye,
  EyeOff,
  Phone,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
// Import helper API
import { getProfile, updateProfile, updateProfilePhoto, UserProfile } from "@/lib/auth";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk data profil (Nama, NIK, dll)
  const [formData, setFormData] = useState<UserProfile>({
    nik: "",
    name: "",
    email: "",
    phone: "",
  });

  // State terpisah untuk Update Password agar tidak mengganggu data profil
  const [passwordData, setPasswordData] = useState({
    password_current: "",
    password_new: "",
  });

  const [photo, setPhoto] = useState("/avatar.png");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false });

  // --- 1. LOAD DATA DARI DATABASE ---
  useEffect(() => {
    async function loadInitialData() {
      const data = await getProfile();
      if (data) {
        setFormData({
          nik: data.nik || "",
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        if (data.photo) setPhoto(data.photo);
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  };

  // --- 2. SIMPAN PERUBAHAN (PROFIL & PASSWORD) ---
  const handleSave = async () => {
    setSaving(true);
    try {
      // Jalankan update profil
      const profileSuccess = await updateProfile(formData);

      let photoSuccess = true;
      if (photoFile) {
        const photoResponse = await updateProfilePhoto(photoFile);
        photoSuccess = !!photoResponse;
      }
      
      // Jalankan update password HANYA jika form password sedang terbuka & diisi
      let passwordSuccess = true;
      if (showPasswordForm && passwordData.password_new) {
        // TODO: Implement changePassword API call once the function is exported from @/lib/auth
        // const res = await changePassword({
        //   password_current: passwordData.password_current,
        //   password_new: passwordData.password_new,
        //   password_confirm: passwordData.password_new
        // });
        // passwordSuccess = res.success;
      }

      if (profileSuccess && photoSuccess && passwordSuccess) {
        alert("Perubahan berhasil disimpan!");
        router.push("/my-profile"); // Pastikan URL sesuai (tanpa /dashboard/)
        router.refresh(); 
      } else {
        alert("Gagal memperbarui beberapa data. Silakan cek kembali.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500 font-medium">Sinkronisasi data database...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sisi Kiri: Foto */}
        <div className="flex flex-col items-center">
          <h2 className="font-semibold text-gray-700 mb-4">Foto Profil</h2>
          <div className="relative w-40 h-40">
            <Image 
              src={photo} 
              alt="Profile" 
              fill
              className="rounded-full object-cover border-4 border-gray-50" 
            />
          </div>
          <div className="flex flex-col gap-3 mt-6 w-full">
            <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer w-full hover:bg-gray-50 transition-all text-sm font-medium">
              <Upload size={16} /> Unggah Foto
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
            <button
              onClick={() => {
                setPhoto("/avatar.png");
                setPhotoFile(null);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>

        {/* Sisi Kanan: Form Data */}
        <div className="flex-1 space-y-5">
          <InputRow 
            icon={<User size={18} />} 
            label="Nama Lengkap" 
            value={formData.name} 
            onChange={(v) => setFormData({...formData, name: v})} 
          />
          <InputRow 
            icon={<IdCard size={18} />} 
            label="NIK" 
            value={formData.nik} 
            onChange={(v) => setFormData({...formData, nik: v})} 
          />
          <InputRow 
            icon={<Mail size={18} />} 
            label="Email" 
            value={formData.email} 
            onChange={(v) => setFormData({...formData, email: v})} 
          />
          <InputRow 
            icon={<Phone size={18} />} 
            label="No. HP" 
            value={formData.phone} 
            onChange={(v) => setFormData({...formData, phone: v})} 
          />

          {/* Bagian Keamanan */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            {!showPasswordForm ? (
              <button
                className="w-full flex items-center justify-between px-2 py-1 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setShowPasswordForm(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Lock size={18} className="text-blue-500" />
                  </div>
                    <span className="font-medium text-sm">Ubah Kata Sandi</span>
                </div>
                <ChevronRight size={18} />
              </button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pembaruan Keamanan</p>
                  <button 
                    className="text-xs text-red-500 font-semibold"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ password_current: "", password_new: "" });
                    }}
                  >
                    Batal
                  </button>
                </div>
                
                <PasswordInput
                  label="Kata Sandi Saat Ini"
                  value={passwordData.password_current}
                  onChange={(v) => setPasswordData({...passwordData, password_current: v})}
                  show={showPw.current}
                  toggle={() => setShowPw({ ...showPw, current: !showPw.current })}
                />
                
                <PasswordInput
                  label="Kata Sandi Baru"
                  value={passwordData.password_new}
                  onChange={(v) => setPasswordData({...passwordData, password_new: v})}
                  show={showPw.new}
                  toggle={() => setShowPw({ ...showPw, new: !showPw.new })}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button
              onClick={() => router.push("/my-profile")}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-all text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center gap-2 transition-all text-sm disabled:bg-blue-400"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG (Real Data Driven) ---

function InputRow({ 
  icon, label, value, onChange 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wide">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 gap-3 bg-white focus-within:ring-2 focus-within:ring-blue-50 focus-within:border-blue-500 transition-all">
        <div className="text-gray-400">{icon}</div>
        <input
          type="text"
          className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Masukkan ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

function PasswordInput({ 
  label, show, toggle, value, onChange 
}: { 
  label: string; 
  show: boolean; 
  toggle: () => void;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 gap-3 bg-white focus-within:ring-2 focus-within:ring-blue-50 transition-all">
      <Lock size={18} className="text-gray-400" />
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-sm placeholder:text-gray-300"
      />
      <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
