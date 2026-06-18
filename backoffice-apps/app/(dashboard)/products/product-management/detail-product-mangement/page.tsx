/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies untuk konsistensi token

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Mengambil token dari Cookies agar sama dengan halaman Edit/Login
        const token =
          Cookies.get("token") ||
          "116|Ep6BQjqRxPRnybzPGAdxrDldBLvHqOzqS5hai9aac29200b5";

        /**
         * KONEKSI KE ENV:
         * Menyesuaikan path dengan /v1/app/products sesuai standar API Anda
         */
        const res = await axios.get<{ data: any }>(
          `${API_URL}/v1/app/products/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Menangani jika response berbentuk { data: { data: ... } } atau langsung { data: ... }
        const productData = res.data.data || res.data;
        setProduct(productData);
      } catch (error) {
        console.error("Gagal mengambil detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Memuat detail produk...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800">
          Produk Tidak Ditemukan
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline font-bold"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-700">
      <div className="max-w-5xl mx-auto">
        {/* --- MAIN SECTION: INFO PRODUK --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Kolom Kiri: Gambar & Judul */}
            <div className="md:col-span-4 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    product.photo ||
                    "https://placehold.co/400x400?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Kolom Tengah: Tabel Detail 1 */}
            <div className="md:col-span-4 flex flex-col justify-end pb-2">
              <table className="w-full text-sm border-separate border-spacing-y-4">
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-400 w-1/3">
                      Category
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      {product.category?.name || "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400">Code</td>
                    <td className="text-right font-bold text-gray-700">
                      {product.code}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr className="align-top">
                    <td className="font-semibold text-gray-400 pt-1">
                      Description
                    </td>
                    <td className="text-right font-medium text-gray-600 leading-relaxed pl-4">
                      {product.description || "No description available."}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400">Discount</td>
                    <td className="text-right font-bold text-gray-700">
                      {product.discount || 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kolom Kanan: Tabel Detail 2 */}
            <div className="md:col-span-4 flex flex-col justify-end pb-2 border-l border-gray-100 md:pl-8">
              <table className="w-full text-sm border-separate border-spacing-y-4">
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-400 text-left">
                      Purchase Price
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      Rp.{" "}
                      {product.purchase_price?.toLocaleString("id-ID") || "0"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400 text-left">
                      Selling Price
                    </td>
                    <td className="text-right font-black text-blue-900 text-base">
                      Rp. {product.selling_price?.toLocaleString("id-ID")}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400 text-left">
                      Barcode
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      {product.barcode || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400 text-left">
                      Stock
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      {product.stock}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td colSpan={2} className="h-px bg-gray-100"></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-400 text-left">
                      Unit
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      {product.unit || "Pcs"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Button - Only Close */}
          <div className="flex justify-end mt-12 pt-6 border-t border-gray-50">
            <button
              onClick={() => router.back()}
              className="px-12 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition shadow-md text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}