"use client";
import { useRouter } from "next/navigation";

export default function ExpensePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center justify-center">
      <div className="text-2xl font-semibold mb-8 text-black text-black-700">
        Expense Menu
      </div>
      <div className="grid grid-cols-2 gap-6 w-125">
        <button
          onClick={() => router.push("/expenses/expense-management")}
          className="bg-white shadow-md border text-black border-gray-200 rounded-2xl py-10 hover:shadow-lg transition text-lg font-medium"
        >
          Expense Management
        </button>
        <button
          onClick={() => router.push("/expenses/expense-categori")}
          className="bg-white shadow-md border text-black border-gray-200 rounded-2xl py-10 hover:shadow-lg transition text-lg font-medium"
        >
          Expense Categories
        </button>
      </div>
    </div>
  );
}
