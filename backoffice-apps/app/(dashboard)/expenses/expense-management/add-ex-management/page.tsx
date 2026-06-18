"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 1. Import fungsi API
import { createExpense } from "@/lib/expense-management";
import { getExpenseCategories } from "@/lib/expense-categori";

export default function AddExpensePage() {
  const router = useRouter();

  // State form
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("No file chosen");

  // === PERBAIKAN: Tambahkan state untuk menyimpan FILE aslinya ===
  const [proofFile, setProofFile] = useState<File | null>(null);

  // State untuk API & Notifikasi
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk notifikasi custom
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Ambil list kategori saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getExpenseCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Gagal mengambil data kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name); // Untuk tampilan di UI
      setProofFile(file); // === PERBAIKAN: Simpan file aslinya ke state ===
    } else {
      setFileName("No file chosen");
      setProofFile(null);
    }
  }

  // Logika Save menggunakan API
  async function handleSave() {
    // Reset notifikasi setiap kali tombol ditekan
    setNotification(null);

    if (!name || !categoryId || !amount || !date) {
      setNotification({
        type: "error",
        message: "Please fill required fields (Name, Category, Date, Amount)!",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // AMBIL COMPANY ID DARI USER YANG SEDANG LOGIN
      let currentCompanyId = undefined;
      const profileStr = localStorage.getItem("user_profile");
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          currentCompanyId = profile.company_id;
        } catch (e) {
          console.error("Gagal memparsing profil user", e);
        }
      }

      // Payload dinamis berdasarkan user yang login
      const payload = {
        name: name,
        expense_category_id: categoryId,
        amount: amount,
        date: date,
        description: description,
        company_id: currentCompanyId,
        proof: proofFile, // === PERBAIKAN: Masukkan file gambar ke dalam payload API ===
      };

      const success = await createExpense(payload);

      if (success) {
        // Tampilkan notifikasi hijau
        setNotification({
          type: "success",
          message: "Expense data added successfully!",
        });

        // Jeda 1.5 detik agar user bisa membaca notifikasi sebelum pindah halaman
        setTimeout(() => {
          router.push("/expenses/expense-management");
          router.refresh();
        }, 1500);
      } else {
        // Tampilkan notifikasi merah jika backend mengembalikan false
        setNotification({
          type: "error",
          message: "Failed to add expense data. Please try again",
        });
      }
    } catch (error) {
      console.error("Error saat menyimpan:", error);
      // Tampilkan notifikasi merah jika terjadi error (seperti 422 atau 500)
      setNotification({
        type: "error",
        message: "Failed to add expense data. Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 w-full grow">
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        {/* === AREA NOTIFIKASI === */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between text-sm font-medium ${
              notification.type === "success"
                ? "bg-[#dcfce7] text-[#166534]"
                : "bg-[#fee2e2] text-[#991b1b]"
            }`}
          >
            <p>{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className={`text-xl leading-none font-bold ml-4 ${
                notification.type === "success"
                  ? "text-[#16a34a] hover:text-[#15803d]"
                  : "text-[#ef4444] hover:text-[#b91c1c]"
              }`}
            >
              &times;
            </button>
          </div>
        )}
        {/* === END AREA NOTIFIKASI === */}

        <h3 className="text-lg text-gray-900 font-bold mb-8">
          Add New Expense
        </h3>

        <div className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter expense name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            >
              <option value="" disabled>
                Select expense category
              </option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Receipt (Custom File Upload) */}
          <div>
            <label className="text-sm font-medium text-gray-800 block mb-2">
              Receipt (optional)
            </label>
            <div className="flex items-center w-full border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <label className="bg-gray-200/80 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2.5 border-r border-gray-300 cursor-pointer transition">
                Choose File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-sm text-gray-500 px-4 truncate">
                {fileName}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-medium text-sm transition-all"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center min-w-30"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
