/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getServiceById, updateService } from "@/lib/servis-management";
import { getServiceCategories } from "@/lib/service-category";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const categoryRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    category_id: "",
    code: "",
    name: "",
    price: "",
    discount: "0",
  });

  const getServicePhoto = (photo?: string | null) =>
    photo || "https://is3.cloudhost.id/vras/shoescare/services/no_img.png";

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      setLoading(true);

      try {
        const [categoryData, serviceDetail] = await Promise.all([
          getServiceCategories(),
          getServiceById(Number(id)),
        ]);

        if (categoryData && categoryData.length > 0) {
          setCategories(categoryData);
        }

        if (serviceDetail?.data) {
          const item = serviceDetail.data;
          setFormData({
            category_id: String(item.category_id || item.category?.id || ""),
            code: item.code || "",
            name: item.name || "",
            price: String(item.price || ""),
            discount: String(item.discount || "0"),
          });
          setPreviewUrl(getServicePhoto(item.photo));
        } else {
          setNotification({
            type: "error",
            message: "Data service tidak ditemukan.",
          });
        }
      } catch {
        setNotification({
          type: "error",
          message: "Gagal mengambil data detail service.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          type: "error",
          message: "Ukuran file terlalu besar! Maksimal 2MB.",
        });
        return;
      }

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setNotification(null);
    }
  };

  const handleSave = async () => {
    setNotification(null);

    if (
      !formData.name ||
      !formData.code ||
      !formData.category_id ||
      !formData.price
    ) {
      setNotification({
        type: "error",
        message: "Harap isi semua field bertanda bintang (*)",
      });
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("name", formData.name.trim());
      data.append("code", formData.code.trim().toUpperCase());
      data.append("price", formData.price);
      data.append("discount", formData.discount || "0");
      data.append("category_id", formData.category_id);
      data.append("service_category_id", formData.category_id);

      if (selectedFile) {
        data.append("photo", selectedFile);
      }

      await updateService(Number(id), data);

      setNotification({
        type: "success",
        message: "Service berhasil diperbarui!",
      });

      setTimeout(() => {
        router.push("/servicess/service-management");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      const serverError = error?.response?.data || error;

      if (serverError?.errors) {
        const messages = Object.values(serverError.errors).flat().join(", ");
        setNotification({
          type: "error",
          message: `Validasi Gagal: ${messages}`,
        });
      } else {
        setNotification({
          type: "error",
          message:
            serverError?.message ||
            "Gagal memperbarui service. Silakan coba lagi.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {isCategoryOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/40 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsCategoryOpen(false)}
        />
      )}

      <div className="max-w-full relative">
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
              notification.type === "success"
                ? "bg-[#E2F7E6] border-[#22A05B]/30 text-[#22A05B]"
                : "bg-[#FAEEEE] border-[#C13232]/30 text-[#C13232]"
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === "success" ? (
                <CheckCircle2 size={20} className="shrink-0" />
              ) : (
                <AlertCircle size={20} className="shrink-0" />
              )}
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="hover:opacity-70 transition-opacity ml-4 p-1 rounded-full hover:bg-black/5"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">
            Edit Detail Services
          </h3>

          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative w-64 h-64 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Camera className="text-gray-300 mb-4" size={48} />
                    <label className="cursor-pointer bg-white border border-gray-300 px-5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Upload Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900">
                Photo (optional)
              </p>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 gap-y-5">
                <div
                  ref={categoryRef}
                  className={`relative ${isCategoryOpen ? "z-50" : "z-10"}`}
                >
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isCategoryOpen ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    Category *
                  </label>
                  <div
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`w-full bg-white border rounded-lg px-4 py-2.5 flex justify-between items-center cursor-pointer text-sm transition-all shadow-sm ${
                      isCategoryOpen
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span
                      className={
                        formData.category_id
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }
                    >
                      {formData.category_id
                        ? categories.find(
                            (c) =>
                              String(c.id) === String(formData.category_id),
                          )?.name
                        : "Select service category"}
                    </span>
                    {isCategoryOpen ? (
                      <ChevronUp size={18} className="text-blue-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>

                  {isCategoryOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 shadow-[0_12px_40px_rgb(0,0,0,0.12)] rounded-xl py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                category_id: String(cat.id),
                              });
                              setIsCategoryOpen(false);
                            }}
                            className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                              String(formData.category_id) === String(cat.id)
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {cat.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No categories found.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Code *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter service code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
                  />
                </div>

                <div className="relative z-10">
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter service name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
                  />
                </div>

                <div className="relative z-10">
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Price *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter the price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
                  />
                </div>

                <div className="relative z-10">
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter discount percentage"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 relative z-10">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-30"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
