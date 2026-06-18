"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
// IMPORT DIPERBAIKI: Kita panggil createCustomer (sesuai nama di lib/customer.ts)
import { createCustomer } from "@/lib/customer";

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk Notifikasi
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Fungsi untuk menampilkan notif lalu redirect
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    
    if (type === "success") {
      setTimeout(() => {
        router.push("/customers");
      }, 1500);
    } else {
      setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
    }
  };

  const handleSave = async () => {
    // Validasi input
    if (!form.name.trim()) {
      showToast("error", "Failed to add customer. Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // LOGIC DIPERBAIKI: Panggil createCustomer dari lib/customer.ts
      const success = await createCustomer({
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      
      if (success) {
        showToast("success", "Customer added successfully!");
      } else {
        // Karena di lib Anda me-return boolean (false) jika gagal
        showToast("error", "Failed to add customer. Server error or invalid data.");
      }
    } catch (error) {
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] p-6 md:p-8 font-sans text-slate-600">
      
      {/* --- RENDER NOTIFIKASI --- */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
            notification.type === "success" 
            ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]" 
            : "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]"
          }`}>
            {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-70 hover:opacity-100">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <h1 className="text-xl font-bold text-gray-900 mb-6">Add New Customer</h1>

      <Card className="w-full bg-white border border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-8 md:p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-gray-500" /> Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-gray-500" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" /> Address (optional)
              </label>
              <input
                type="text"
                placeholder="Enter full address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-8 h-10 border-none"
              onClick={() => router.push("/customers")}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 h-10 shadow-md transition-all active:scale-95 flex items-center gap-2"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}