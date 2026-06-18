"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Globe, User, Pencil, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
// Import helper API
import { getCompanyProfile, CompanyData, getCompanyImageSrc } from "@/lib/auth";

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIC: Ambil data dari API Database ---
  useEffect(() => {
    async function fetchCompany() {
      const data = await getCompanyProfile();
      if (data) {
        setCompany(data);
      }
      setLoading(false);
    }
    fetchCompany();
  }, []);

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-500 font-medium">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 relative min-h-[80vh]">
        
        {/* TOMBOL EDIT */}
        <div className="absolute top-48 right-8 z-10">
          <Link
            href="/company/edit-company"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-blue-100 shadow-lg"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
        </div>

        {/* Company Photo */}
        <div className="flex flex-col items-center mb-12 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Company Photo</p>
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {(company?.logo || company?.photo) ? (
                <Image
                  src={getCompanyImageSrc(company) || ""}
                  alt="Company Logo"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="p-4 opacity-50 flex flex-col items-center">
                   <Image
                    src="/images/placeholder-logo.png" 
                    width={100} 
                    height={100} 
                    alt="Placeholder"
                    className="object-contain"
                   />
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 bg-white border rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="border border-gray-200 rounded-xl p-6 sm:p-8">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Company Information
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            <InfoRow
              icon={<User className="w-4 h-4 text-gray-500" />}
              label="Name"
              value={company?.name || "-"}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4 text-gray-500" />}
              label="Email"
              value={company?.email || "-"}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4 text-gray-500" />}
              label="Phone"
              value={company?.phone || "-"}
            />
            <InfoRow
              icon={<MapPin className="w-4 h-4 text-gray-500" />}
              label="Address"
              value={company?.address || "-"}
            />
            <InfoRow
              icon={<Globe className="w-4 h-4 text-gray-500" />}
              label="Timezone"
              value={company?.timezone || "-"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen InfoRow tetap sama
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <span className="w-5 flex justify-center">{icon}</span>
        <span className="w-32 text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-gray-900 font-medium text-left sm:text-right flex-1 leading-relaxed">
        {value}
      </span>
    </div>
  );
}
