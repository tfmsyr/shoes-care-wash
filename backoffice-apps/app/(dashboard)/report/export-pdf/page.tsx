"use client";

import React, { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CompanyData, getCompanyProfile } from "@/lib/auth";
import { ReportData, reportApi } from "@/lib/report";
import { exportReportToPdf } from "@/utils/reportExport";

export default function ExportPdfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setLoading(true);

      const [reportData, companyData] = await Promise.all([
        reportApi.getReport(undefined, "year"),
        getCompanyProfile(),
      ]);

      await exportReportToPdf(
        reportData.exports.overview,
        companyData as CompanyData | null,
        {
          activeTab: "Overview",
          period: "year",
          generatedAt: new Date(),
          totals: {
            rows: reportData.exports.overview.length,
            amount: reportData.exports.overview.reduce(
              (sum, item) => sum + Number(item.total || 0),
              0,
            ),
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-red-100 rounded-full">
            <FileText size={40} className="text-red-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Export Report PDF</h2>
        <p className="text-gray-500 text-sm mb-8">
          File PDF akan dibuat dari data report terbaru lengkap dengan kop perusahaan dan tabel yang lebih rapi.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Kembali
          </button>
          <button
            onClick={handleExportPdf}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
