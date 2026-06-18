"use client";

import React, { useState } from "react";
import { Send, Trash2, ChevronDown } from "lucide-react";
import StatusToast from "@/components/ui/StatusToast";

const ORDER_LOGS = [
  { id: "ORD-001", name: "Windy Destiana Sari", services: "Deep Clean, Polish", msg: "Your shoes are ready for pickup. Thank you for choosing our service!", date: "13 Nov 2025, 14.33", status: "Completed", color: "bg-green-100 text-green-600" },
  { id: "ORD-001", name: "Windy Destiana Sari", services: "Deep Clean, Polish", msg: "Your order has been cancelled. If you need any help, feel free to contact us.", date: "13 Nov 2025, 14.33", status: "Cancelled", color: "bg-red-100 text-red-600" },
  { id: "ORD-001", name: "Windy Destiana Sari", services: "Deep Clean, Polish", msg: "Your shoes laundry order has been received. We will start processing it soon.", date: "13 Nov 2025, 14.33", status: "Received", color: "bg-blue-100 text-blue-600" },
  { id: "ORD-001", name: "Windy Destiana Sari", services: "Deep Clean, Polish", msg: "Your shoes are being cleaned. Please wait while we process your order.", date: "13 Nov 2025, 14.33", status: "In Progress", color: "bg-orange-100 text-orange-600" },
];

export default function AllStatusPage() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans italic">
      <StatusToast toast={toast} onClose={() => setToast(null)} />

      {/* Header Dropdown */}
      <div className="mb-6 flex justify-start">
        <button className="flex items-center gap-6 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 shadow-sm">
          All Status <ChevronDown size={18} className="text-blue-900" />
        </button>
      </div>

      {/* Card Container */}
      <div className="space-y-4 max-w-6xl">
        {ORDER_LOGS.map((item, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Top Row: ID & Icons */}
            <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex gap-4 items-center">
                <span className="text-[15px] font-black text-slate-800">{item.id}</span>
                <span className="text-[15px] font-bold text-slate-600">{item.name}</span>
              </div>
              <div className="flex gap-4">
                <Send
                  size={18}
                  className="text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() =>
                    setToast({
                      type: "success",
                      text: `Notifikasi untuk order ${item.id} berhasil dikirim.`,
                    })
                  }
                />
                <Trash2
                  size={18}
                  className="text-red-400 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() =>
                    setToast({
                      type: "error",
                      text: `Log status order ${item.id} dihapus.`,
                    })
                  }
                />
              </div>
            </div>

            {/* Bottom Row: Details & Status */}
            <div className="px-8 py-6 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[13px] font-bold text-slate-400">
                  Services: <span className="text-slate-500">{item.services}</span>
                </p>
                <p className="text-[14px] font-medium text-slate-500 w-full max-w-2xl leading-relaxed">
                  {item.msg}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between min-w-37.5">
                <span className="text-[12px] font-bold text-slate-400">{item.date}</span>
                <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
