"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Phone, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
// Import fungsi dan interface dari lib customer
import { getCustomerById, Customer } from "@/lib/customer";

export default function DetailCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Menangkap ID dari URL (?id=...)

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data dari API saat halaman dimuat
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function loadDetail() {
      setIsLoading(true);
      const data = await getCustomerById(id as string);
      setCustomer(data);
      setIsLoading(false);
    }

    loadDetail();
  }, [id]);

  // Tampilan saat data sedang dimuat (Loading Screen)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex justify-center items-center">
        <div className="flex flex-col items-center text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Memuat detail customer...
        </div>
      </div>
    );
  }

  // Tampilan jika ID tidak valid atau data terhapus
  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col justify-center items-center gap-4">
        <p className="text-gray-500">Data customer tidak ditemukan.</p>
        <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-8 font-sans text-slate-600">
      
      {/* Main Content Card */}
      <Card className="w-full bg-white border border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-8 md:p-10">
          
          {/* SECTION 1: Customer Detail */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Detail</h2>
            
            <div className="space-y-6">
              {/* Name Input (ReadOnly) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  Name
                </label>
                <input
                  type="text"
                  value={customer.name || "-"}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none bg-gray-50"
                />
              </div>

              {/* Phone Input (ReadOnly) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={customer.phone || "-"}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none bg-gray-50"
                />
              </div>

              {/* Address Input (ReadOnly) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  Address (optional)
                </label>
                <input
                  type="text"
                  value={customer.address || "-"}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg h-11 px-4 text-sm text-gray-700 focus:outline-none bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Past Service & Product Orders */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Past Service & Product Orders</h2>
            
            <div className="flex flex-col gap-4">
              {/* Catatan: Bagian ini sementara masih menggunakan dummy UI karena kita belum menghubungkan API Transaksi/Order */}
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="relative flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Blue Accent Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>
                  
                  <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center p-4 pl-6 gap-2 md:gap-0">
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1">
                        Order Services
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Order #1023 (2 pairs of sneakers – Deep Clean)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs md:text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-md self-start md:self-center">
                      <Calendar size={14} />
                      <span>March 05 - 12.00 PM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-8 h-10 text-sm font-medium transition-colors"
              onClick={() => router.back()}
            >
              Close
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 h-10 text-sm font-medium transition-colors shadow-sm"
              // Mengirim ID ke halaman Edit
              onClick={() => router.push(`/customers/edit-customer?id=${customer.id}`)}
            >
              Edit
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}