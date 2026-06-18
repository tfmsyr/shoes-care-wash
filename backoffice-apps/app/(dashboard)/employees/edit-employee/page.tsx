"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Trash2,
  ChevronLeft,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";

// Import Service Terpusat
import { employeeService } from "@/lib/employe";

export default function EditEmployeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Staff",
    photo: "/avatar.png",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Fetch Data Awal
  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      setIsFetching(true);
      try {
        const data = await employeeService.getEmployeeById(employeeId);
        setFormData({
          nik: data.nik || "",
          name: data.name || data.business_name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "", // Password dikosongkan untuk keamanan
          role: data.role || "Staff",
          photo: data.photo || "/avatar.png",
        });
      } catch (error) {
        setNotification({
          show: true,
          message: "Failed to load employee data.",
          type: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, photo: URL.createObjectURL(file) }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Simpan Perubahan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    setIsLoading(true);
    setNotification({ ...notification, show: false });

    try {
      const data = new FormData();
      data.append("nik", formData.nik);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("role", formData.role);

      if (formData.password.trim() !== "") {
        data.append("password", formData.password);
      }

      if (selectedFile) {
        data.append("photo", selectedFile);
      }

      // Panggil Service Update
      await employeeService.updateEmployee(employeeId, data);

      setNotification({
        show: true,
        message: "Employee updated successfully!",
        type: "success",
      });

      setTimeout(() => router.push("/employees"), 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update employee.";
      setNotification({ show: true, message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans flex justify-center items-start relative">
      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl animate-in slide-in-from-top-5 border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <div className="text-sm font-medium">{notification.message}</div>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Employees
        </button>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-12 gap-12"
        >
          {/* Left Side: Photo */}
          <div className="md:col-span-4 flex flex-col items-center pt-4">
            <h2 className="text-lg font-bold text-gray-800 mb-6 self-start">
              Profile Photo
            </h2>
            <div className="relative w-56 h-56 rounded-full overflow-hidden border border-gray-200 shadow-sm mb-6">
              <Image
                src={formData.photo}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFormData((p) => ({ ...p, photo: "/avatar.png" }));
                }}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Right Side: Inputs */}
          <div className="md:col-span-8 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Contact Information
            </h2>
            <div className="space-y-5">
              <InputField
                label="NIK"
                name="nik"
                value={formData.nik}
                onChange={handleChange}
                required
              />
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg bg-gray-500 text-white font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Small Component
function InputField({ label, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );
}
