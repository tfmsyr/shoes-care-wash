"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard, User, Mail, Phone, Calendar, X } from "lucide-react";

// Import Service terpusat
import { employeeService } from "@/lib/employe";

export default function DetailEmployeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        // Panggil service dari lib
        const data = await employeeService.getEmployeeById(id);

        setEmployee({
          ...data,
          logs: mockLogs, // Tetap gunakan mockLogs sampai API Log tersedia
        });
      } catch (err: any) {
        setError("Gagal memuat detail karyawan. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">
          {error || "Data tidak ditemukan."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* TOP CONTENT: Photo & Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Profile Photo
            </h2>
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200">
              <Image
                src={employee.photo || "/avatar.png"}
                alt="Profile"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 h-full">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Contact Information
              </h2>
              <div className="space-y-6">
                <InfoRow
                  icon={<CreditCard className="w-5 h-5" />}
                  label="NIK"
                  value={employee.nik || "-"}
                />
                <InfoRow
                  icon={<User className="w-5 h-5" />}
                  label="Name"
                  value={employee.name || "-"}
                />
                <InfoRow
                  icon={<Mail className="w-5 h-5" />}
                  label="Email"
                  value={employee.email || "-"}
                />
                <InfoRow
                  icon={<Phone className="w-5 h-5" />}
                  label="Phone"
                  value={employee.phone || "-"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LOG ACTIVITY */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Log Activity</h2>
          <div className="space-y-4">
            {employee.logs?.map((log: any, idx: number) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 rounded-l-xl"></div>
                <div className="pl-4">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                    {log.title}
                  </h3>
                  <p className="text-sm text-gray-500">{log.desc}</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {log.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end items-center gap-4 pt-4">
          <button
            onClick={() => router.back()}
            className="px-8 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-sm"
          >
            Close
          </button>
          <button
            onClick={() =>
              router.push(`/employees/edit-employee?id=${employee.id}`)
            }
            className="px-8 py-2.5 rounded-lg bg-[#3cc13b] hover:bg-[#34a833] text-white font-bold shadow-md shadow-green-200"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 text-gray-700 mb-1 sm:mb-0 w-1/3">
        <span className="text-gray-900">{icon}</span>
        <span className="font-medium text-gray-900 text-sm">{label}</span>
      </div>
      <div className="text-gray-600 font-medium text-sm sm:text-base text-right flex-1 truncate">
        {value}
      </div>
    </div>
  );
}

const mockLogs = [
  { title: "Login", desc: 'Login as "Staff"', date: "March 05 - 12.00 PM" },
  {
    title: "Customer Services",
    desc: "Order #1023 created",
    date: "March 05 - 12.00 PM",
  },
];
