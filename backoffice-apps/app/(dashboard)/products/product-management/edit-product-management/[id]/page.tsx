/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCategories,
  getProductById,
  updateProduct,
} from "@/lib/product-management";
import StatusToast from "@/components/ui/StatusToast";

// --- ICONS (Inline SVG) ---
const CameraIcon = () => (
  <svg
    className="w-12 h-12 text-gray-300 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={`w-5 h-5 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  // State Media
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // State Form & Kategori
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true); // State loading untuk fetch data awal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Mengambil Kategori dan Data Produk yang akan diedit
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const dataList = await getCategories();
        setCategories(dataList);

        if (productId) {
          const productData = await getProductById(productId);

          if (!productData) {
            setStatusMsg({ type: "error", text: "Data produk tidak ditemukan." });
            return;
          }

          setCategory(String(productData.category_id || ""));
          setCode(productData.code || "");
          setName(productData.name || "");
          setPurchasePrice(productData.purchase_price?.toString() || "");
          setSellingPrice(productData.selling_price?.toString() || "");
          setStock(productData.stock?.toString() || "");
          setDiscount(productData.discount?.toString() || "");
          setUnit(productData.unit || "pcs");
          setDescription(productData.description || "");
          setBarcode(productData.barcode || "");
          if (productData.photo) {
            setPhoto(productData.photo);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        setStatusMsg({ type: "error", text: "Gagal memuat data produk." });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  // Efek untuk menutup dropdown kategori ketika klik di luar elemen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi pembersih angka
  const toNum = (val: string) => {
    if (!val) return "0";
    const cleaned = val.toString().replace(/\D/g, "");
    return cleaned === "" ? "0" : cleaned;
  };

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 6000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  // Handle Upload Foto Preview
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const fr = new FileReader();
    fr.onload = () => setPhoto(String(fr.result));
    fr.readAsDataURL(f);
  }

  // Handle Simpan (Update) Data
  async function handleUpdate() {
    if (!category || !code.trim() || !name.trim()) {
      setStatusMsg({
        type: "error",
        text: "Kategori, Kode, dan Nama wajib diisi!",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category_id", category);
      formData.append("code", code.trim());
      formData.append("name", name.trim());
      formData.append("purchase_price", toNum(purchasePrice));
      formData.append("selling_price", toNum(sellingPrice));
      formData.append("stock", toNum(stock));
      formData.append("discount", toNum(discount));
      formData.append("unit", unit || "pcs");
      formData.append("description", description || "");
      formData.append("barcode", barcode || "");
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await updateProduct(productId, formData);

      setStatusMsg({ type: "success", text: "Product updated successfully!" });
      setTimeout(() => router.push("/products/product-management"), 1500);
    } catch (error: any) {
      console.error("API Error Detail:", error.response?.data);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        let combinedMsg = "Kesalahan Input:";
        for (const key in validationErrors) {
          combinedMsg += `\n• ${validationErrors[key][0]}`;
        }
        setStatusMsg({ type: "error", text: combinedMsg });
      } else {
        const errMsg =
          error.response?.data?.message ||
          "Failed to update product. Please try again";
        setStatusMsg({ type: "error", text: errMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Memuat data produk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans relative">
      {/* Efek Blur Latar Belakang */}
      {isCategoryOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/10 backdrop-blur-sm transition-all"
          onClick={() => setIsCategoryOpen(false)}
        />
      )}

      <StatusToast toast={statusMsg} onClose={() => setStatusMsg(null)} />

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Product</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- KIRI: FOTO --- */}
          <div className="lg:col-span-4 relative z-10">
            <label className="text-sm font-semibold text-gray-800 block mb-4">
              Photo
            </label>
            <div className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-[20px] flex flex-col items-center justify-center overflow-hidden bg-white relative mb-4 group hover:border-blue-400 transition-colors">
              {photo ? (
                <img
                  src={photo}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <CameraIcon />
                  <div className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white shadow-sm flex items-center">
                    <UploadIcon /> Upload Photo
                  </div>
                </div>
              )}

              {photo && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <span className="text-white font-semibold text-sm bg-black/60 px-4 py-2 rounded-lg">
                    Change Photo
                  </span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2 text-[#3b82f6] border border-gray-200 rounded-xl text-sm font-semibold hover:bg-blue-50 transition relative overflow-hidden"
              >
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoFile(null);
                }}
                className="flex-1 py-2 text-red-500 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          </div>

          {/* --- KANAN: FORM FIELDS --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category Dropdown */}
            <div
              ref={categoryRef}
              className={`relative ${isCategoryOpen ? "z-50" : "z-10"}`}
            >
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full flex justify-between items-center border p-3.5 rounded-xl text-sm bg-white transition-all outline-none ${
                  isCategoryOpen
                    ? "border-blue-500 ring-1 ring-blue-500 text-gray-800"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span>
                  {category
                    ? categories.find((c) => String(c.id) === String(category))
                        ?.name || "Kategori Terpilih"
                    : "Select product category"}
                </span>
                <ChevronDown
                  className={`text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute w-full mt-2 py-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                          String(category) === String(cat.id)
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setCategory(String(cat.id));
                          setIsCategoryOpen(false);
                        }}
                      >
                        {cat.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-3 text-sm text-gray-500">
                      Memuat kategori... (atau data kosong)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Code */}
            <div className="relative z-10">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter product code"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Name */}
            <div className="relative z-10">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Row: Purchase Price & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Purchase Price (Optional)
                </label>
                <input
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Enter purchase price"
                  className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Discount (%) (Optional)
                </label>
                <input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Enter discount"
                  className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div className="relative z-10">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Selling Price
              </label>
              <input
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="Enter selling price"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Barcode & Description */}
            <div className="relative z-10">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Barcode (Optional)
              </label>
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter barcode"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="relative z-10">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Description (Optional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description product"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Row: Stock & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Stock
                </label>
                <input
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Enter stock quantity"
                  className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Unit
                </label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Enter unit (e.g., pcs, set)"
                  className="w-full border border-gray-200 p-3.5 rounded-xl text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 relative z-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 bg-gray-500 text-white rounded-xl text-sm font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-10 py-3 bg-[#3b82f6] text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
