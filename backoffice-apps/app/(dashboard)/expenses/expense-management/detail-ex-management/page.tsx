"use client";

import { useEffect, useState } from "react";
// Tambahkan useSearchParams untuk berjaga-jaga jika ID didapat dari URL query (?id=...)
import { useRouter, useParams, useSearchParams } from "next/navigation"; 
// Import interface Expense dan fungsi getExpenseById dari lib
import { Expense, getExpenseById } from "@/lib/expense-management"; 

export default function ExpenseDetailPage() {
  const router = useRouter();
  
  // Ambil ID dari URL. Mendukung 2 cara routing Next.js:
  // 1. Path Params (misal: /detail/3)
  const params = useParams();
  const pathId = params?.id as string;
  // 2. Query Params (misal: /detail?id=3)
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  
  // Gunakan ID mana saja yang terdeteksi
  const id = pathId || queryId;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchExpenseDetail = async () => {
      setIsLoading(true);
      try {
        // Panggil fungsi API dari backend Laravel
        const data = await getExpenseById(id);
        setExpense(data);
      } catch (error) {
        console.error("Gagal memuat detail expense:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseDetail();
  }, [id]);

  // Tampilkan loading saat API sedang dipanggil
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  // Tampilkan pesan error jika data tidak ditemukan (dihapus/ID salah)
  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">Data Expense tidak ditemukan.</p>
        <button
          onClick={() => router.push("/expenses/expense-management")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Mengatasi format category dari API (bisa berupa object {id, name} atau string langsung)
  const categoryName = expense.category?.name || expense.category || "-";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border p-8 shadow-sm">
        <h3 className="text-lg text-black font-semibold mb-6">Expense Detail</h3>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Code</p>
            <p className="font-medium text-black">{expense.code}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Name</p>
            <p className="font-medium text-black">{expense.name}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Category</p>
            <p className="font-medium text-black">{categoryName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Amount</p>
            <p className="font-medium text-black">
              Rp {Number(expense.amount).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date</p>
            <p className="font-medium text-black">{expense.date}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 mb-1">Description</p>
            <p className="font-medium text-black">{expense.description || "-"}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() =>
              // Mengarahkan ke halaman edit Sambil mengirim ID parameter dari backend
              router.push(`/expenses/expense-management/edit-ex-management?id=${expense.id}`)
            }
            className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => router.push("/expenses/expense-management")}
            className="px-6 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}