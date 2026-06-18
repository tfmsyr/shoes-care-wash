"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  User,
  Mail,
  Phone,
  IdCard,
  Lock,
  Briefcase,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

// Import Service
import { employeeService } from "@/lib/employe";

type NotificationType = {
  type: "success" | "error";
  message: string;
} | null;

export default function AddEmployeePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nik: "",
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    password: "",
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<NotificationType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setNotification(null);

    // Validasi Sederhana
    if (!form.name || !form.email || !form.nik || !form.password) {
      setNotification({
        type: "error",
        message: "Please fill all required fields.",
      });
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // 1. Siapkan FormData
      const formData = new FormData();
      formData.append("nik", form.nik);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);
      formData.append("role", form.role);

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      // 2. Panggil Service (Login Session & Company ID diurus di sini)
      await employeeService.createEmployee(formData);

      // 3. Sukses
      localStorage.setItem("showSuccessToast", "true");
      router.push("/employees");
    } catch (error: any) {
      console.error("Error saving:", error);
      let errorMessage = "Failed to add employee. Please try again.";

      if (error.response?.data?.errors) {
        const firstErrorKey = Object.keys(error.response.data.errors)[0];
        errorMessage = error.response.data.errors[firstErrorKey][0];
      }

      setNotification({ type: "error", message: errorMessage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 p-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg border shadow-sm ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Side: Photo */}
          <div className="w-full md:w-1/3 flex flex-col items-center pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-6">
              Profile Photo
            </h3>
            <div className="w-48 h-48 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-6 relative">
              {photo ? (
                <Image
                  src={photo}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-50">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer bg-white">
                <Upload className="w-4 h-4" /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-2/3">
            <div className="border border-gray-200 rounded-xl p-6 md:p-8">
              <h3 className="text-base font-bold text-gray-900 mb-6">
                Add Contact Information
              </h3>
              <div className="space-y-5">
                <InputField
                  label="NIK"
                  name="nik"
                  value={form.nik}
                  onChange={handleChange}
                  placeholder="360204..."
                  icon={<IdCard className="w-4 h-4 text-gray-500" />}
                />
                <InputField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  icon={<User className="w-4 h-4 text-gray-500" />}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4 text-gray-500" />}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+62 812..."
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" /> Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4 text-gray-500" />}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-md ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-[#1e3a8a] hover:bg-blue-800"}`}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
}: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>
  );
}
