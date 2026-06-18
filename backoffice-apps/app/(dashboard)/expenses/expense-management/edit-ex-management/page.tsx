"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, X } from "lucide-react";

// Import fungsi API
import { getExpenseById, updateExpense } from "@/lib/expense-management";
import { getExpenseCategories } from "@/lib/expense-categori";

function EditExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // State Form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [currentProofUrl, setCurrentProofUrl] = useState("");

  // State Data Pendukung
  const [categories, setCategories] = useState<
    { id: string | number; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Custom Notification (Toast)
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const [expenseData, categoriesData] = await Promise.all([
          getExpenseById(id),
          getExpenseCategories(""),
        ]);

        if (categoriesData) setCategories(categoriesData);

        if (expenseData) {
          setCode(expenseData.code || "");
          setName(expenseData.name || "");

          const catId =
            expenseData.expense_category_id ||
            expenseData.category_id ||
            expenseData.category?.id;
          setCategoryId(catId ? catId.toString() : "");

          setAmount(expenseData.amount?.toString() || "");
          setDate(expenseData.date ? expenseData.date.split(" ")[0] : "");
          setDescription(expenseData.description || "");
          setCurrentProofUrl(expenseData.proof || "");
        } else {
          showNotification("error", "Data tidak ditemukan!");
          setTimeout(() => router.push("/expenses/expense-management"), 2000);
        }
      } catch (error) {
        console.error("Gagal load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleUpdate = async () => {
    if (!id || !name || !amount || !date || !categoryId) {
      showNotification("error", "Harap isi semua kolom yang wajib");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        code,
        name,
        category_id: categoryId,
        amount: amount,
        date,
        description,
      };

      if (proof) {
        payload.proof = proof;
      }

      const success = await updateExpense(id, payload);

      if (success) {
        showNotification(
          "success",
          "Expense data has been successfully updated",
        );
        setTimeout(() => {
          router.push("/expenses/expense-management");
          router.refresh();
        }, 1500);
      } else {
        showNotification(
          "error",
          "Failed to update expense data. Please try again.",
        );
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Terjadi kesalahan sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  const getFileNameDisplay = () => {
    if (proof) return proof.name;
    if (currentProofUrl && !currentProofUrl.includes("no_img.png"))
      return "Receipt.jpg (Current)";
    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`flex items-center justify-between px-5 py-3 rounded-md shadow-lg min-w-87.5 font-medium text-sm border transition-all ${
              toast.type === "success"
                ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                : "bg-[#ffebee] text-[#c62828] border-[#ffcdd2]"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 hover:opacity-70 focus:outline-none"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <h3 className="text-[17px] text-gray-900 font-semibold mb-8">
        Edit Data Expense
      </h3>

      {/* Form Container: 1 Kolom Vertikal */}
      <div className="flex flex-col gap-6">
        {/* Name */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all bg-white"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
            required
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
              Rp
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
              required
            />
          </div>
        </div>

        {/* Receipt (optional) */}
        <div>
          <label className="text-[13px] font-medium text-gray-800 block mb-2">
            Receipt (optional)
          </label>
          <div className="flex items-center w-full border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-1 focus-within:ring-gray-400 transition-all">
            <label className="bg-gray-200/60 hover:bg-gray-200 text-gray-700 text-xs font-medium px-4 py-3 border-r border-gray-300 cursor-pointer transition whitespace-nowrap">
              Choose File
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setProof(e.target.files?.[0] || null)}
              />
            </label>
            <span className="text-sm text-gray-600 px-4 truncate flex-1">
              {getFileNameDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button
          onClick={() => router.back()}
          disabled={isSaving}
          className="px-8 py-2.5 rounded-lg bg-[#86868b] hover:bg-gray-500 disabled:opacity-50 text-white font-medium text-sm transition-all"
        >
          Close
        </button>
        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className="px-8 py-2.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-70 text-white font-medium text-sm transition-all flex items-center justify-center min-w-25"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}

export default function EditExpensePage() {
  return (
    // Memastikan kontainer full width agar otomatis menyebar mengikuti sidebar
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 w-full grow flex justify-start items-start">
      <div className="w-full">
        <Suspense
          fallback={
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          }
        >
          <EditExpenseForm />
        </Suspense>
      </div>
    </div>
  );
}
