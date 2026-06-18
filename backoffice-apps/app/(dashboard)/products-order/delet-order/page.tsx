"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusToast from "@/components/ui/StatusToast";

export default function DeleteOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil ID dari URL parameter (?id=PRD-XXX)
  const orderId = searchParams.get("id") || "ORD-001";
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCancel = () => {
    if (!reason.trim()) {
      setToast({
        type: "error",
        text: "Reason for cancellation wajib diisi.",
      });
      return;
    }

    console.log(`Order ${orderId} cancelled with reason: ${reason}`);
    setToast({
      type: "success",
      text: `Order ${orderId} berhasil dibatalkan.`,
    });
    router.push("/products-order");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <StatusToast toast={toast} onClose={() => setToast(null)} />
      
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="p-8">
          {/* Judul & Deskripsi */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Order</h2>
          <p className="text-gray-500 text-sm mb-6">
            Are you sure you want to cancel order <span className="font-semibold text-gray-800">{orderId}</span>?
          </p>

          {/* Input Alasan */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Cancellation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer changed mind before service started"
              className="w-full h-32 p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none bg-gray-50/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-6 bg-[#FF4C4C] hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-200"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
