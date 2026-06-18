"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// Import fungsi dari lib API kita
import { getCustomerById, updateCustomer } from "@/lib/customer";

function EditCustomerContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Notifikasi
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  // Fungsi untuk menampilkan notif
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    
    if (type === "success") {
      // Jika sukses, tunggu 1.5 detik baru pindah halaman
      setTimeout(() => {
        router.push("/customers");
      }, 1500);
    } else {
      // Jika error, hilangkan notif saja setelah 3 detik
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  useEffect(() => {
    if (!id) {
      router.push("/customers");
      return;
    }

    async function loadData() {
      setIsLoading(true);
      const data = await getCustomerById(id as string);
      
      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      } else {
        showToast("error", "Customer data not found!");
        setTimeout(() => router.push("/customers"), 2000);
      }
      setIsLoading(false);
    }

    loadData();
  }, [id, router]);

  const handleSave = async () => {
    if (!id) return;
    
    if (!name.trim()) {
      showToast("error", "Name is required!");
      return;
    }

    setIsSaving(true);
    
    const success = await updateCustomer(id, { 
      name, 
      phone, 
      address 
    });

    if (success) {
      showToast("success", "Customer data has been successfully updated");
    } else {
      showToast("error", "Failed to update customer data. Please try again.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex justify-center items-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          Memuat data untuk diedit...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] p-6 md:p-8 font-sans text-slate-600">
      
      {/* --- RENDER NOTIFIKASI (Floating Toast) --- */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
            notification.type === "success" 
            ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]" 
            : "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]"
          }`}>
            {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium text-sm md:text-base">{notification.message}</span>
            <button 
              onClick={() => setNotification((prev) => ({ ...prev, show: false }))} 
              className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Customer</h1>

      <Card className="w-full bg-white border border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-8 md:p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                Address (optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address"
                className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-8 h-10 text-sm font-medium transition-colors"
              onClick={() => router.push("/customers")}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 h-10 text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditCustomerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FC] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <EditCustomerContent />
    </Suspense>
  );
}