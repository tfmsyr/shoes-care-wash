"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Upload,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Import helper API
import { getCompanyProfile, updateCompanyProfile } from "@/lib/auth";

const CompanySchema = z.object({
  name: z.string().min(3, "Nama perusahaan minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh angka")
    .min(10, "Nomor HP minimal 10 digit")
    .max(15, "Nomor HP maksimal 15 digit"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  timezone: z.string().min(1, "Timezone wajib dipilih"),
});

type CompanyFormData = z.infer<typeof CompanySchema>;

export default function EditCompanyPage() {
  // State untuk preview gambar, file asli, dan penanda hapus
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- STATE UNTUK CUSTOM TOAST MANUAL ---
  const [toastInfo, setToastInfo] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | null;
  }>({
    show: false,
    message: "",
    type: null,
  });

  // Fungsi untuk memunculkan Toast
  const showToast = (message: string, type: "success" | "error") => {
    setToastInfo({ show: true, message, type });
    // Hilang otomatis setelah 4 detik
    setTimeout(() => {
      setToastInfo((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(CompanySchema),
  });

  // --- 1. LOAD DATA DARI API DATABASE ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        const data = await getCompanyProfile();
        if (data) {
          reset({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            timezone: data.timezone || "WIB",
          });

          if (data.logo || data.photo) {
            setPhotoPreview(data.logo || data.photo || null);
          }
        }
      } catch (err) {
        showToast("Gagal memuat data dari server.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [reset]);

  // --- 2. SIMPAN PERUBAHAN MENGGUNAKAN FORMDATA ---
  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true);
    // Sembunyikan toast sebelumnya jika ada
    setToastInfo((prev) => ({ ...prev, show: false }));

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("address", data.address);
      formData.append("timezone", data.timezone);

      if (photoFile) {
        formData.append("logo", photoFile);
      } else if (isDeletingPhoto) {
        formData.append("logo", "");
      }

      const success = await updateCompanyProfile(formData as any);

      if (success) {
        showToast(
          "Service order data has been successfully updated.",
          "success",
        );
        router.push("/company");
        router.refresh();
      } else {
        showToast(
          "Failed to update service order data. Please try again.",
          "error",
        );
      }
    } catch (error) {
      showToast("Terjadi kesalahan koneksi ke server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setIsDeletingPhoto(false);

      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500">Memuat data perusahaan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* --- KOMPONEN TOAST MANUAL --- */}
      {toastInfo.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          {toastInfo.type === "success" ? (
            <div className="min-w-75 max-w-md w-full bg-[#e6f4ea] text-[#1e7e34] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm border border-[#d4eadc]">
              <span className="text-sm font-medium">{toastInfo.message}</span>
              <button
                type="button"
                onClick={() =>
                  setToastInfo((prev) => ({ ...prev, show: false }))
                }
                className="text-[#1e7e34] hover:bg-[#d4eadc] p-1 rounded-md transition-colors ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="min-w-75 max-w-md w-full bg-[#fce8e6] text-[#c92a2a] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm border border-[#fad4d1]">
              <span className="text-sm font-medium">{toastInfo.message}</span>
              <button
                type="button"
                onClick={() =>
                  setToastInfo((prev) => ({ ...prev, show: false }))
                }
                className="text-[#c92a2a] hover:bg-[#fad4d1] p-1 rounded-md transition-colors ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      {/* ----------------------------- */}

      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT COLUMN: PHOTO */}
          <div className="w-full lg:w-75 flex flex-col items-center shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">
              Company Photo
            </h3>

            <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-6 relative">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Company Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="p-6 opacity-50 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="text-gray-400 w-8 h-8" />
                  </div>
                  <p className="text-[10px] mt-2 text-gray-500">No Photo</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full max-w-50">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                  setIsDeletingPhoto(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Photo
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="flex-1 border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Company Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <InputField
                label="Name"
                icon={<User className="w-4 h-4" />}
                placeholder="Enter company name"
                {...register("name")}
                error={errors.name?.message}
              />

              <InputField
                label="Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="Enter email address"
                {...register("email")}
                error={errors.email?.message}
              />

              <InputField
                label="Phone"
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="Enter phone number"
                {...register("phone")}
                error={errors.phone?.message}
              />

              <TextAreaField
                label="Address"
                icon={<MapPin className="w-4 h-4" />}
                placeholder="Enter full address"
                rows={3}
                {...register("address")}
                error={errors.address?.message}
              />

              <SelectField
                label="Timezone"
                icon={<Globe className="w-4 h-4" />}
                options={["WIB", "WITA", "WIT"]}
                {...register("timezone")}
                error={errors.timezone?.message}
              />

              <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#2563EB] text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:bg-blue-400"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE FORM COMPONENTS ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          ref={ref}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  ),
);
InputField.displayName = "InputField";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, icon, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-4 text-gray-400">{icon}</div>
        <textarea
          ref={ref}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          } resize-none`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  ),
);
TextAreaField.displayName = "TextAreaField";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  options: string[];
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, icon, error, options, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
        <select
          ref={ref}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  ),
);
SelectField.displayName = "SelectField";
